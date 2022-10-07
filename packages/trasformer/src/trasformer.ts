// token = a5d3baf313c1b7713a3e6d1dfd0c13986d74ff0b
import { getAllFormSubmissions, OnaApiService, upLoadMarkerColor } from './services';
import { Configs, PriorityLevel, SymbologyConfig } from './types';
import { createInfoLog, createVerboseLog, createWarnLog } from './utils';

/** for each priority level order the symbology on overflow such that the overflow days are in descending order. */
const orderSymbologyConfig = (config: SymbologyConfig) => {
    const OrderedConfig: Record<string, unknown> = {};
    Object.entries(config).forEach(([priorityLevel, value]) => {
        const unorderedOverFlowDays = value.symbologyOnOverflow
        OrderedConfig[priorityLevel] = {
            ...value,
            symbologyOnOverflow: unorderedOverFlowDays.slice().sort((overFlow1, overFlow2) => {return overFlow2.overFlowDays - overFlow1.overFlowDays})
        }
    })
    return OrderedConfig as SymbologyConfig
}

export async function Transform(apiToken: string, config: Configs ){
    // get data from registration form id. -> interests here is the geodata.
    const baseUrl = "https://stage-api.ona.io"
    const {formPair, symbolConfig, logger} = config
    const {registrationFormId, visitformId} = formPair;

    const service = new OnaApiService(baseUrl, apiToken, logger)

    const regFormGeoSubmissions = await getAllFormSubmissions(service, registrationFormId);
    const orderedSymbologyConfig = orderSymbologyConfig(symbolConfig)

    const updateRegFormSubmissionsPromises = regFormGeoSubmissions.map(async regFormSubmission => {
        const facilityId = regFormSubmission._id;
        logger(createVerboseLog(`Start evaluating symbology for submission _id: ${facilityId}`))
        // fetch the most recent visit submission for this facility
        const query = {
            query: `{"facility": ${facilityId}}`, // filter visit submissions for this facility
            sort: '{"date_of_visit": -1}' // sort in descending, most recent first.
        }
        return service.fetchPaginatedFormSubmissions(visitformId, 100, query).then(visitSubmissions => {
            const mostRecentSubmission = visitSubmissions[0];
            let recentVisitDiffToNow = Infinity
            if(mostRecentSubmission !== undefined){
                logger(createInfoLog(`facility _id: ${facilityId} latest visit submission has _id: ${mostRecentSubmission._id}`))
                // assign red as map-color
                const dateOfVisit = Date.parse(mostRecentSubmission.date_of_visit)
                const now  = Date.now();
                const msInADay = (1000 * 60 * 60 * 24)
                recentVisitDiffToNow = Math.ceil((now - dateOfVisit) / msInADay);
            }else{logger(createWarnLog(`facility _id: ${facilityId} has no visit submissions`))}
            
            const symbologyConfig = orderedSymbologyConfig[mostRecentSubmission.priority_level as PriorityLevel]

                    // TODO - re-computed alot of times
            for (const value of symbologyConfig.symbologyOnOverflow){
                const {overFlowDays, color} = value
                if(recentVisitDiffToNow > symbologyConfig.frequency + overFlowDays){
                    if(regFormSubmission["marker-color"] === value){
                        logger(createInfoLog(`facility _id: ${facilityId} submission already has the correct color, no action needed`))
                    }
                    else{

                        return upLoadMarkerColor(service, visitformId, regFormSubmission, color)
                    }
                }
            }
        })
    })

    return Promise.all(updateRegFormSubmissionsPromises).then(() => {
        logger(createInfoLog(`Finished processing `))
    });
}
