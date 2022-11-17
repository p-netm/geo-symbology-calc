import { OnaApiService, upLoadMarkerColor } from './services';
import { Config, RegFormSubmission, VisitFormSubmission } from './types';
import {
  colorDeciderFactory,
  createErrorLog,
  createInfoLog,
  createVerboseLog,
  createWarnLog
} from './utils';
import cron from 'node-cron';
import { dateOfVisitAccessor, markerColorAccessor, numOfSubmissionsAccessor } from './constants';

export const evaluatingTasks: Record<string, Promise<void>> = {};

/** The main function that is able to consume a symbol config, and from it,
 * pull the submissions from the api, after which its able to decide marker-color change
 * and pushes the same to the api.
 *
 * @param config - symbol config
 */
export async function baseEvaluate(config: Omit<Config, 'schedule'>) {
  const { formPair, symbolConfig, logger, baseUrl, apiToken } = config;
  const regFormSubmissionChunks = config['regFormSubmissionChunks'] ?? 1000;
  const { regFormId: registrationFormId, visitFormId: visitformId } = formPair;

  const service = new OnaApiService(baseUrl, apiToken, logger);
  const colorDecider = colorDeciderFactory(symbolConfig, logger);

  const regForm = await service.fetchSingleForm(registrationFormId);
  if (regForm.isFailure) {
    return;
  }
  const regFormSubmissionsNum = regForm.getValue()[numOfSubmissionsAccessor];
  const regFormSubmissionsIterator = service.fetchPaginatedFormSubmissionsGenerator(
    registrationFormId,
    regFormSubmissionsNum,
    {},
    regFormSubmissionChunks
  );

  for await (const regFormSubmissionsResult of regFormSubmissionsIterator) {
    if (regFormSubmissionsResult.isFailure) {
      continue;
    }
    const regFormSubmissions = regFormSubmissionsResult.getValue();
    const updateRegFormSubmissionsPromises = (regFormSubmissions as RegFormSubmission[]).map(
      async (regFormSubmission) => {
        const facilityId = regFormSubmission._id;
        logger?.(createVerboseLog(`Start evaluating symbology for submission _id: ${facilityId}`));
        const query = {
          query: `{"facility": ${facilityId}}`, // filter visit submissions for this facility
          sort: `{"${dateOfVisitAccessor}": -1}` // sort in descending, most recent first.
        };

        // fetch the most recent visit submission for this facility
        return service
          .fetchPaginatedFormSubmissions<VisitFormSubmission>(visitformId, 1, query, 1)
          .then((visitSubmissionsResult) => {
            if (visitSubmissionsResult.isFailure) {
              logger?.(
                createErrorLog(
                  `Operationto fetch submission for facility: ${facilityId} failed with error: ${visitSubmissionsResult.error}`
                )
              );
              return;
            }
            const visitSubmissions = visitSubmissionsResult.getValue();
            const mostRecentSubmission = visitSubmissions[0];
            let recentVisitDiffToNow = Infinity;
            if (mostRecentSubmission !== undefined) {
              logger?.(
                createInfoLog(
                  `facility _id: ${facilityId} latest visit submission has _id: ${mostRecentSubmission._id}`
                )
              );

              const dateOfVisit = Date.parse(mostRecentSubmission[dateOfVisitAccessor]);
              const now = Date.now();
              const msInADay = 1000 * 60 * 60 * 24;
              recentVisitDiffToNow = Math.ceil((now - dateOfVisit) / msInADay);
            } else {
              logger?.(createWarnLog(`facility _id: ${facilityId} has no visit submissions`));
            }

            const color = colorDecider(recentVisitDiffToNow, regFormSubmission);
            if (color) {
              if (regFormSubmission[markerColorAccessor] === color) {
                logger?.(
                  createInfoLog(
                    `facility _id: ${facilityId} submission already has the correct color, no action needed`
                  )
                );
              } else {
                return upLoadMarkerColor(service, registrationFormId, regFormSubmission, color);
              }
            }
          });
      }
    );

    await Promise.allSettled(updateRegFormSubmissionsPromises);
  }

  logger?.(
    createInfoLog(
      `Finished form pair {regFormId: ${config.formPair.regFormId}, visitFormId: ${config.formPair.visitFormId}}`
    )
  );
}

export async function evaluate(config: Omit<Config, 'schedule'>) {
  if (evaluatingTasks[config.uuid] !== undefined) {
    return;
  }
  const aPromise = baseEvaluate(config);
  evaluatingTasks[config.uuid] = aPromise;
  await aPromise.finally(() => {
    delete evaluatingTasks[config.uuid];
  });
}

/** Wrapper around the transform function, calls transform on a schedule */
export function evaluateOnSchedule(config: Config) {
  const { schedule, ...restConfigs } = config;

  const task = cron.schedule(schedule, () =>
    evaluate(restConfigs).catch((err) => {
      config.logger?.(createErrorLog(err.message));
    })
  );
  return task;
}
