import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import merge from 'lodash/merge';
import addMinutes from 'date-fns/addMinutes';
import addDays from 'date-fns/addDays';
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

  describe('Answer new card', () => {
    it('again: it sets dueDate to first step', async () => {
      // Again: Will move the card to first step, show again in one minute (sets in minutes setting)
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
        state: 'NEW',
        currentStep: 0,
        dueDate: now,
      });

      const { mutate } = createTestClient(server);

      const res = await mutate({
        mutation: ANSWER_CARD_MUTATION,
        variables: { cardId, answer: 'again' },
      });
      const settings = Settings.findOne(settingsId);
      const stepsInMinutes = settings.learningSettings.stepsInMinutes;

      assert.notStrictEqual(res.data.answerCard, null);
      assert.strictEqual(res.data.answerCard.currentStep, 0);
      assert.strictEqual(res.data.answerCard.state, 'LEARNING');
      assert.strictEqual(
        res.data.answerCard.dueDate.getTime(),
        addMinutes(now, stepsInMinutes[0]).getTime()
      );
      const deck = Decks.findOne(deckId);
      assert.strictEqual(deck.newCardsToday.numCards, 1);
      timekeeper.reset();
    });

    it('good and not last step: it sets dueDate to next step', async () => {
      // Again: Will move the card to first step, show again in one minute (sets in minutes setting)
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
        state: 'NEW',
        currentStep: 1,
        dueDate: now,
      });

      const { mutate } = createTestClient(server);

      const res = await mutate({
        mutation: ANSWER_CARD_MUTATION,
        variables: { cardId, answer: 'good' },
      });
      const settings = Settings.findOne(settingsId);
      const stepsInMinutes = settings.learningSettings.stepsInMinutes;

      assert.notStrictEqual(res.data.answerCard, null);
      assert.strictEqual(res.data.answerCard.currentStep, 2);
      assert.strictEqual(res.data.answerCard.state, 'LEARNING');
      assert.strictEqual(
        res.data.answerCard.dueDate.getTime(),
        addMinutes(now, stepsInMinutes[2]).getTime()
      );
      assert.notStrictEqual(
        now.getTime(),
        res.data.answerCard.dueDate.getTime()
      );
      const deck = Decks.findOne(deckId);
      assert.strictEqual(deck.newCardsToday.numCards, 1);
      timekeeper.reset();
    });

    it('good and last step: it will graduate card', async () => {
      // Good: Will move the card to the next step. If the step was the last step,
      //       the card graduates and its currentInterval is set to one day (graduating inverval setting)
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
        state: 'NEW',
        currentStep: 2,
        dueDate: now,
      });

      const { mutate } = createTestClient(server);

      const res = await mutate({
        mutation: ANSWER_CARD_MUTATION,
        variables: { cardId, answer: 'good' },
      });
      const settings = Settings.findOne(settingsId);
      const graduatingIntervalInDays =
        settings.learningSettings.graduatingIntervalInDays;

      assert.notStrictEqual(res.data.answerCard, null);
      assert.strictEqual(res.data.answerCard.currentStep, 0);
      assert.strictEqual(res.data.answerCard.state, 'GRADUATED');
      assert.strictEqual(
        res.data.answerCard.currentInterval,
        graduatingIntervalInDays
      );
      assert.strictEqual(
        res.data.answerCard.dueDate.getTime(),
        addDays(now, graduatingIntervalInDays).getTime()
      );
      assert.notStrictEqual(
        now.getTime(),
        res.data.answerCard.dueDate.getTime()
      );
      const deck = Decks.findOne(deckId);
      assert.strictEqual(deck.newCardsToday.numCards, 1);
      timekeeper.reset();
    });
    it('easy: it will graduate card', async () => {
      // Easy: The card graduates immediately and its currentInterval will be set to easyIntervalInDays
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
        state: 'NEW',
        currentStep: 1,
        dueDate: now,
      });

      const { mutate } = createTestClient(server);

      const res = await mutate({
        mutation: ANSWER_CARD_MUTATION,
        variables: { cardId, answer: 'easy' },
      });
      const settings = Settings.findOne(settingsId);
      const easyIntervalInDays = settings.learningSettings.easyIntervalInDays;

      assert.notStrictEqual(res.data.answerCard, null);
      assert.strictEqual(res.data.answerCard.currentStep, 0);
      assert.strictEqual(res.data.answerCard.state, 'GRADUATED');
      assert.strictEqual(
        res.data.answerCard.currentInterval,
        easyIntervalInDays
      );
      assert.strictEqual(
        res.data.answerCard.dueDate.getTime(),
        addDays(now, easyIntervalInDays).getTime()
      );
      assert.notStrictEqual(
        now.getTime(),
        res.data.answerCard.dueDate.getTime()
      );
      const deck = Decks.findOne(deckId);
      assert.strictEqual(deck.newCardsToday.numCards, 1);
      timekeeper.reset();
    });
  });
}
