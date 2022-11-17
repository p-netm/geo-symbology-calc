import { keyBy } from 'lodash-es';
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
import { priorityLevelAccessor } from './constants';

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
    const thisFacilityPriority = submission[priorityLevelAccessor] as PriorityLevel | undefined;

    if (!thisFacilityPriority) {
      logger?.(createWarnLog(`facility _id: ${submission._id} does not have a priority_level`));
      return;
    }

    // TODO - risky coupling.
    const symbologyConfigByPriorityLevel = keyBy(orderedSymbologyConfig, 'priorityLevel');
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
  uuid: yup.string().required('Config does not have an identifier'),
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

/** This is a generic interface that describes the output (or ... Result) of
 * a function.
 *
 * A function can either return Success, or Failure.  The intention is to make
 * it clear that both Success and Failure must be considered and handled.
 *
 * Inspired by https://khalilstemmler.com/articles/enterprise-typescript-nodejs/handling-errors-result-class/
 */
export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error: string;
  private _value: T;

  private constructor(isSuccess: boolean, error?: string, value?: T) {
    if (isSuccess && error) {
      throw new Error(`InvalidOperation: A result cannot be 
        successful and contain an error`);
    }
    if (!isSuccess && !error) {
      throw new Error(`InvalidOperation: A failing result 
        needs to contain an error message`);
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.error = error!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._value = value!;

    Object.freeze(this);
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error(`Cant retrieve the value from a failed result.`);
    }

    return this._value;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }
}
