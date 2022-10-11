import { getAllFormSubmissions, OnaApiService, upLoadMarkerColor } from './services';
import { Configs } from './types';
import { colorDeciderFactory, createInfoLog, createVerboseLog, createWarnLog } from './utils';

export async function transform(config: Configs) {
  const { formPair, symbolConfig, logger, baseUrl, apiToken } = config;
  const { registrationFormId, visitformId } = formPair;

  const service = new OnaApiService(baseUrl, apiToken, logger);

  const regFormGeoSubmissions = await getAllFormSubmissions(service, registrationFormId);
  const colorDecider = colorDeciderFactory(symbolConfig, logger);

  const updateRegFormSubmissionsPromises = regFormGeoSubmissions.map(async (regFormSubmission) => {
    const facilityId = regFormSubmission._id;
    logger(createVerboseLog(`Start evaluating symbology for submission _id: ${facilityId}`));
    // fetch the most recent visit submission for this facility
    const query = {
      query: `{"facility": ${facilityId}}`, // filter visit submissions for this facility
      sort: '{"date_of_visit": -1}' // sort in descending, most recent first.
    };

    return service
      .fetchPaginatedFormSubmissions(visitformId, 100, query)
      .then((visitSubmissions) => {
        const mostRecentSubmission = visitSubmissions[0];
        let recentVisitDiffToNow = Infinity;
        if (mostRecentSubmission !== undefined) {
          logger(
            createInfoLog(
              `facility _id: ${facilityId} latest visit submission has _id: ${mostRecentSubmission._id}`
            )
          );

          const dateOfVisit = Date.parse(mostRecentSubmission.date_of_visit);
          const now = Date.now();
          const msInADay = 1000 * 60 * 60 * 24;
          recentVisitDiffToNow = Math.ceil((now - dateOfVisit) / msInADay);
        } else {
          logger(createWarnLog(`facility _id: ${facilityId} has no visit submissions`));
        }

        const color = colorDecider(recentVisitDiffToNow, regFormSubmission);
        if (color) {
          if (regFormSubmission['marker-color'] === color) {
            logger(
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

  return Promise.all(updateRegFormSubmissionsPromises).then(() => {
    logger(createInfoLog(`Finished processing `));
  });
}
