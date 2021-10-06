import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import shuffle from 'lodash/shuffle';
import sortBy from 'lodash/sortBy';
import { Decks, Cards } from './constants';
import { Settings } from '../settings/constants';
import { updateCard, collectCardStats } from './utils';

const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: 'CardsResolver' }), timestamp(), loggerFormat),
  transports: [new transports.Console()],
});

export default {
  Query: {
    async cardsForDeck(
      _,
      {
        deckId,
        pageNum = 1,
        perPage = 10,
        q = '',
        sort = 'createdAt',
        order = 'asc',
      },
      context
    ) {
      check(deckId, String);
      check(pageNum, Number);
      check(perPage, Number);
      check(q, String);
      check(sort, String);
      check(order, String);
      const user = context.user;
      logger.log({
        level: 'info',
        message: `got cards for deck request from _id ${user && user._id}`,
      });
      const foundUser = user && Meteor.users.findOne(user._id);
      if (!foundUser) {
        logger.log({
          level: 'warn',
          message: `cards for deck requester with ${user._id} is no user`,
        });
        throw new Error('not authorized');
      }
      const foundDeck = Decks.findOne({ _id: deckId, userId: user._id });
      if (!foundDeck) {
        logger.log({
          level: 'warn',
          message: `cards for deck with ${deckId} not found`,
        });
        return { cardsList: [], cardsCount: 0 };
      }
      const skip = perPage * (pageNum - 1);
      const ord = order === 'desc' ? -1 : 1;
      const opt = {};
      opt[sort] = ord;
      let cardsList;
      let cardsCount;
      if (q.length === 0) {
        cardsCount = Cards.find({ deckId: foundDeck._id }).count();
        cardsList = Cards.find(
          { deckId: foundDeck._id },
          { skip, limit: perPage, sort: opt }
        ).fetch();
      } else {
        cardsCount = Cards.find({
          deckId: foundDeck._id,
          $or: [{ front: { $regex: q } }, { back: { $regex: q } }],
        }).count();
        cardsList = Cards.find(
          {
            deckId: foundDeck._id,
            $or: [{ front: { $regex: q } }, { back: { $regex: q } }],
          },
          { skip, limit: perPage, sort: opt }
        ).fetch();
      }
      return {
        cardsList,
        cardsCount,
      };
    },
    async nextCardForLearning(_, args, context) {
      Match.test(args, { deckId: String });
      const user = context.user;
      logger.log({
        level: 'info',
        message: `got next card request from _id ${user && user._id}`,
      });
      const foundUser = user && Meteor.users.findOne(user._id);
      if (!foundUser) {
        logger.log({
          level: 'warn',
          message: `next card requester with ${user._id} is no user`,
        });
        throw new Error('not authorized');
      }
      const { deckId } = args;
      const foundDeck = Decks.findOne({ _id: deckId, userId: user._id });
      if (!foundDeck) {
        logger.log({
          level: 'warn',
          message: `next card for deck with ${deckId} not found`,
        });
        throw new Error('not authorized');
      }
      const settings = Settings.findOne({ userId: user._id });
      const newCards = Cards.find({ deckId, state: 'NEW' }).fetch();
      // new cards first
      // what is the 'new cards per day' setting?
      const newCardsPerDaySetting = settings.learningSettings.newCardsPerDay;
      const newCardsOrderSetting = settings.newCardsOrder;
      let foundCard;
      if (foundDeck.newCardsToday.numCards < newCardsPerDaySetting) {
        // what is the 'new cards order' setting?
        if (newCardsOrderSetting === 'RANDOM') {
          foundCard = shuffle(newCards)[0];
        } else {
          foundCard = sortBy(newCards, 'createdAt')[0];
        }
      }
      if (foundCard) {
        return foundCard;
      } else {
        // all new cards shown or over quota:
        // proceed with other due cards
        const dueCards = Cards.find({
          deckId,
          state: { $ne: 'NEW' },
          dueDate: { $lte: new Date() },
        }).fetch();
        if (dueCards.length !== 0) {
          return dueCards[0];
        } else {
          return null;
        }
      }
    },
  },
  Mutation: {
    async addCard(_, args, context) {
      Match.test(args, { deckId: String, front: String, back: String });
      const user = context.user;
      logger.log({
        level: 'info',
        message: `got add card request from _id ${user && user._id}`,
      });
      const foundUser = user && Meteor.users.findOne(user._id);
      if (!foundUser) {
        logger.log({
          level: 'warn',
          message: `add card requester with ${user._id} is no user`,
        });
        throw new Error('not authorized');
      }
      const { deckId, front, back } = args;
      const foundDeck = Decks.findOne({ _id: deckId, userId: user._id });
      if (!foundDeck) {
        logger.log({
          level: 'warn',
          message: `add card deck with ${deckId} not found`,
        });
        throw new Error('not authorized');
      }
      const settings = Settings.findOne({ userId: user._id });
      const easeFactor = settings.learningSettings.startingEase;
      const dueDate = new Date();
      const id = Cards.insert({
        deckId,
        front,
        back,
        state: 'NEW',
        easeFactor,
        currentInterval: 0,
        currentStep: 0,
        lapseCount: 0,
        dueDate,
        createdAt: new Date(),
      });
      logger.log({
        level: 'info',
        message: `added card with ${id} to deck ${deckId} for user with _id ${user._id}`,
      });
      return collectCardStats(Decks.findOne(deckId));
    },
    async updateCard(_, args, context) {
      Match.test(args, { cardId: String, front: String, back: String });
      const user = context.user;
      logger.log({
        level: 'info',
        message: `got update card request from _id ${user && user._id}`,
      });
      const foundUser = user && Meteor.users.findOne(user._id);
      if (!foundUser) {
        logger.log({
          level: 'warn',
          message: `update card requester with ${user._id} is no user`,
        });
        throw new Error('not authorized');
      }
      const { cardId, front, back } = args;
      const foundCard = Cards.findOne({ _id: cardId });
      const deckId = foundCard && foundCard.deckId;
      const foundDeck = Decks.findOne({ _id: deckId, userId: user._id });
      if (!foundCard || !foundDeck) {
        logger.log({
          level: 'warn',
          message: `update card deck with ${deckId} not found`,
        });
        throw new Error('not authorized');
      }
      Cards.update({ _id: cardId }, { $set: { front, back } });
      logger.log({
        level: 'info',
        message: `updated card with ${cardId} for user with _id ${user._id}`,
      });
      return Cards.findOne(cardId);
    },
    async deleteCard(_, args, context) {
      Match.test(args, { cardId: String });
      const user = context.user;
      logger.log({
        level: 'info',
        message: `got delete card request from _id ${user && user._id}`,
      });
      const foundUser = user && Meteor.users.findOne(user._id);
      if (!foundUser) {
        logger.log({
          level: 'warn',
          message: `delete card requester with ${user._id} is no user`,
        });
        throw new Error('not authorized');
      }
      const { cardId } = args;
      const foundCard = Cards.findOne(cardId);
      if (foundCard) {
        const deckId = foundCard.deckId;
        const foundDeck = Decks.findOne({ _id: deckId, userId: user._id });
        if (!foundDeck) {
          logger.log({
            level: 'warn',
            message: `delete card for ${deckId} not found`,
          });
          return false;
        }
        logger.log({
          level: 'info',
          message: `deleting card with _id ${cardId}`,
        });
        try {
          Cards.remove({ _id: cardId });
          return true;
        } catch (err) {
          logger.log({
            level: 'error',
            message: `deleting card with _id ${cardId} failed: ${JSON.stringify(
              err
            )}`,
          });
          return false;
        }
      } else {
        logger.log({
          level: 'info',
          message: `could not delete card with _id ${cardId}`,
        });
        return false;
      }
    },
    async resetCard(_, args, context) {
      Match.test(args, { cardId: String });
      const user = context.user;
      logger.log({
        level: 'info',
        message: `got reset card request from _id ${user && user._id}`,
      });
      const foundUser = user && Meteor.users.findOne(user._id);
      if (!foundUser) {
        logger.log({
          level: 'warn',
          message: `reset card requester with ${user._id} is no user`,
        });
        throw new Error('not authorized');
      }
      const { cardId } = args;
      const foundCard = Cards.findOne(cardId);
      if (foundCard) {
        const deckId = foundCard.deckId;
        const foundDeck = Decks.findOne({ _id: deckId, userId: user._id });
        if (!foundDeck) {
          logger.log({
            level: 'warn',
            message: `reset card for ${deckId} not found`,
          });
          throw new Error('not authorized');
        }
        logger.log({
          level: 'info',
          message: `resettin card with _id ${cardId}`,
        });
        try {
          const settings = Settings.findOne({ userId: user._id });
          const easeFactor = settings.learningSettings.startingEase;
          const dueDate = new Date();
          Cards.update(
            { _id: cardId },
            {
              $set: {
                state: 'NEW',
                easeFactor,
                currentInterval: 0,
                currentStep: 0,
                lapseCount: 0,
                dueDate,
              },
            }
          );
          return Cards.findOne(cardId);
        } catch (err) {
          logger.log({
            level: 'error',
            message: `resetting card with _id ${cardId} failed: ${JSON.stringify(
              err
            )}`,
          });
          throw new Error('not authorized');
        }
      } else {
        logger.log({
          level: 'info',
          message: `could not reset card with _id ${cardId}`,
        });
        throw new Error('not authorized');
      }
    },
    async answerCard(_, args, context) {
      Match.test(args, { cardId: String, answer: String });
      const user = context.user;
      logger.log({
        level: 'info',
        message: `got add card request from _id ${user && user._id}`,
      });
      const foundUser = user && Meteor.users.findOne(user._id);
      if (!foundUser) {
        logger.log({
          level: 'warn',
          message: `add card requester with ${user._id} is no user`,
        });
        throw new Error('not authorized');
      }
      const { cardId, answer } = args;
      const foundCard = Cards.findOne({ _id: cardId });
      if (!foundCard) {
        logger.log({
          level: 'warn',
          message: `answer card deck with ${cardId} not found`,
        });
        throw new Error('not authorized');
      }
      const foundDeck = Decks.findOne({
        _id: foundCard.deckId,
        userId: foundUser._id,
      });
      if (!foundDeck) {
        logger.log({
          level: 'warn',
          message: `answer card for deck with ${cardId} not found`,
        });
        throw new Error('not authorized');
      }
      const settings = Settings.findOne({ userId: user._id });
      updateCard(settings, foundCard, answer, foundCard.deckId);
      logger.log({
        level: 'info',
        message: `answered card with ${cardId} for user with _id ${user._id}`,
      });
      return Cards.findOne({ _id: cardId });
    },
  },
};
