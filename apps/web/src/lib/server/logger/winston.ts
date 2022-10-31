import { createLogger, transports, format } from 'winston';
import type { LogFn } from '@onaio/symbology-calc-core';
import config from 'config';

const loggerFormatFn = () =>
	format.printf((info) => `${info.label}: ${info.level}: ${[info.timestamp]}: ${info.message}`);

const logger = createLogger({
	transports: [
		// output only errors (level 0) to default error logs file
		new transports.File({
			level: 'error',
			filename: config.get('errorLogFilePath')
		}),
		new transports.File({
			filename: config.get('combinedLogFilePath'),
			level: 'verbose'
		}),
		new transports.Console({
			level: 'silly'
		})
	],
	// handle Uncaught Exceptions
	handleExceptions: true,
	// do not exit on handled exceptions
	exitOnError: false,
	// custom log format
	format: format.combine(
		format.timestamp({
			format: 'MMM-DD-YYYY HH:mm:ss'
		}),
		loggerFormatFn()
	)
});

const geoSymbolLogger: LogFn = (messageObj) => {
	const { message, level } = messageObj;
	logger.log(level, message);
};

export { logger, geoSymbolLogger };
