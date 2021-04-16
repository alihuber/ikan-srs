import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import merge from 'lodash/merge';
import addDays from 'date-fns/addDays';
import addMinutes from 'date-fns/addMinutes';
import timekeeper from 'timekeeper';
import { ApolloServer } from 'apollo-server-express';
import assert from 'assert';
import UserSchema from '../imports/api/users/User.graphql';
import SettingSchema from '../imports/api/settings/Setting.graphql';
import DecksSchema from '../imports/api/decks/Deck.graphql';
import {
  Decks,
  Cards,
  ANSWER_CARD_MUTATION,
} from '../imports/api/decks/constants';
import { Settings, DEFAULT_SETTINGS } from '../imports/api/settings/constants';
import CardsResolver from '../imports/api/decks/card-resolvers';

const { createTestClient } = require('apollo-server-testing');

const typeDefs = [UserSchema, SettingSchema, DecksSchema];

const resolvers = merge(CardsResolver);

if (Meteor.isServer) {
  const constructTestServer = ({ context }) => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context,
    });

    return { server };
  };

  describe('Answer graduated card', () => {
    it('easy: it increases easeFactor and resets currentInterval', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });

      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'testuser', admin: false },
        }),
      });

      const deckId = Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 1,
        newCardsToday: { date: new Date(), numCards: 0 },
      });

      Settings.insert({
        userId,
        ...DEFAULT_SETTINGS,
      });
      const now = new Date();
      timekeeper.freeze(now);
      const cardId = Cards.insert({
        deckId,
        front: 'blaa',
        back: 'blarg',
        createdAt: now,
        state: 'GRADUATED',
        currentStep: 0,
        dueDate: now,
        currentInterval: 2,
        easeFactor: 2.5,
      });

      const { mutate } = createTestClient(server);

      const foundDeck = Decks.findOne({ _id: deckId });
      const foundCard = Cards.findOne({ _id: cardId });
      const currentInterval = foundCard.currentInterval;
      const currentEaseFactor = foundCard.easeFactor;
      const intervalModifier = foundDeck.intervalModifier;

      const res = await mutate({
        mutation: ANSWER_CARD_MUTATION,
        variables: { cardId, answer: 'easy' },
      });

      const easyBonus = 1.3;
      const newInterval =
        currentInterval * currentEaseFactor * intervalModifier * easyBonus;

      assert.notEqual(res.data.answerCard, null);
      assert.equal(res.data.answerCard.currentStep, 0);
      assert.equal(res.data.answerCard.state, 'GRADUATED');
      assert.equal(res.data.answerCard.currentInterval, 6.5);
      assert.equal(res.data.answerCard.easeFactor, 2.65);
      assert.equal(
        res.data.answerCard.dueDate.getTime(),
        addDays(now, newInterval).getTime()
      );
      assert.notEqual(now.getTime(), res.data.answerCard.dueDate.getTime());
      const deck = Decks.findOne(deckId);
      assert.notEqual(deck.newCardsToday.numCards, 1);
      timekeeper.reset();
    });

    it('good: it resets currentInterval, leaves easeFactor unchanged', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });

      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'testuser', admin: false },
        }),
      });

      const deckId = Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 1,
        newCardsToday: { date: new Date(), numCards: 0 },
      });

      Settings.insert({
        userId,
        ...DEFAULT_SETTINGS,
      });
      const now = new Date();
      timekeeper.freeze(now);
      const cardId = Cards.insert({
        deckId,
        front: 'blaa',
        back: 'blarg',
        createdAt: now,
        state: 'GRADUATED',
        currentStep: 0,
        dueDate: now,
        currentInterval: 2,
        easeFactor: 2.5,
      });

      const { mutate } = createTestClient(server);

      const foundDeck = Decks.findOne({ _id: deckId });
      const foundCard = Cards.findOne({ _id: cardId });
      const currentInterval = foundCard.currentInterval;
      const currentEaseFactor = foundCard.easeFactor;
      const intervalModifier = foundDeck.intervalModifier;

      const res = await mutate({
        mutation: ANSWER_CARD_MUTATION,
        variables: { cardId, answer: 'good' },
      });

      const newInterval =
        currentInterval * currentEaseFactor * intervalModifier;

      assert.notEqual(res.data.answerCard, null);
      assert.equal(res.data.answerCard.currentStep, 0);
      assert.equal(res.data.answerCard.state, 'GRADUATED');
      assert.equal(res.data.answerCard.currentInterval, 5);
      assert.equal(res.data.answerCard.easeFactor, 2.5);
      assert.equal(
        res.data.answerCard.dueDate.getTime(),
        addDays(now, newInterval).getTime()
      );
      assert.notEqual(now.getTime(), res.data.answerCard.dueDate.getTime());
      const deck = Decks.findOne(deckId);
      assert.notEqual(deck.newCardsToday.numCards, 1);
      timekeeper.reset();
    });

    it('hard: it resets currentInterval, lowers easeFactor', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });

      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'testuser', admin: false },
        }),
      });

      const deckId = Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 1,
        newCardsToday: { date: new Date(), numCards: 0 },
      });

      Settings.insert({
        userId,
        ...DEFAULT_SETTINGS,
      });
      const now = new Date();
      timekeeper.freeze(now);
      const cardId = Cards.insert({
        deckId,
        front: 'blaa',
        back: 'blarg',
        createdAt: now,
        state: 'GRADUATED',
        currentStep: 0,
        dueDate: now,
        currentInterval: 2,
        easeFactor: 2.5,
      });

      const { mutate } = createTestClient(server);

      const foundDeck = Decks.findOne({ _id: deckId });
      const foundCard = Cards.findOne({ _id: cardId });
      const currentInterval = foundCard.currentInterval;
      const intervalModifier = foundDeck.intervalModifier;

      const res = await mutate({
        mutation: ANSWER_CARD_MUTATION,
        variables: { cardId, answer: 'hard' },
      });

      const newInterval = currentInterval * 1.2 * intervalModifier;

      assert.notEqual(res.data.answerCard, null);
      assert.equal(res.data.answerCard.currentStep, 0);
      assert.equal(res.data.answerCard.state, 'GRADUATED');
      assert.equal(res.data.answerCard.currentInterval, 2.4);
      assert.equal(res.data.answerCard.easeFactor, 2.35);
      assert.equal(
        res.data.answerCard.dueDate.getTime(),
        addDays(now, newInterval).getTime()
      );
      assert.notEqual(now.getTime(), res.data.answerCard.dueDate.getTime());
      const deck = Decks.findOne(deckId);
      assert.notEqual(deck.newCardsToday.numCards, 1);
      timekeeper.reset();
    });

    it('hard: lowers easeFactor only if > 1.3', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });

      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'testuser', admin: false },
        }),
      });

      const deckId = Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 1,
        newCardsToday: { date: new Date(), numCards: 0 },
      });

      Settings.insert({
        userId,
        ...DEFAULT_SETTINGS,
      });
      const now = new Date();
      timekeeper.freeze(now);
      const cardId = Cards.insert({
        deckId,
        front: 'blaa',
        back: 'blarg',
        createdAt: now,
        state: 'GRADUATED',
        currentStep: 0,
        dueDate: now,
        currentInterval: 2,
        easeFactor: 1.4,
      });

      const { mutate } = createTestClient(server);

      const foundDeck = Decks.findOne({ _id: deckId });
      const foundCard = Cards.findOne({ _id: cardId });
      const currentInterval = foundCard.currentInterval;
      const intervalModifier = foundDeck.intervalModifier;

      const res = await mutate({
        mutation: ANSWER_CARD_MUTATION,
        variables: { cardId, answer: 'hard' },
      });

      const newInterval = currentInterval * 1.2 * intervalModifier;

      assert.notEqual(res.data.answerCard, null);
      assert.equal(res.data.answerCard.currentStep, 0);
      assert.equal(res.data.answerCard.state, 'GRADUATED');
      assert.equal(res.data.answerCard.currentInterval, 2.4);
      assert.equal(res.data.answerCard.easeFactor, 1.3);
      assert.equal(
        res.data.answerCard.dueDate.getTime(),
        addDays(now, newInterval).getTime()
      );
      assert.notEqual(now.getTime(), res.data.answerCard.dueDate.getTime());
      const deck = Decks.findOne(deckId);
      assert.notEqual(deck.newCardsToday.numCards, 1);
      timekeeper.reset();
    });

    it('again: move to RELEARNING step, set dueDate to lapse settings step time, decrease ease', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });

      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'testuser', admin: false },
        }),
      });

      const deckId = Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 1,
        newCardsToday: { date: new Date(), numCards: 0 },
      });

      const settingsId = Settings.insert({
        userId,
        ...DEFAULT_SETTINGS,
      });
      const now = new Date();
      timekeeper.freeze(now);
      const cardId = Cards.insert({
        deckId,
        front: 'blaa',
        back: 'blarg',
        createdAt: now,
        state: 'GRADUATED',
        currentStep: 0,
        dueDate: now,
        currentInterval: 2,
        easeFactor: 1.7,
      });

      const { mutate } = createTestClient(server);

      const res = await mutate({
        mutation: ANSWER_CARD_MUTATION,
        variables: { cardId, answer: 'again' },
      });

      const currentSettings = Settings.findOne(settingsId);
      const lapseSettings = currentSettings.lapseSettings;
      const stepInMinutes = lapseSettings.stepInMinutes;

      assert.notEqual(res.data.answerCard, null);
      assert.equal(res.data.answerCard.currentStep, 0);
      assert.equal(res.data.answerCard.state, 'RELEARNING');
      assert.equal(res.data.answerCard.currentInterval, 2);
      assert.equal(res.data.answerCard.easeFactor, 1.5);
      assert.equal(
        addMinutes(now, stepInMinutes).getTime(),
        res.data.answerCard.dueDate.getTime()
      );
      const deck = Decks.findOne(deckId);
      assert.notEqual(deck.newCardsToday.numCards, 1);
      timekeeper.reset();
    });

    it('again: ease can not get lower than 1.3', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });

      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'testuser', admin: false },
        }),
      });

      const deckId = Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 1,
        newCardsToday: { date: new Date(), numCards: 0 },
      });

      const settingsId = Settings.insert({
        userId,
        ...DEFAULT_SETTINGS,
      });
      const now = new Date();
      timekeeper.freeze(now);
      const cardId = Cards.insert({
        deckId,
        front: 'blaa',
        back: 'blarg',
        createdAt: now,
        state: 'GRADUATED',
        currentStep: 0,
        dueDate: now,
        currentInterval: 2,
        easeFactor: 1.4,
      });

      const { mutate } = createTestClient(server);

      const res = await mutate({
        mutation: ANSWER_CARD_MUTATION,
        variables: { cardId, answer: 'again' },
      });

      const currentSettings = Settings.findOne(settingsId);
      const lapseSettings = currentSettings.lapseSettings;
      const stepInMinutes = lapseSettings.stepInMinutes;

      assert.notEqual(res.data.answerCard, null);
      assert.equal(res.data.answerCard.currentStep, 0);
      assert.equal(res.data.answerCard.state, 'RELEARNING');
      assert.equal(res.data.answerCard.currentInterval, 2);
      assert.equal(res.data.answerCard.easeFactor, 1.3);
      assert.equal(
        addMinutes(now, stepInMinutes).getTime(),
        res.data.answerCard.dueDate.getTime()
      );
      const deck = Decks.findOne(deckId);
      assert.notEqual(deck.newCardsToday.numCards, 1);
      timekeeper.reset();
    });
  });
}
