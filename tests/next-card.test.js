import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import merge from 'lodash/merge';
import moment from 'moment';
import { ApolloServer } from 'apollo-server-express';
import assert from 'assert';
import UserSchema from '../imports/api/users/User.graphql';
import SettingSchema from '../imports/api/settings/Setting.graphql';
import DecksSchema from '../imports/api/decks/Deck.graphql';
import { Decks, Cards, ADD_CARD_MUTATION, NEXT_CARD_FOR_LEARNING_QUERY } from '../imports/api/decks/constants';
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

  describe('Next card for learning query', () => {
    it('returns no card if no data found for user', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });

      const { server } = constructTestServer({
        context: () => ({ user: { _id: userId, username: 'testuser', admin: false } }),
      });
      Settings.insert({
        userId,
        ...DEFAULT_SETTINGS,
      });
      const deckId = Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 1,
        newCardsToday: { date: new Date(), numCards: 0 },
      });

      const { query } = createTestClient(server);
      const res = await query({ query: NEXT_CARD_FOR_LEARNING_QUERY, variables: { deckId } });
      assert.equal(res.data.nextCardForLearning, null);
      assert.equal(res.errors, null);
    });

    it.only('returns no card if no due cards found for user', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });

      const { server } = constructTestServer({
        context: () => ({ user: { _id: userId, username: 'testuser', admin: false } }),
      });
      Settings.insert({
        userId,
        ...DEFAULT_SETTINGS,
      });
      const deckId = Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 1,
        newCardsToday: { date: new Date(), numCards: 0 },
      });

      Cards.insert({
        deckId,
        front: 'blaa',
        back: 'blarg',
        createdAt: new Date(),
        state: 'LEARNING',
        currentStep: 0,
        dueDate: moment()
          .add(1, 'day')
          .toDate(),
      });

      const { query } = createTestClient(server);
      const res = await query({ query: NEXT_CARD_FOR_LEARNING_QUERY, variables: { deckId } });
      assert.equal(res.data.nextCardForLearning, null);
      assert.equal(res.errors, null);
    });

    it('returns new cards in order if setting is ADDED', async () => {
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
        intervalModifier: 1,
        newCardsToday: { date: new Date(), numCards: 0 },
      });
      const { query, mutate } = createTestClient(server);

      Settings.insert({
        userId,
        ...DEFAULT_SETTINGS,
      });

      await mutate({
        mutation: ADD_CARD_MUTATION,
        variables: { deckId, front: 'first', back: 'blargh' },
      });

      await mutate({
        mutation: ADD_CARD_MUTATION,
        variables: { deckId, front: 'second', back: 'blargh' },
      });

      const res = await query({ query: NEXT_CARD_FOR_LEARNING_QUERY, variables: { deckId } });
      assert.notEqual(res.data.nextCardForLearning, null);
      assert.equal(res.data.nextCardForLearning.front, 'first');
      const cardId = Cards.find({ front: 'first' }).fetch()[0]._id;
      assert.equal(res.data.nextCardForLearning._id, cardId);
      assert.equal(res.errors, null);
    });

    it('returns new cards in random if setting is RANDOM', async () => {
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
        intervalModifier: 1,
        newCardsToday: { date: new Date(), numCards: 0 },
      });
      const { query, mutate } = createTestClient(server);

      const settingsId = Settings.insert({
        userId,
        ...DEFAULT_SETTINGS,
      });
      Settings.update({ _id: settingsId }, { $set: { newCardsOrder: 'RANDOM' } });

      await mutate({
        mutation: ADD_CARD_MUTATION,
        variables: { deckId, front: 'first', back: 'blargh' },
      });

      await mutate({
        mutation: ADD_CARD_MUTATION,
        variables: { deckId, front: 'second', back: 'blargh' },
      });

      const res = await query({ query: NEXT_CARD_FOR_LEARNING_QUERY, variables: { deckId } });
      assert.notEqual(res.data.nextCardForLearning, null);
      assert.equal(res.errors, null);
    });

    it('returns other cards by dueDate', async () => {
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
        intervalModifier: 1,
        newCardsToday: { date: new Date(), numCards: 1001 },
      });
      const { query, mutate } = createTestClient(server);

      Settings.insert({
        userId,
        ...DEFAULT_SETTINGS,
      });

      await mutate({
        mutation: ADD_CARD_MUTATION,
        variables: { deckId, front: 'first', back: 'blargh' },
      });

      Cards.insert({
        deckId,
        front: 'blaa',
        back: 'blarg',
        createdAt: new Date(),
        state: 'LEARNING',
        currentStep: 0,
        dueDate: moment()
          .subtract(1, 'minute')
          .toDate(),
      });

      const res = await query({ query: NEXT_CARD_FOR_LEARNING_QUERY, variables: { deckId } });
      assert.notEqual(res.data.nextCardForLearning, null);
      assert.equal(res.data.nextCardForLearning.front, 'blaa');
      assert.equal(res.data.nextCardForLearning.currentStep, 0);
      assert.equal(res.errors, null);
    });
  });
}
