import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import merge from 'lodash/merge';
import { ApolloServer } from 'apollo-server-express';
import assert from 'assert';
import moment from 'moment';
import UserSchema from '../imports/api/users/User.graphql';
import SettingSchema from '../imports/api/settings/Setting.graphql';
import DecksSchema from '../imports/api/decks/Deck.graphql';
import { Decks, Cards, DECKS_QUERY, CREATE_DECK_MUTATION, DELETE_DECK_MUTATION, ADD_CARD_MUTATION } from '../imports/api/decks/constants';
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

  describe('Decks query', () => {
    it('returns no decks if no data found for user', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({ user: { _id: 1, username: 'testuser', admin: false } }),
      });
      const { query } = createTestClient(server);
      const res = await query({ query: DECKS_QUERY });
      assert.deepEqual(res.data.decks, []);
    });

    it('returns decks if data found for user', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });

      const { server } = constructTestServer({
        context: () => ({ user: { _id: userId, username: 'testuser', admin: false } }),
      });
      Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 100,
        newCardsToday: { date: new Date(), numCards: 0 },
      });
      Decks.insert({
        userId,
        name: 'deck2',
        createdAt: new Date(),
        intervalModifier: 100,
        newCardsToday: {
          date: new Date(),
          numCards: 0,
        },
      });

      const { query } = createTestClient(server);
      const res = await query({ query: DECKS_QUERY });
      // sorted by createdAt, newest first
      assert.equal(res.data.decks[0].name, 'deck2');
      assert.equal(res.data.decks[1].name, 'deck1');
    });

    it('updates decks if new cards for today were altered', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });

      const { server } = constructTestServer({
        context: () => ({ user: { _id: userId, username: 'testuser', admin: false } }),
      });
      Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 100,
        newCardsToday: { date: new Date(), numCards: 10 },
      });
      Decks.insert({
        userId,
        name: 'deck2',
        createdAt: new Date(),
        intervalModifier: 100,
        newCardsToday: {
          date: moment().subtract(2, 'days'),
          numCards: 19,
        },
      });

      const { query } = createTestClient(server);
      const res = await query({ query: DECKS_QUERY });
      // sorted by createdAt, newest first
      assert.equal(res.data.decks[0].name, 'deck2');
      assert.equal(res.data.decks[1].name, 'deck1');
      assert.equal(res.data.decks[0].newCardsToday.numCards, 0);
      assert.equal(res.data.decks[1].newCardsToday.numCards, 10);
    });
  });

  describe('Create deck mutation', () => {
    it('creates deck for user', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });
      const { server } = constructTestServer({
        context: () => ({ user: { _id: userId, username: 'testuser', admin: false } }),
      });

      const { mutate } = createTestClient(server);
      const res = await mutate({ mutation: CREATE_DECK_MUTATION, variables: { name: 'deck1' } });
      assert.notEqual(res.data.createDeck, null);
      assert.equal(res.errors, null);

      assert.equal(res.data.createDeck.name, 'deck1');
      assert.equal(res.data.createDeck.userId, userId);
      assert.equal(res.data.createDeck.cards, 0);
      assert.equal(res.data.createDeck.newCardsToday.numCards, 0);
    });
  });

  describe('Delete deck mutation', () => {
    it('deletes deck for user', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });
      const { server } = constructTestServer({
        context: () => ({ user: { _id: userId, username: 'testuser', admin: false } }),
      });

      const id = Decks.insert({
        userId,
        name: 'deck1',
        intervalModifier: 100,
        createdAt: new Date(),
        newCardsToday: {
          date: new Date(),
          numCards: 0,
        },
      });

      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: DELETE_DECK_MUTATION,
        variables: { deckId: id },
      });

      assert.equal(res.data.deleteDeck, true);
      const deck = Decks.findOne({ userId: id });
      assert.equal(deck, null);
    });
  });

  describe('Add card mutation', () => {
    it('creates card in deck', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });

      Settings.insert({
        userId,
        ...DEFAULT_SETTINGS,
      });

      const deckId = Decks.insert({
        userId,
        name: 'deck1',
        intervalModifier: 100,
        createdAt: new Date(),
        newCardsToday: {
          date: new Date(),
          numCards: 0,
        },
      });
      const { server } = constructTestServer({
        context: () => ({ user: { _id: userId, username: 'testuser', admin: false } }),
      });

      const { mutate } = createTestClient(server);
      const res = await mutate({ mutation: ADD_CARD_MUTATION, variables: { deckId, front: 'foo', back: 'bar' } });
      assert.notEqual(res.data.addCard, null);
      assert.equal(res.errors, null);

      assert.equal(res.data.addCard.name, 'deck1');
      assert.equal(res.data.addCard.userId, userId);
      assert.equal(res.data.addCard.cards, 1);

      const card = Cards.findOne();
      assert.equal(card.deckId, deckId);
      assert.equal(card.front, 'foo');
      assert.equal(card.back, 'bar');
      assert.equal(card.state, 'NEW');
      assert.equal(card.easeFactor, DEFAULT_SETTINGS.easeFactor);
      assert.equal(card.currentInterval, 0);
    });
  });
}
