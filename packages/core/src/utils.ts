import lodash from 'lodash';
import {
  Config,
  LogFn,
  LogMessageLevels,
  PriorityLevel,
  RegFormSubmission,
  SymbologyConfig
} from './types';
import * as yup from 'yup';
import nodeCron from 'node-cron';

export const createInfoLog = (message: string) => ({ level: LogMessageLevels.INFO, message });
export const createWarnLog = (message: string) => ({ level: LogMessageLevels.WARN, message });
export const createErrorLog = (message: string) => ({ level: LogMessageLevels.ERROR, message });
export const createDebugLog = (message: string) => ({ level: LogMessageLevels.DEBUG, message });
export const createVerboseLog = (message: string) => ({ level: LogMessageLevels.VERBOSE, message });

/** for each priority level order the symbology on overflow such that the overflow days are in ascending order. */
const orderSymbologyConfig = (config: SymbologyConfig) => {
  return config.map(({ priorityLevel, symbologyOnOverflow, frequency }) => {
    const unorderedOverFlowDays = symbologyOnOverflow;
    return {
      priorityLevel,
      frequency,
      symbologyOnOverflow: unorderedOverFlowDays.slice().sort((overFlow1, overFlow2) => {
        return overFlow1.overFlowDays - overFlow2.overFlowDays;
      })
    };
  });
};

export const colorDeciderFactory = (symbolConfig: SymbologyConfig, logger?: LogFn) => {
  const orderedSymbologyConfig = orderSymbologyConfig(symbolConfig);

  const colorDecider = (
    recentVisitDiffToNow: number | typeof Infinity,
    submission: RegFormSubmission
  ) => {
    const thisFacilityPriority = submission.priority_level as PriorityLevel | undefined;

    if (!thisFacilityPriority) {
      logger?.(createWarnLog(`facility _id: ${submission._id} does not have a priority_level`));
      return;
    }

    // TODO - risky coupling.
    const symbologyConfigByPriorityLevel = lodash.keyBy(orderedSymbologyConfig, 'priorityLevel');
    const symbologyConfig = symbologyConfigByPriorityLevel[thisFacilityPriority];

    const overflowsConfig = symbologyConfig.symbologyOnOverflow;
    let colorChoice = overflowsConfig[overflowsConfig.length - 1].color;

    for (const value of overflowsConfig) {
      const { overFlowDays, color } = value;
      if (recentVisitDiffToNow <= symbologyConfig.frequency + overFlowDays) {
        colorChoice = color;
        break;
      }
    }
    return colorChoice;
  };

  return colorDecider;
};

export const configValidationSchema = yup.object().shape({
  baseUrl: yup.string().required('Base Url is required'),
  formPair: yup.object().shape({
    regFormId: yup.string().required('Geo point registration form is required'),
    visitFormId: yup.string().required('Visit form field is required')
  }),
  apiToken: yup.string().required('A valid api token is required'),
  symbolConfig: yup
    .array()
    .of(
      yup.object().shape({
        priorityLevel: yup.string().oneOf(Object.values(PriorityLevel)),
        frequency: yup.number().required('Frequencey is required'),
        symbologyOnOverflow: yup.array().of(
          yup.object().shape({
            overFlowDays: yup.number().required('Over flow days is required'),
            color: yup.string().required('Color code is required.')
          })
        )
      })
    )
    .ensure()
    .min(1),
  schedule: yup
    .string()
    .test('schedule', 'Schedule is not valid cron syntax', function (value?: string) {
      return !!(value && nodeCron.validate(value));
    })
});

export const validateConfigs = (config: Config) => {
  return configValidationSchema.validateSync(config);
};
