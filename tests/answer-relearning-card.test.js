import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import merge from 'lodash/merge';
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

  // relearning card: was graduated, answered 'again'
  // If it is answered correct the next time, its new interval is multiplied with "new interval" setting,
  // if not: increase lapse counter, show again
  describe('Answer relearning card', () => {
    it('again: increase lapse counter, show again in stepInMinutes setting', async () => {
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
        state: 'RELEARNING',
        currentStep: 0,
        lapseCount: 0,
        dueDate: now,
        easeFactor: 1.5,
        currentInterval: 10,
      });

      const { mutate } = createTestClient(server);

      const res = await mutate({
        mutation: ANSWER_CARD_MUTATION,
        variables: { cardId, answer: 'again' },
      });
      const settings = Settings.findOne(settingsId);
      const stepInMinutes = settings.lapseSettings.stepInMinutes;

      assert.notStrictEqual(res.data.answerCard, null);
      assert.strictEqual(res.data.answerCard.currentInterval, 10);
      assert.strictEqual(res.data.answerCard.state, 'RELEARNING');
      assert.strictEqual(res.data.answerCard.lapseCount, 1);
      assert.strictEqual(
        res.data.answerCard.dueDate.getTime(),
        addMinutes(now, stepInMinutes).getTime()
      );
      const deck = Decks.findOne(deckId);
      assert.notStrictEqual(deck.newCardsToday.numCards, 1);
      timekeeper.reset();
    });

    it('good: set new interval to oldInterval * newInterval setting, graduate card', async () => {
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
        state: 'RELEARNING',
        currentStep: 0,
        lapseCount: 0,
        dueDate: now,
        easeFactor: 1.5,
        currentInterval: 10,
      });

      const { mutate } = createTestClient(server);

      const res = await mutate({
        mutation: ANSWER_CARD_MUTATION,
        variables: { cardId, answer: 'good' },
      });

      assert.notStrictEqual(res.data.answerCard, null);
      assert.strictEqual(res.data.answerCard.currentInterval, 7);
      assert.strictEqual(res.data.answerCard.state, 'GRADUATED');
      assert.strictEqual(res.data.answerCard.lapseCount, 0);
      assert.strictEqual(
        res.data.answerCard.dueDate.getTime(),
        addMinutes(now, 7 * 1440).getTime()
      );
      const deck = Decks.findOne(deckId);
      assert.notStrictEqual(deck.newCardsToday.numCards, 1);
      timekeeper.reset();
    });

    it('easy: set new interval to oldInterval * newInterval setting, graduate card', async () => {
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
        state: 'RELEARNING',
        currentStep: 0,
        lapseCount: 0,
        dueDate: now,
        easeFactor: 1.5,
        currentInterval: 10,
      });

      const { mutate } = createTestClient(server);

      const res = await mutate({
        mutation: ANSWER_CARD_MUTATION,
        variables: { cardId, answer: 'easy' },
      });

      assert.notStrictEqual(res.data.answerCard, null);
      assert.strictEqual(res.data.answerCard.currentInterval, 7);
      assert.strictEqual(res.data.answerCard.state, 'GRADUATED');
      assert.strictEqual(res.data.answerCard.lapseCount, 0);
      assert.strictEqual(
        res.data.answerCard.dueDate.getTime(),
        addMinutes(now, 7 * 1440).getTime()
      );
      const deck = Decks.findOne(deckId);
      assert.notStrictEqual(deck.newCardsToday.numCards, 1);
      timekeeper.reset();
    });
  });
}
