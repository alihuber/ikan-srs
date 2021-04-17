import { Meteor } from 'meteor/meteor';
import { Stats } from './constants';

const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: 'StatsResolver' }), timestamp(), loggerFormat),
  transports: [new transports.Console()],
});

export default {
  Query: {
    stats(obj, args, context) {
      const reqUser = context.user;
      logger.log({
        level: 'info',
        message: `got stats request for _id ${reqUser && reqUser._id}`,
      });
      const user = reqUser && Meteor.users.findOne(reqUser._id);
      if (user) {
        return Stats.find({ userId: user._id }, { sort: { date: 1 } });
      } else {
        logger.log({ level: 'info', message: 'user not found, returning []' });
        return [];
      }
    },
  },
};
