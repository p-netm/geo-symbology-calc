export enum LogMessageLevels {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly'
}

export interface LogMessageObject {
  level: LogMessageLevels;
  message: string;
}

export type LogFn = (message: LogMessageObject) => undefined;
export interface Configs {
  formPair: {
    registrationFormId: string;
    visitformId: string;
  };
  symbolConfig: SymbologyConfig;
  logger: LogFn;
}

export enum PriorityLevel {
  VERY_HIGH = 'Very_High',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export type Color = string;

export type SymbologyConfig = {
  [Key in PriorityLevel]: {
    frequency: number;
    symbologyOnOverflow: { overFlowDays: number; color: Color }[];
  };
};
