import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { Decks, Cards } from './constants';
import { Settings } from '../settings/constants';

const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: 'DecksResolver' }), timestamp(), loggerFormat),
  transports: [new transports.Console()],
});

const collectCardStats = deck => {
  const foundCards = Cards.find({ deckId: deck._id }).fetch();
  const cards = foundCards.length;
  const newCards = foundCards.filter(c => c.state === 'NEW').length;
  const learningCards = foundCards.filter(c => c.state === 'LEARNING').length;
  const relearningCards = foundCards.filter(c => c.state === 'RELEARNING').length;
  const graduatedCards = foundCards.filter(c => c.state === 'GRADUATED').length;
  deck.cards = cards;
  deck.newCards = newCards;
  deck.learningCards = learningCards;
  deck.relearningCards = relearningCards;
  deck.graduatedCards = graduatedCards;
  return deck;
};

export default {
  Query: {
    decks(obj, args, context) {
      const reqUser = context.user;
      logger.log({ level: 'info', message: `got decks request for _id ${reqUser && reqUser._id}` });
      const user = reqUser && Meteor.users.findOne(reqUser._id);
      if (user) {
        const foundDecks = Decks.find({ userId: user._id }, { sort: { createdAt: -1 } }).fetch();
        const decks = foundDecks.map(deck => {
          return collectCardStats(deck);
        });
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
      const newId = Decks.insert({ userId: user._id, name: args.name, createdAt: new Date(), intervalModifier: 100 });
      logger.log({ level: 'info', message: `created deck  for user with _id ${user._id}` });
      return collectCardStats(Decks.findOne(newId));
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
          Cards.remove({ deckId });
          return true;
        } catch (err) {
          logger.log({ level: 'error', message: `deleting deck with _id ${deckId} failed: ${JSON.stringify(err)}` });
          return false;
        }
      } else {
        logger.log({ level: 'info', message: `could not delete deck with _id ${deckId}` });
        return false;
      }
    },
    addCard(_, args, context) {
      Match.test(args, { deckId: String, front: String, back: String });
      const user = context.user;
      logger.log({ level: 'info', message: `got add card request from _id ${user && user._id}` });
      const foundUser = user && Meteor.users.findOne(user._id);
      if (!foundUser) {
        logger.log({ level: 'warn', message: `add card requester with ${user._id} is no user` });
        throw new Error('not authorized');
      }
      const { deckId, front, back } = args;
      const foundDeck = Decks.findOne({ _id: deckId, userId: user._id });
      if (!foundDeck) {
        logger.log({ level: 'warn', message: `add card deck with ${deckId} not found` });
        throw new Error('not authorized');
      }
      const settings = Settings.findOne({ userId: user._id });
      const easeFactor = settings.startingEase;
      const dueDate = new Date();
      const id = Cards.insert({ deckId, front, back, state: 'NEW', easeFactor, currentInterval: 0, dueDate });
      logger.log({ level: 'info', message: `added card with ${id} to deck ${deckId} for user with _id ${user._id}` });
      return collectCardStats(Decks.findOne(deckId));
    },
  },
};