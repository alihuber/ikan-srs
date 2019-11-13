import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import merge from 'lodash/merge';
import { ApolloServer } from 'apollo-server-express';
import assert from 'assert';
import UserSchema from '../imports/api/users/User.graphql';
import SettingSchema from '../imports/api/settings/Setting.graphql';
import DecksSchema from '../imports/api/decks/Deck.graphql';
import { Decks, DECKS_QUERY, CREATE_DECK_MUTATION } from '../imports/api/decks/constants';
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
      Decks.insert({ userId, name: 'deck1', cards: [], createdAt: new Date() });
      Decks.insert({ userId, name: 'deck2', cards: [], createdAt: new Date() });

      const { query } = createTestClient(server);
      const res = await query({ query: DECKS_QUERY });
      // sorted by createdAt, newest first
      assert.equal(res.data.decks[0].name, 'deck2');
      assert.equal(res.data.decks[1].name, 'deck1');
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
      assert.deepEqual(res.data.createDeck.cards, []);
    });
  });
}
