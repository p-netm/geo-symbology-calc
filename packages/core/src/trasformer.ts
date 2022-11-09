import { getAllFormSubmissions, OnaApiService, upLoadMarkerColor } from './services';
import { Config, RegFormSubmission, VisitFormSubmission } from './types';
import {
  colorDeciderFactory,
  createErrorLog,
  createInfoLog,
  createVerboseLog,
  createWarnLog
} from './utils';
import cron from 'node-cron';
import { dateOfVisitAccessor, markerColorAccessor } from './constants';

/** The main function that is able to consume a symbol config, and from it,
 * pull the submissions from the api, after which its able to decide marker-color change
 * and pushes the same to the api.
 *
 * @param config - symbol config
 */
export async function transform(config: Omit<Config, 'schedule'>) {
  const { formPair, symbolConfig, logger, baseUrl, apiToken } = config;
  const { regFormId: registrationFormId, visitFormId: visitformId } = formPair;

  const service = new OnaApiService(baseUrl, apiToken, logger);

  const regFormGeoSubmissions = await getAllFormSubmissions<RegFormSubmission>(
    service,
    registrationFormId
  );
  const colorDecider = colorDeciderFactory(symbolConfig, logger);

  const updateRegFormSubmissionsPromises = regFormGeoSubmissions.map(async (regFormSubmission) => {
    const facilityId = regFormSubmission._id;
    logger?.(createVerboseLog(`Start evaluating symbology for submission _id: ${facilityId}`));
    // fetch the most recent visit submission for this facility
    const query = {
      query: `{"facility": ${facilityId}}`, // filter visit submissions for this facility
      sort: `{"${dateOfVisitAccessor}": -1}` // sort in descending, most recent first.
    };

    return service
      .fetchPaginatedFormSubmissions<VisitFormSubmission>(visitformId, 100, query)
      .then((visitSubmissions) => {
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
  });

  return Promise.allSettled(updateRegFormSubmissionsPromises).then(() => {
    logger?.(
      createInfoLog(
        `Finished form pair {regFormId: ${config.formPair.regFormId}, visitFormId: ${config.formPair.visitFormId}}`
      )
    );
  });
}

/** Wrapper around the transform function, calls transform on a schedule */
export function transformOnSchedule(config: Config) {
  const { schedule, ...restConfigs } = config;

  cron.schedule(schedule, () =>
    transform(restConfigs).catch((err) => {
      config.logger?.(createErrorLog(err.message));
    })
  );
}
