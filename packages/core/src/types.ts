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
export type CronTabString = string;
export interface Config {
  formPair: {
    regFormId: string;
    visitFormId: string;
  };
  symbolConfig: SymbologyConfig;
  logger?: LogFn;
  apiToken: string;
  baseUrl: string;
  schedule: CronTabString;
}

export enum PriorityLevel {
  VERY_HIGH = 'Very_High',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export type Color = string;

export type SymbologyConfig = {
  priorityLevel: PriorityLevel;
  frequency: number;
  symbologyOnOverflow: { overFlowDays: number; color: Color }[];
}[];
