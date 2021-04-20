import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import merge from 'lodash/merge';
import timekeeper from 'timekeeper';
import { ApolloServer } from 'apollo-server-express';
import assert from 'assert';
import subDays from 'date-fns/subDays';
import UserSchema from '../imports/api/users/User.graphql';
import SettingSchema from '../imports/api/settings/Setting.graphql';
import DecksSchema from '../imports/api/decks/Deck.graphql';
import {
  Decks,
  Cards,
  DECKS_QUERY,
  DECKS_NAME_QUERY,
  DECK_QUERY,
  CREATE_DECK_MUTATION,
  DELETE_DECK_MUTATION,
  ADD_CARD_MUTATION,
  RESET_DECK_MUTATION,
  RENAME_DECK_MUTATION,
} from '../imports/api/decks/constants';
import { Settings, DEFAULT_SETTINGS } from '../imports/api/settings/constants';
import DecksResolver from '../imports/api/decks/deck-resolvers';
import CardsResolver from '../imports/api/decks/card-resolvers';

const { createTestClient } = require('apollo-server-testing');

const typeDefs = [UserSchema, SettingSchema, DecksSchema];

const resolvers = merge(DecksResolver, CardsResolver);

if (Meteor.isServer) {
  const constructTestServer = ({ context }) => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context,
    });

    return { server };
  };

  describe('DeckNameId query', () => {
    it('returns no data if no data found for user', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: 1, username: 'testuser', admin: false },
        }),
      });
      const { query } = createTestClient(server);
      const res = await query({ query: DECKS_NAME_QUERY });
      assert.deepEqual(res.data.deckNameIds, []);
    });

    it('returns decks if data found for user', async () => {
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
      const deckId1 = Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 1,
        newCardsToday: { date: new Date(), numCards: 0 },
      });
      const deckId2 = Decks.insert({
        userId,
        name: 'deck2',
        createdAt: new Date(),
        intervalModifier: 1,
        newCardsToday: {
          date: new Date(),
          numCards: 0,
        },
      });

      const { query } = createTestClient(server);
      const res = await query({ query: DECKS_NAME_QUERY });
      assert.deepEqual(res.data.deckNameIds, [
        { _id: deckId1, name: 'deck1' },
        { _id: deckId2, name: 'deck2' },
      ]);
    });
  });

  describe('Decks query', () => {
    it('returns no decks if no data found for user', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: 1, username: 'testuser', admin: false },
        }),
      });
      const { query } = createTestClient(server);
      const res = await query({ query: DECKS_QUERY });
      assert.deepEqual(res.data.decks, { decksCount: 0, decksList: [] });
    });

    it('returns decks if data found for user', async () => {
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
      Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 1,
        newCardsToday: { date: new Date(), numCards: 0 },
      });
      Decks.insert({
        userId,
        name: 'deck2',
        createdAt: new Date(),
        intervalModifier: 1,
        newCardsToday: {
          date: new Date(),
          numCards: 0,
        },
      });

      const { query } = createTestClient(server);
      const res = await query({ query: DECKS_QUERY });
      // sorted by createdAt, newest first
      assert.equal(res.data.decks.decksCount, 2);
      assert.equal(res.data.decks.decksList[0].name, 'deck2');
      assert.equal(res.data.decks.decksList[1].name, 'deck1');
    });

    it('updates decks if new cards for today were altered', async () => {
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
      Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 1,
        newCardsToday: { date: new Date(), numCards: 10 },
      });
      Decks.insert({
        userId,
        name: 'deck2',
        createdAt: new Date(),
        intervalModifier: 1,
        newCardsToday: {
          date: subDays(new Date(), 2),
          numCards: 19,
        },
      });

      const { query } = createTestClient(server);
      const res = await query({ query: DECKS_QUERY });
      // sorted by createdAt, newest first
      assert.equal(res.data.decks.decksCount, 2);
      assert.equal(res.data.decks.decksList[0].name, 'deck2');
      assert.equal(res.data.decks.decksList[1].name, 'deck1');
      assert.equal(res.data.decks.decksList[0].newCardsToday.numCards, 0);
      assert.equal(res.data.decks.decksList[1].newCardsToday.numCards, 10);
    });

    it('returns max 5 results', async () => {
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
      for (let i = 0; i < 10; i++) {
        Decks.insert({
          userId,
          name: `deck${i}`,
          createdAt: new Date(`2021-01-0${i}`),
          intervalModifier: 1,
          newCardsToday: { date: new Date(), numCards: 0 },
        });
      }

      const { query } = createTestClient(server);
      const res = await query({ query: DECKS_QUERY });
      assert.equal(res.data.decks.decksCount, 10);
      assert.equal(res.data.decks.decksList.length, 5);
    });

    it('returns paginated results', async () => {
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
      for (let i = 0; i < 10; i++) {
        Decks.insert({
          userId,
          name: `deck${i}`,
          createdAt: new Date(`2021-01-0${i}`),
          intervalModifier: 1,
          newCardsToday: { date: new Date(), numCards: 0 },
        });
      }

      const { query } = createTestClient(server);
      const res = await query({
        query: DECKS_QUERY,
        variables: { pageNum: 2 },
      });
      assert.equal(res.data.decks.decksList.length, 5);
      assert.equal(res.data.decks.decksCount, 10);
      // desc ordering: 4, 3, 2, 1, 0 on second page
      assert.equal(res.data.decks.decksList[0].name, 'deck4');
    });

    it('returns asc sorted results', async () => {
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
      for (let i = 0; i < 10; i++) {
        Decks.insert({
          userId,
          name: `deck${i}`,
          createdAt: new Date(`2021-01-0${i}`),
          intervalModifier: 1,
          newCardsToday: { date: new Date(), numCards: 0 },
        });
      }

      const { query } = createTestClient(server);
      const res = await query({
        query: DECKS_QUERY,
        variables: { pageNum: 2, order: 'asc' },
      });
      assert.equal(res.data.decks.decksList.length, 5);
      assert.equal(res.data.decks.decksCount, 10);
      assert.equal(res.data.decks.decksList[0].name, 'deck5');
    });

    it('returns filtered results', async () => {
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
      for (let i = 0; i < 10; i++) {
        Decks.insert({
          userId,
          name: `deck${i}`,
          createdAt: new Date(`2021-01-0${i}`),
          intervalModifier: 1,
          newCardsToday: { date: new Date(), numCards: 0 },
        });
      }

      const { query } = createTestClient(server);
      const res = await query({ query: DECKS_QUERY, variables: { q: '2' } });
      assert.equal(res.data.decks.decksCount, 1);
      assert.equal(res.data.decks.decksList[0].name, 'deck2');
    });
  });

  describe('Deck query', () => {
    it('returns no deck if no data found for user', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: 1, username: 'testuser', admin: false },
        }),
      });
      const { query } = createTestClient(server);
      const res = await query({
        query: DECK_QUERY,
        variables: { deckId: 'foo123' },
      });
      assert.deepEqual(res.data.deckQuery, null);
    });

    it('returns deck if data found for user', async () => {
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

      const { query } = createTestClient(server);
      const res = await query({ query: DECK_QUERY, variables: { deckId } });
      assert.equal(res.data.deckQuery.name, 'deck1');
      assert.deepEqual(res.data.deckQuery.cards, []);
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
        context: () => ({
          user: { _id: userId, username: 'testuser', admin: false },
        }),
      });

      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: CREATE_DECK_MUTATION,
        variables: { name: 'deck1' },
      });
      assert.notEqual(res.data.createDeck, null);
      assert.equal(res.errors, null);

      assert.equal(res.data.createDeck.name, 'deck1');
      assert.equal(res.data.createDeck.userId, userId);
      assert.deepEqual(res.data.createDeck.cards, []);
      assert.equal(res.data.createDeck.numCards, 0);
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
        context: () => ({
          user: { _id: userId, username: 'testuser', admin: false },
        }),
      });

      const id = Decks.insert({
        userId,
        name: 'deck1',
        intervalModifier: 1,
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

  describe('Reset deck mutation', () => {
    it('resets all card data of deck', async () => {
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

      Settings.insert({
        userId,
        ...DEFAULT_SETTINGS,
      });
      const now = new Date();
      timekeeper.freeze(now);

      const deckId = Decks.insert({
        userId,
        name: 'deck1',
        intervalModifier: 1,
        createdAt: new Date(),
        newCardsToday: {
          date: new Date(),
          numCards: 0,
        },
      });

      const { mutate } = createTestClient(server);
      const res1 = await mutate({
        mutation: ADD_CARD_MUTATION,
        variables: { deckId, front: 'foo', back: 'bar' },
      });
      const res2 = await mutate({
        mutation: ADD_CARD_MUTATION,
        variables: { deckId, front: 'foo2', back: 'bar2' },
      });
      assert.notEqual(res1.data.addCard, null);
      assert.equal(res1.errors, null);
      assert.notEqual(res2.data.addCard, null);
      assert.equal(res2.errors, null);
      Cards.update({}, { $set: { state: 'LEARNING' } }, { multi: true });
      const card = Cards.findOne();
      assert.equal(card.state, 'LEARNING');

      const res = await mutate({
        mutation: RESET_DECK_MUTATION,
        variables: { deckId },
      });

      const settings = Settings.findOne({ userId });
      const easeFactor = settings.learningSettings.startingEase;

      assert.equal(res.data.resetDeck.cards[0].front, 'foo');
      assert.equal(res.data.resetDeck.cards[0].back, 'bar');
      assert.equal(res.data.resetDeck.cards[0].state, 'NEW');
      assert.equal(res.data.resetDeck.cards[0].easeFactor, easeFactor);
      assert.equal(res.data.resetDeck.cards[0].currentInterval, 0);
      assert.equal(res.data.resetDeck.cards[0].currentStep, 0);
      assert.equal(res.data.resetDeck.cards[0].lapseCount, 0);
      assert.equal(
        res.data.resetDeck.cards[0].dueDate.getTime(),
        now.getTime()
      );

      assert.equal(res.data.resetDeck.cards[1].front, 'foo2');
      assert.equal(res.data.resetDeck.cards[1].back, 'bar2');
      assert.equal(res.data.resetDeck.cards[1].state, 'NEW');
      assert.equal(res.data.resetDeck.cards[1].easeFactor, easeFactor);
      assert.equal(res.data.resetDeck.cards[1].currentInterval, 0);
      assert.equal(res.data.resetDeck.cards[1].currentStep, 0);
      assert.equal(res.data.resetDeck.cards[1].lapseCount, 0);
      assert.equal(
        res.data.resetDeck.cards[1].dueDate.getTime(),
        now.getTime()
      );
      timekeeper.reset();
    });
  });

  describe('rename deck mutation', () => {
    it('renames a deck', async () => {
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

      Settings.insert({
        userId,
        ...DEFAULT_SETTINGS,
      });

      const deckId = Decks.insert({
        userId,
        name: 'deck1',
        intervalModifier: 1,
        createdAt: new Date(),
        newCardsToday: {
          date: new Date(),
          numCards: 0,
        },
      });

      const { mutate } = createTestClient(server);
      const newName = 'renamed';
      const res = await mutate({
        mutation: RENAME_DECK_MUTATION,
        variables: { deckId, name: newName },
      });

      assert.equal(res.data.renameDeck.name, 'renamed');
    });
  });
}
