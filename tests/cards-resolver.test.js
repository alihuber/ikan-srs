import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import merge from 'lodash/merge';
import timekeeper from 'timekeeper';
import { ApolloServer } from 'apollo-server-express';
import assert from 'assert';
import UserSchema from '../imports/api/users/User.graphql';
import SettingSchema from '../imports/api/settings/Setting.graphql';
import DecksSchema from '../imports/api/decks/Deck.graphql';
import {
  Decks,
  Cards,
  CARDS_FOR_DECK_QUERY,
  ADD_CARD_MUTATION,
  DELETE_CARD_MUTATION,
  UPDATE_CARD_MUTATION,
  RESET_CARD_MUTATION,
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

  describe('Cards for deck query', () => {
    it('returns no cards if no data found for user', async () => {
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
      const { query } = createTestClient(server);
      const res = await query({
        query: CARDS_FOR_DECK_QUERY,
        variables: { deckId: 'foo123' },
      });
      assert.deepStrictEqual(res.data.cardsForDeck.cardsList, []);
    });

    it('returns cards if data found for user', async () => {
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
        intervalModifier: 1,
        createdAt: new Date(),
        newCardsToday: {
          date: new Date(),
          numCards: 0,
        },
      });

      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'testuser', admin: false },
        }),
      });

      const { query, mutate } = createTestClient(server);
      const res1 = await mutate({
        mutation: ADD_CARD_MUTATION,
        variables: { deckId, front: 'foo', back: 'bar' },
      });
      assert.notStrictEqual(res1.data.addCard, undefined);
      assert.strictEqual(res1.errors, undefined);

      const res = await query({
        query: CARDS_FOR_DECK_QUERY,
        variables: { deckId },
      });
      assert.notDeepStrictEqual(res.data.cardsForDeck.cardsList, []);
      assert.strictEqual(res.data.cardsForDeck.cardsList[0].front, 'foo');
      assert.strictEqual(res.data.cardsForDeck.cardsList[0].back, 'bar');
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
        intervalModifier: 1,
        createdAt: new Date(),
        newCardsToday: {
          date: new Date(),
          numCards: 0,
        },
      });
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'testuser', admin: false },
        }),
      });

      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: ADD_CARD_MUTATION,
        variables: { deckId, front: 'foo', back: 'bar' },
      });
      assert.notStrictEqual(res.data.addCard, undefined);
      assert.strictEqual(res.errors, undefined);

      assert.strictEqual(res.data.addCard.name, 'deck1');
      assert.strictEqual(res.data.addCard.userId, userId);
      assert.strictEqual(res.data.addCard.cards[0].front, 'foo');
      assert.strictEqual(res.data.addCard.cards[0].back, 'bar');
      assert.strictEqual(res.data.addCard.numCards, 1);

      const card = Cards.findOne();
      assert.strictEqual(card.deckId, deckId);
      assert.strictEqual(card.front, 'foo');
      assert.strictEqual(card.back, 'bar');
      assert.strictEqual(card.state, 'NEW');
      assert.strictEqual(
        card.easeFactor,
        DEFAULT_SETTINGS.learningSettings.startingEase
      );
      assert.strictEqual(card.currentInterval, 0);
      assert.strictEqual(card.currentStep, 0);
      assert.strictEqual(card.lapseCount, 0);
    });
  });

  describe('Delete card mutation', () => {
    it('deletes card from deck', async () => {
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
      const res1 = await mutate({
        mutation: ADD_CARD_MUTATION,
        variables: { deckId, front: 'foo', back: 'bar' },
      });
      assert.notStrictEqual(res1.data.addCard, undefined);
      assert.strictEqual(res1.errors, undefined);
      const cardId = Cards.find({}).fetch()[0]._id;

      const res = await mutate({
        mutation: DELETE_CARD_MUTATION,
        variables: { cardId },
      });

      assert.strictEqual(res.data.deleteCard, true);
      const card = Cards.findOne(cardId);
      assert.strictEqual(card, undefined);
    });
  });

  describe('Reset card mutation', () => {
    it('resets card data', async () => {
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
      assert.notStrictEqual(res1.data.addCard, undefined);
      assert.strictEqual(res1.errors, undefined);
      const cardId = Cards.find({}).fetch()[0]._id;

      const res = await mutate({
        mutation: RESET_CARD_MUTATION,
        variables: { cardId },
      });

      const settings = Settings.findOne({ userId });
      const easeFactor = settings.learningSettings.startingEase;

      assert.strictEqual(res.data.resetCard.front, 'foo');
      assert.strictEqual(res.data.resetCard.back, 'bar');
      assert.strictEqual(res.data.resetCard.state, 'NEW');
      assert.strictEqual(res.data.resetCard.easeFactor, easeFactor);
      assert.strictEqual(res.data.resetCard.currentInterval, 0);
      assert.strictEqual(res.data.resetCard.currentStep, 0);
      assert.strictEqual(res.data.resetCard.lapseCount, 0);
      assert.strictEqual(res.data.resetCard.dueDate.getTime(), now.getTime());
      timekeeper.reset();
    });
  });

  describe('Update card mutation', () => {
    it('updates card in deck', async () => {
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
        intervalModifier: 1,
        createdAt: new Date(),
        newCardsToday: {
          date: new Date(),
          numCards: 0,
        },
      });
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'testuser', admin: false },
        }),
      });

      const { mutate } = createTestClient(server);
      const res1 = await mutate({
        mutation: ADD_CARD_MUTATION,
        variables: { deckId, front: 'foo', back: 'bar' },
      });
      assert.notStrictEqual(res1.data.addCard, undefined);
      assert.strictEqual(res1.errors, undefined);

      const cardId = Cards.find({}).fetch()[0]._id;
      const res = await mutate({
        mutation: UPDATE_CARD_MUTATION,
        variables: { cardId, front: 'newf', back: 'newb' },
      });

      assert.strictEqual(res.data.updateCard.front, 'newf');
      assert.strictEqual(res.data.updateCard.back, 'newb');
    });
  });
}
