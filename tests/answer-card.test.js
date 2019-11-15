import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import merge from 'lodash/merge';
import moment from 'moment';
import timekeeper from 'timekeeper';
import { ApolloServer } from 'apollo-server-express';
import assert from 'assert';
import UserSchema from '../imports/api/users/User.graphql';
import SettingSchema from '../imports/api/settings/Setting.graphql';
import DecksSchema from '../imports/api/decks/Deck.graphql';
import { Decks, Cards, ADD_CARD_MUTATION, ANSWER_CARD_MUTATION } from '../imports/api/decks/constants';
import { Settings, DEFAULT_SETTINGS } from '../imports/api/settings/constants';
import DecksResolver from '../imports/api/decks/resolvers';

const { createTestClient } = require('apollo-server-testing');

const typeDefs = [UserSchema, SettingSchema, DecksSchema];

const resolvers = merge(DecksResolver);

if (Meteor.isServer) {
  const constructTestServer = ({ context }) => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context,
    });

    return { server };
  };

  describe('Answer learning/new/relearning card', () => {
    it('again: it sets dueDate to first step', async () => {
      // Again: Will move the card to first step, show again in one minute (sets in minutes setting)
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });

      const { server } = constructTestServer({
        context: () => ({ user: { _id: userId, username: 'testuser', admin: false } }),
      });

      const deckId = Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 100,
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

      assert.notEqual(res.data.answerCard, null);
      assert.equal(res.data.answerCard.currentStep, 0);
      assert.equal(res.data.answerCard.state, 'LEARNING');
      assert.equal(
        res.data.answerCard.dueDate.getTime(),
        moment(now)
          .add(stepsInMinutes[0], 'minutes')
          .toDate()
          .getTime()
      );
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
        context: () => ({ user: { _id: userId, username: 'testuser', admin: false } }),
      });

      const deckId = Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 100,
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
        state: 'LEARNING',
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

      assert.notEqual(res.data.answerCard, null);
      assert.equal(res.data.answerCard.currentStep, 2);
      assert.equal(res.data.answerCard.state, 'LEARNING');
      assert.equal(
        res.data.answerCard.dueDate.getTime(),
        moment(now)
          .add(stepsInMinutes[2], 'minutes')
          .toDate()
          .getTime()
      );
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
        context: () => ({ user: { _id: userId, username: 'testuser', admin: false } }),
      });

      const deckId = Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 100,
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
        currentStep: 2,
        dueDate: now,
      });

      const { mutate } = createTestClient(server);

      const res = await mutate({
        mutation: ANSWER_CARD_MUTATION,
        variables: { cardId, answer: 'good' },
      });
      const settings = Settings.findOne(settingsId);
      const graduatingIntervalInDays = settings.learningSettings.graduatingIntervalInDays;

      assert.notEqual(res.data.answerCard, null);
      assert.equal(res.data.answerCard.currentStep, 0);
      assert.equal(res.data.answerCard.state, 'GRADUATED');
      assert.equal(res.data.answerCard.currentInterval, graduatingIntervalInDays);
      assert.equal(
        res.data.answerCard.dueDate.getTime(),
        moment(now)
          .add(graduatingIntervalInDays, 'days')
          .toDate()
          .getTime()
      );
      timekeeper.reset();
    });
    // TODO:
  });
}
