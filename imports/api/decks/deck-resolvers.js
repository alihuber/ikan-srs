import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import moment from 'moment';
import { Decks, Cards } from './constants';
import { Settings } from '../settings/constants';
import { collectCardStats } from './utils';

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
      logger.log({
        level: 'info',
        message: `got decks request for _id ${reqUser && reqUser._id}`,
      });
      const user = reqUser && Meteor.users.findOne(reqUser._id);
      if (user) {
        const foundDecks = Decks.find({ userId: user._id }).fetch();
        const todayStart = moment().startOf('day');
        const todayEnd = moment().endOf('day');
        foundDecks.map((deck) => {
          const isToday = moment(deck.newCardsToday.date).isBetween(
            todayStart,
            todayEnd
          );
          if (!isToday) {
            const newCardsToday = { date: new Date(), numCards: 0 };
            Decks.update({ _id: deck._id }, { $set: { newCardsToday } });
          }
        });
        const updatedDecks = Decks.find(
          { userId: user._id },
          { sort: { createdAt: -1 } }
        ).fetch();
        const decks = updatedDecks.map((deck) => {
          return collectCardStats(deck);
        });
        if (decks && decks.length !== 0) {
          logger.log({
            level: 'info',
            message: `found decks for user with _id ${user._id}`,
          });
          return decks;
        } else {
          logger.log({
            level: 'info',
            message: `found no decks for user with _id ${user._id}`,
          });
          return [];
        }
      } else {
        logger.log({ level: 'info', message: 'user not found, returning []' });
        return [];
      }
    },
    deckQuery(_, args, context) {
      Match.test(args, { deckId: String });
      const { deckId } = args;
      const reqUser = context.user;
      logger.log({
        level: 'info',
        message: `got deck request from _id ${reqUser && reqUser._id}`,
      });
      const user = reqUser && Meteor.users.findOne(reqUser._id);
      if (!user) {
        logger.log({
          level: 'warn',
          message: `delete user requester with _id ${user._id} is not found`,
        });
        throw new Error('not authorized');
      }
      const deck = Decks.findOne({ _id: deckId, userId: user._id });
      const foundCards = Cards.find({ deckId: deck._id }).fetch();
      if (deck) {
        logger.log({ level: 'info', message: `found deck with _id ${deckId}` });
        deck.cards = foundCards;
        return deck;
      } else {
        logger.log({
          level: 'info',
          message: `could not delete deck with _id ${deckId}`,
        });
        return false;
      }
    },
  },
  Mutation: {
    renameDeck(_, args, context) {
      const user = context.user;
      const deckId = args.deckId;
      logger.log({
        level: 'info',
        message: `got rename deck request from _id ${
          user && user._id
        } for deck ${deckId}`,
      });
      const foundUser = user && Meteor.users.findOne(user._id);
      if (!foundUser) {
        logger.log({
          level: 'warn',
          message: `rename deck requester with ${user._id} is no user`,
        });
        throw new Error('not authorized');
      }
      const deckToRename = Decks.findOne({ _id: deckId, userId: user._id });
      if (deckToRename) {
        logger.log({
          level: 'info',
          message: `renaming deck with _id ${deckId}`,
        });
        try {
        } catch (err) {
          logger.log({
            level: 'error',
            message: `renmming deck with _id ${deckId} failed: ${JSON.stringify(
              err
            )}`,
          });
          throw new Error('not authorized');
        }
      } else {
        logger.log({
          level: 'info',
          message: `could not rename deck with _id ${deckId}`,
        });
        throw new Error('not authorized');
      }
      Decks.update({ _id: deckId }, { $set: { name: args.name } });
      logger.log({
        level: 'info',
        message: `renamed deck  for user with _id ${user._id} with ${deckId}`,
      });
      return collectCardStats(Decks.findOne(deckId));
    },
    createDeck(_, args, context) {
      Match.test(args, { name: String });
      const user = context.user;
      logger.log({
        level: 'info',
        message: `got create deck request from _id ${user && user._id}`,
      });
      const foundUser = user && Meteor.users.findOne(user._id);
      if (!foundUser) {
        logger.log({
          level: 'warn',
          message: `create deck requester with ${user._id} is no user`,
        });
        throw new Error('not authorized');
      }
      const newId = Decks.insert({
        userId: user._id,
        name: args.name,
        createdAt: new Date(),
        intervalModifier: 1,
        newCardsToday: {
          date: new Date(),
          numCards: 0,
        },
      });
      logger.log({
        level: 'info',
        message: `created deck  for user with _id ${user._id}`,
      });
      return collectCardStats(Decks.findOne(newId));
    },
    deleteDeck(_, args, context) {
      Match.test(args, { deckId: String });
      const { deckId } = args;
      const reqUser = context.user;
      logger.log({
        level: 'info',
        message: `got deleteDeck request from _id ${reqUser && reqUser._id}`,
      });
      const user = reqUser && Meteor.users.findOne(reqUser._id);
      if (!user) {
        logger.log({
          level: 'warn',
          message: `delete deck requester with _id ${user._id} is not found`,
        });
        throw new Error('not authorized');
      }
      const deckToDelete = Decks.findOne({ _id: deckId, userId: user._id });
      if (deckToDelete) {
        logger.log({
          level: 'info',
          message: `deleting deck with _id ${deckId}`,
        });
        try {
          Decks.remove({ _id: deckId });
          Cards.remove({ deckId });
          return true;
        } catch (err) {
          logger.log({
            level: 'error',
            message: `deleting deck with _id ${deckId} failed: ${JSON.stringify(
              err
            )}`,
          });
          return false;
        }
      } else {
        logger.log({
          level: 'info',
          message: `could not delete deck with _id ${deckId}`,
        });
        return false;
      }
    },
    resetDeck(_, args, context) {
      Match.test(args, { deckId: String });
      const { deckId } = args;
      const reqUser = context.user;
      logger.log({
        level: 'info',
        message: `got resetDeck request from _id ${reqUser && reqUser._id}`,
      });
      const user = reqUser && Meteor.users.findOne(reqUser._id);
      if (!user) {
        logger.log({
          level: 'warn',
          message: `reset deck requester with _id ${user._id} is not found`,
        });
        throw new Error('not authorized');
      }
      const deckToReset = Decks.findOne({ _id: deckId, userId: user._id });
      if (deckToReset) {
        logger.log({
          level: 'info',
          message: `resetting deck with _id ${deckId}`,
        });
        try {
          const settings = Settings.findOne({ userId: user._id });
          const easeFactor = settings.learningSettings.startingEase;
          const dueDate = new Date();
          Cards.update(
            { deckId },
            {
              $set: {
                state: 'NEW',
                easeFactor,
                currentInterval: 0,
                currentStep: 0,
                lapseCount: 0,
                dueDate,
              },
            },
            { multi: true }
          );
          const updatedCards = Cards.find({ deckId }).fetch();
          deckToReset.cards = updatedCards;
          return deckToReset;
        } catch (err) {
          logger.log({
            level: 'error',
            message: `resetting deck with _id ${deckId} failed: ${JSON.stringify(
              err
            )}`,
          });
          throw new Error('not authorized');
        }
      } else {
        logger.log({
          level: 'info',
          message: `could not reset deck with _id ${deckId}`,
        });
        throw new Error('not authorized');
      }
    },
  },
};
