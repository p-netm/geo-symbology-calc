import { LogFn, LogMessageLevels, PriorityLevel, SymbologyConfig } from './types';

export const createInfoLog = (message: string) => ({ level: LogMessageLevels.INFO, message });
export const createWarnLog = (message: string) => ({ level: LogMessageLevels.WARN, message });
export const createErrorLog = (message: string) => ({ level: LogMessageLevels.ERROR, message });
export const createDebugLog = (message: string) => ({ level: LogMessageLevels.DEBUG, message });
export const createVerboseLog = (message: string) => ({ level: LogMessageLevels.VERBOSE, message });

/** for each priority level order the symbology on overflow such that the overflow days are in ascending order. */
const orderSymbologyConfig = (config: SymbologyConfig) => {
  const OrderedConfig: Record<string, unknown> = {};
  Object.entries(config).forEach(([priorityLevel, value]) => {
    const unorderedOverFlowDays = value.symbologyOnOverflow;
    OrderedConfig[priorityLevel] = {
      ...value,
      symbologyOnOverflow: unorderedOverFlowDays.slice().sort((overFlow1, overFlow2) => {
        return overFlow1.overFlowDays - overFlow2.overFlowDays;
      })
    };
  });
  return OrderedConfig as SymbologyConfig;
};

export const colorDeciderFactory = (symbolConfig: SymbologyConfig, logger: LogFn) => {
  const orderedSymbologyConfig = orderSymbologyConfig(symbolConfig);

  const colorDecider = (
    recentVisitDiffToNow: number | typeof Infinity,
    submission: Record<string, unknown>
  ) => {
    const thisFacilityPriority = submission.priority_level as PriorityLevel | undefined;

    if (!thisFacilityPriority) {
      logger(createWarnLog(`facility _id: ${submission._id} does not have a priority_level`));
      return;
    }

    // TODO - risky coupling.
    const symbologyConfig = orderedSymbologyConfig[thisFacilityPriority];

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
