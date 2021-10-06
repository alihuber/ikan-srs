import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { DeckNotification } from './constants';

const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(
    label({ label: 'DeckNotificationResolver' }),
    timestamp(),
    loggerFormat
  ),
  transports: [new transports.Console()],
});

export default {
  Query: {
    async deckNotifications(_, __, context) {
      const reqUser = context.user;
      logger.log({
        level: 'info',
        message: `got deckNotifications request for _id ${
          reqUser && reqUser._id
        }`,
      });
      const user = reqUser && Meteor.users.findOne(reqUser._id);
      if (user) {
        const res = DeckNotification.find({
          userId: reqUser._id,
          $or: [{ fetched: false }, { fetched: { $exists: false } }],
        }).fetch();
        logger.log({
          level: 'info',
          message: `found ${res.length} notifications for user ${reqUser._id}`,
        });
        return res;
      } else {
        logger.log({ level: 'info', message: 'user not found, returning []' });
        return [];
      }
    },
  },
  Mutation: {
    async markAsFetched(_, args, context) {
      Match.test(args, { notificationId: String });
      const user = context.user;
      const notificationId = args.notificationId;
      logger.log({
        level: 'info',
        message: `got markAsFetched request from _id ${
          user && user._id
        } for notification ${notificationId}`,
      });
      const foundUser = user && Meteor.users.findOne(user._id);
      if (!foundUser) {
        logger.log({
          level: 'warn',
          message: `markAsFetched requester with ${user._id} is no user`,
        });
        throw new Error('not authorized');
      }
      const notificationToMark = DeckNotification.findOne({
        _id: notificationId,
        userId: user._id,
      });
      if (notificationToMark) {
        logger.log({
          level: 'info',
          message: `marking notification with _id ${notificationId}`,
        });
        try {
          DeckNotification.update(
            { _id: notificationId },
            { $set: { fetched: true } }
          );
          logger.log({
            level: 'info',
            message: `marked deckNotification for user with _id ${user._id} with ${notificationId}`,
          });
          return true;
        } catch (err) {
          logger.log({
            level: 'error',
            message: `marking notification with _id ${notificationId} failed: ${JSON.stringify(
              err
            )}`,
          });
          return false;
        }
      } else {
        logger.log({
          level: 'info',
          message: `could not mark notification with _id ${notificationId}`,
        });
        return false;
      }
    },
  },
};
