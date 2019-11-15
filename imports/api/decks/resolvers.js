import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { Decks } from './constants';

const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: 'DecksResolver' }), timestamp(), loggerFormat),
  transports: [new transports.Console()],
});

export default {
  Query: {
    decks(obj, args, context) {
      const reqUser = context.user;
      logger.log({ level: 'info', message: `got decks request for _id ${reqUser && reqUser._id}` });
      const user = reqUser && Meteor.users.findOne(reqUser._id);
      if (user) {
        const decks = Decks.find({ userId: user._id }, { sort: { createdAt: -1 } }).fetch();
        if (decks && decks.length !== 0) {
          logger.log({ level: 'info', message: `found decks for user with _id ${user._id}` });
          return decks;
        } else {
          logger.log({ level: 'info', message: `found no decks for user with _id ${user._id}` });
          return [];
        }
      } else {
        logger.log({ level: 'info', message: 'user not found, returning {}' });
        return [];
      }
    },
  },
  Mutation: {
    createDeck(_, args, context) {
      Match.test(args, { name: String });
      const user = context.user;
      logger.log({ level: 'info', message: `got create deck request from _id ${user && user._id}` });
      const foundUser = user && Meteor.users.findOne(user._id);
      if (!foundUser) {
        logger.log({ level: 'warn', message: `create deck requester with ${user._id} is no user` });
        throw new Error('not authorized');
      }
      const newId = Decks.insert({ userId: user._id, name: args.name, cards: [], createdAt: new Date() });
      logger.log({ level: 'info', message: `created deck  for user with _id ${user._id}` });
      return Decks.findOne(newId);
    },
    deleteDeck(_, args, context) {
      Match.test(args, { deckId: String });
      const { deckId } = args;
      const reqUser = context.user;
      logger.log({ level: 'info', message: `got deleteDeck request from _id ${reqUser && reqUser._id}` });
      const user = reqUser && Meteor.users.findOne(reqUser._id);
      if (!user) {
        logger.log({ level: 'warn', message: `delete user requester with _id ${user._id} is not found` });
        throw new Error('not authorized');
      }
      const deckToDelete = Decks.findOne({ _id: deckId, userId: user._id });
      if (deckToDelete) {
        logger.log({ level: 'info', message: `deleting deck with _id ${deckId}` });
        try {
          Decks.remove({ _id: deckId });
          return true;
        } catch (err) {
          logger.log({ level: 'err', message: `deleting deck with _id ${deckId} failed: ${JSON.stringify(err)}` });
          return false;
        }
      } else {
        logger.log({ level: 'info', message: `could not delete deck with _id ${deckId}` });
        return false;
      }
    },
  },
};
