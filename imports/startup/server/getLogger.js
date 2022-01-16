const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

export const getLogger = (classLabel) => {
  return createLogger({
    format: combine(label({ label: classLabel }), timestamp(), loggerFormat),
    transports: [new transports.Console()],
  });
};
