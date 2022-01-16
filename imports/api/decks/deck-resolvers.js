import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import startOfDay from 'date-fns/startOfDay';
import endOfDay from 'date-fns/endOfDay';
import isWithinInterval from 'date-fns/isWithinInterval';
import groupBy from 'lodash/groupBy';
import { Decks, Cards } from './constants';
import { Settings } from '../settings/constants';
import { collectCardStats } from './utils';
import { getLogger } from '../../startup/server/getLogger';

const logger = getLogger('DecksResolver');

export default {
  Query: {
    async deckNameIds(_, __, context) {
      const reqUser = context.user;
      logger.log({
        level: 'info',
        message: `got deckNameIds request for _id ${reqUser && reqUser._id}`,
      });
      const user = reqUser && Meteor.users.findOne(reqUser._id);
      if (user) {
        return Decks.find(
          { userId: reqUser._id },
          { fields: { name: 1, _id: 1 } }
        ).fetch();
      } else {
        logger.log({ level: 'info', message: 'user not found, returning []' });
        return [];
      }
    },
    async decks(_, { pageNum = 1, q = '', order = 'desc' }, context) {
      check(pageNum, Number);
      check(q, String);
      check(order, String);
      const reqUser = context.user;
      logger.log({
        level: 'info',
        message: `got decks request for _id ${reqUser && reqUser._id}`,
      });
      const user = reqUser && Meteor.users.findOne(reqUser._id);
      if (user) {
        const skip = 5 * (pageNum - 1);
        const ord = order === 'desc' ? -1 : 1;
        const opt = {};
        opt['createdAt'] = ord;
        let foundDecks = [];
        if (q.length === 0) {
          foundDecks = Decks.find({ userId: user._id }).fetch();
        } else {
          foundDecks = Decks.find({
            name: { $regex: q },
            userId: user._id,
          }).fetch();
        }
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());
        foundDecks.map((deck) => {
          const isToday = isWithinInterval(deck.newCardsToday.date, {
            start: todayStart,
            end: todayEnd,
          });
          if (!isToday) {
            const newCardsToday = { date: new Date(), numCards: 0 };
            Decks.update({ _id: deck._id }, { $set: { newCardsToday } });
          }
        });
        let updatedDecks = [];
        if (q.length === 0) {
          updatedDecks = Decks.find(
            { userId: user._id },
            {
              skip,
              limit: 5,
              sort: opt,
            }
          ).fetch();
        } else {
          updatedDecks = Decks.find(
            { name: { $regex: q }, userId: user._id },
            {
              skip,
              limit: 5,
              sort: opt,
            }
          ).fetch();
        }
        const deckswithStats = updatedDecks.map((deck) => {
          return collectCardStats(deck);
        });
        if (deckswithStats && deckswithStats.length !== 0) {
          logger.log({
            level: 'info',
            message: `found decks for user with _id ${user._id}`,
          });
          return {
            decksCount: foundDecks.length,
            decksList: deckswithStats,
          };
        } else {
          logger.log({
            level: 'info',
            message: `found no decks for user with _id ${user._id}`,
          });
          return { decksCount: 0, decksList: [] };
        }
      } else {
        logger.log({ level: 'info', message: 'user not found, returning []' });
        return { decksCount: 0, decksList: [] };
      }
    },
    async deckQuery(_, args, context) {
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
          message: `deck requester with _id ${user._id} is not found`,
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
          message: `could find deck deck with _id ${deckId}`,
        });
        return false;
      }
    },
    async learnable(_, __, context) {
      const reqUser = context.user;
      if (!reqUser) {
        logger.log({
          level: 'warn',
          message: `learnable user requester with _id ${reqUser._id} is not found`,
        });
        throw new Error('not authorized');
      }
      logger.log({
        level: 'info',
        message: `got learnable request from _id ${reqUser._id}`,
      });
      const deckIdsForUser = Decks.find({ userId: reqUser._id }, { _id: 1 })
        .fetch()
        .map((d) => d._id);
      const dueCards = Cards.find({
        deckId: { $in: deckIdsForUser },
        dueDate: { $lte: new Date() },
      }).fetch();
      const res = [];
      if (dueCards.length !== 0) {
        const deckGroups = groupBy(dueCards, 'deckId');
        Object.keys(deckGroups).forEach((deckId) => {
          const deck = Decks.findOne(deckId);
          const nextDueCard = Array.from(deckGroups[deckId]).sort((a, b) => {
            return (
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );
          })[0].dueDate;
          res.push({
            _id: deckId,
            name: deck.name,
            dueCards: deckGroups[deckId].length,
            nextDueCard,
          });
        });
      }
      logger.log({
        level: 'info',
        message: `found ${res.length} learnable decks for user ${reqUser._id}`,
      });
      return res;
    },
    async nextDueCard(_, args, context) {
      Match.test(args, { deckId: String });
      const reqUser = context.user;
      const { deckId } = args;
      if (!reqUser) {
        logger.log({
          level: 'warn',
          message: `card requester with _id ${reqUser._id} is not found`,
        });
        throw new Error('not authorized');
      }
      logger.log({
        level: 'info',
        message: `got next due card request from _id ${reqUser._id}`,
      });
      const deckForUser = Decks.findOne(
        { userId: reqUser._id, _id: deckId },
        { cards: 1 }
      );
      if (!deckForUser) {
        logger.log({
          level: 'warn',
          message: `card requester with _id ${reqUser._id} is not found`,
        });
        throw new Error('not authorized');
      }
      const cards = Cards.find({ deckId }).fetch();
      const nextDueCard = cards.sort((a, b) => {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })[0];
      if (nextDueCard) {
        return {
          _id: nextDueCard._id,
          dueDate: nextDueCard.dueDate,
        };
      } else {
        return {};
      }
    },
  },
  Mutation: {
    async renameDeck(_, args, context) {
      const user = context.user;
      Match.test(args, { deckId: String });
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
          Decks.update({ _id: deckId }, { $set: { name: args.name } });
          logger.log({
            level: 'info',
            message: `renamed deck  for user with _id ${user._id} with ${deckId}`,
          });
        } catch (err) {
          logger.log({
            level: 'error',
            message: `renaming deck with _id ${deckId} failed: ${JSON.stringify(
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
      return collectCardStats(Decks.findOne(deckId));
    },
    async createDeck(_, args, context) {
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
    async deleteDeck(_, args, context) {
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
    async resetDeck(_, args, context) {
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
