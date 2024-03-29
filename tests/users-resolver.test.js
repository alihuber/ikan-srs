import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import merge from 'lodash/merge';
import { ApolloServer } from 'apollo-server-express';
import { Accounts } from 'meteor/accounts-base';
import assert from 'assert';
import UserSchema from '../imports/api/users/User.graphql';
import {
  USERS_QUERY,
  CURRENT_USER_QUERY,
  CREATE_USER_MUTATION,
  UPDATE_USER_MUTATION,
  DELETE_USER_MUTATION,
} from '../imports/api/users/constants';
import UserResolver from '../imports/api/users/resolvers';
import { Settings, DEFAULT_SETTINGS } from '../imports/api/settings/constants';
import { Decks, Cards } from '../imports/api/decks/constants';

const { createTestClient } = require('apollo-server-testing');

const typeDefs = [UserSchema];

const resolvers = merge(UserResolver);

if (Meteor.isServer) {
  const constructTestServer = ({ context }) => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context,
    });

    return { server };
  };

  describe('Users query', () => {
    it('fetches list of users if admin queries the database', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'admin',
        password: 'adminadmin',
      });
      Meteor.users.update({ _id: userId }, { $set: { admin: true } });
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'admin', admin: true },
        }),
      });
      const { query } = createTestClient(server);
      const res = await query({ query: USERS_QUERY });
      assert.strictEqual(res.data.users.usersList.length, 1);
      assert.strictEqual(res.data.users.usersCount, 1);
      Accounts.createUser({
        username: 'testuser',
        password: 'example123',
      });
      const res2 = await query({ query: USERS_QUERY });
      assert.strictEqual(res2.data.users.usersList.length, 2);
      assert.strictEqual(res2.data.users.usersCount, 2);
    });

    it('fetches no users if normal user queries the database', async () => {
      resetDatabase();
      Accounts.createUser({
        username: 'admin',
        password: 'adminadmin',
      });
      const userId = Accounts.createUser({
        username: 'testuser',
        password: 'example123',
      });
      const { server } = constructTestServer({
        context: () => ({ user: { _id: userId, username: 'testuser' } }),
      });
      const { query } = createTestClient(server);
      const res = await query({ query: USERS_QUERY });
      assert.strictEqual(res.data.users.usersList.length, 0);
    });
  });

  describe('Current user query', () => {
    it('returns no information about the current user if no user', async () => {
      resetDatabase();
      Accounts.createUser({
        username: 'foouser',
        password: 'example123',
      });
      const { server } = constructTestServer({
        context: () => ({ user: { _id: '1', username: 'foouser' } }),
      });
      const { query } = createTestClient(server);
      const res = await query({ query: CURRENT_USER_QUERY });
      assert.strictEqual(res.data.currentUser.username, null);
      assert.strictEqual(res.data.currentUser.admin, null);
    });

    it('fetches information about the current user if user', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'foouser',
        password: 'example123',
      });
      const { server } = constructTestServer({
        context: () => ({ user: { _id: userId, username: 'foouser' } }),
      });
      const { query } = createTestClient(server);
      const res = await query({ query: CURRENT_USER_QUERY });
      assert.strictEqual(res.data.currentUser.username, 'foouser');
      assert.strictEqual(res.data.currentUser.admin, null);
    });
  });

  describe('Create user mutation', () => {
    it('throws error if non-admin calls mutation', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'noadmin',
        password: 'example123',
      });
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'noadmin', admin: null },
        }),
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: CREATE_USER_MUTATION,
        variables: {
          username: 'newuser',
          password: 'newpassword',
          admin: false,
        },
      });
      assert.strictEqual(res.errors[0].message, 'not authorized');
      assert.strictEqual(res.errors[0].path[0], 'createUser');
    });

    it('throws error if param is missing', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({ user: { _id: 1, username: 'admin', admin: true } }),
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: CREATE_USER_MUTATION,
        variables: { password: 'newpassword', admin: false },
      });
      assert.strictEqual(
        res.errors[0].message,
        'Variable "$username" of required type "String!" was not provided.'
      );
    });

    it('creates an admin user', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'admin',
        password: 'adminadmin',
      });
      Meteor.users.update({ _id: userId }, { $set: { admin: true } });
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'admin', admin: true },
        }),
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: CREATE_USER_MUTATION,
        variables: {
          username: 'newuser',
          password: 'newpassword',
          admin: true,
        },
      });
      assert.strictEqual(res.data.createUser.username, 'newuser');
      assert.strictEqual(res.data.createUser.admin, true);

      const { query } = createTestClient(server);
      const res2 = await query({ query: USERS_QUERY });
      assert.strictEqual(res2.data.users.usersList.length, 2);
      assert.strictEqual(res2.data.users.usersCount, 2);
    });

    it('creates an non-admin user', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'admin',
        password: 'adminadmin',
      });
      Meteor.users.update({ _id: userId }, { $set: { admin: true } });
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'admin', admin: true },
        }),
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: CREATE_USER_MUTATION,
        variables: {
          username: 'newuser',
          password: 'newpassword',
          admin: false,
        },
      });
      assert.strictEqual(res.data.createUser.username, 'newuser');
      assert.strictEqual(res.data.createUser.admin, null);

      const { query } = createTestClient(server);
      const res2 = await query({ query: USERS_QUERY });
      assert.strictEqual(res2.data.users.usersList.length, 2);
      assert.strictEqual(res2.data.users.usersCount, 2);
    });

    it('creates default settings for user', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'admin',
        password: 'adminadmin',
      });
      Meteor.users.update({ _id: userId }, { $set: { admin: true } });
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'admin', admin: true },
        }),
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: CREATE_USER_MUTATION,
        variables: {
          username: 'newuser',
          password: 'newpassword',
          admin: false,
        },
      });
      assert.strictEqual(res.data.createUser.username, 'newuser');
      assert.strictEqual(res.data.createUser.admin, null);
      const newUserId = res.data.createUser._id;

      const { query } = createTestClient(server);
      const res2 = await query({ query: USERS_QUERY });
      assert.strictEqual(res2.data.users.usersList.length, 2);
      assert.strictEqual(res2.data.users.usersCount, 2);
      const settings = Settings.findOne({ userId: newUserId });
      assert.strictEqual(settings.lapseSettings.newInterval, 0.7);
      assert.strictEqual(settings.lapseSettings.leechAction, 'TAG');
      assert.strictEqual(settings.learningSettings.startingEase, 2.5);
      assert.strictEqual(settings.learningSettings.newCardsOrder, 'ADDED');
      assert.deepStrictEqual(settings.learningSettings.stepsInMinutes, [
        15,
        1440,
        8640,
      ]);
    });
  });

  describe('Update user mutation', () => {
    it('throws error if non-admin calls mutation', async () => {
      resetDatabase();
      const id = Accounts.createUser({
        username: 'testuser',
        password: 'example123',
      });
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: id, username: 'noadmin', admin: null },
        }),
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: UPDATE_USER_MUTATION,
        variables: {
          userId: id,
          username: 'changeduser',
          password: 'newpassword',
          admin: false,
        },
      });
      assert.strictEqual(res.errors[0].message, 'not authorized');
      assert.strictEqual(res.errors[0].path[0], 'updateUser');
    });

    it('throws error if username param is missing', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({ user: { _id: 1, username: 'admin', admin: true } }),
      });
      const id = Accounts.createUser({
        username: 'testuser',
        password: 'example123',
      });
      Meteor.users.update({ _id: id }, { $set: { admin: true } });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: UPDATE_USER_MUTATION,
        variables: { userId: id, password: 'newpassword', admin: false },
      });
      assert.strictEqual(
        res.errors[0].message,
        'Variable "$username" of required type "String!" was not provided.'
      );
    });

    it('throws no error if password param is missing', async () => {
      resetDatabase();
      const adminId = Accounts.createUser({
        username: 'admin',
        password: 'adminadmin',
      });
      const id = Accounts.createUser({
        username: 'testuser',
        password: 'example123',
      });
      Meteor.users.update({ _id: adminId }, { $set: { admin: true } });
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: adminId, username: 'admin', admin: true },
        }),
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: UPDATE_USER_MUTATION,
        variables: { userId: id, username: 'changed', admin: false },
      });
      assert.strictEqual(res.errors, undefined);
    });

    it('updates an user and resets the password', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'admin',
        password: 'adminadmin',
      });
      const otherUserId = Accounts.createUser({
        username: 'testuser',
        password: 'abc123',
      });
      Meteor.users.update({ _id: userId }, { $set: { admin: true } });
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'admin', admin: true },
        }),
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: UPDATE_USER_MUTATION,
        variables: {
          userId: otherUserId,
          username: 'newuser',
          password: 'newpassword',
          admin: false,
        },
      });
      assert.strictEqual(res.data.updateUser.username, 'newuser');
      assert.strictEqual(res.data.updateUser.admin, false);

      const { query } = createTestClient(server);
      const res2 = await query({ query: USERS_QUERY });
      assert.strictEqual(res2.data.users.usersList.length, 2);
      assert.strictEqual(res2.data.users.usersCount, 2);
      assert.strictEqual(res2.data.users.usersList[1].username, 'newuser');
      assert.strictEqual(res2.data.users.usersList[1].admin, false);
    });
  });

  describe('Delete user mutation', () => {
    it('throws error if non-admin calls mutation', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        password: 'abc123',
      });
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'testuser', admin: null },
        }),
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: DELETE_USER_MUTATION,
        variables: { userId: '1' },
      });
      assert.strictEqual(res.errors[0].message, 'not authorized');
      assert.strictEqual(res.errors[0].path[0], 'deleteUser');
    });

    it('returns null if called with non-existent userId', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({ user: { _id: 1, username: 'admin', admin: true } }),
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: DELETE_USER_MUTATION,
        variables: { userId: 'abc123' },
      });
      assert.strictEqual(res.data.deleteUser, null);
    });

    it('deletes an user', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'admin',
        password: 'adminadmin',
      });
      Meteor.users.update({ _id: userId }, { $set: { admin: true } });
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'admin', admin: true },
        }),
      });
      const id = Accounts.createUser({
        username: 'testuser',
        admin: true,
        password: 'example123',
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: DELETE_USER_MUTATION,
        variables: { userId: id },
      });
      assert.strictEqual(res.data.deleteUser, true);

      const { query } = createTestClient(server);
      const res2 = await query({ query: USERS_QUERY });
      assert.strictEqual(res2.data.users.usersList.length, 1);
      assert.strictEqual(res2.data.users.usersCount, 1);
    });

    it('deletes settings for user', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'admin',
        password: 'adminadmin',
      });
      Meteor.users.update({ _id: userId }, { $set: { admin: true } });
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'admin', admin: true },
        }),
      });
      const id = Accounts.createUser({
        username: 'testuser',
        admin: true,
        password: 'example123',
      });
      Settings.insert({
        userId: id,
        ...DEFAULT_SETTINGS,
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: DELETE_USER_MUTATION,
        variables: { userId: id },
      });
      assert.strictEqual(res.data.deleteUser, true);

      const { query } = createTestClient(server);
      const res2 = await query({ query: USERS_QUERY });
      assert.strictEqual(res2.data.users.usersList.length, 1);
      assert.strictEqual(res2.data.users.usersCount, 1);

      const settings = Settings.findOne({ userId: id });
      assert.strictEqual(settings, undefined);
    });

    it('deletes decks and cards for user', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'admin',
        password: 'adminadmin',
      });
      Meteor.users.update({ _id: userId }, { $set: { admin: true } });
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'admin', admin: true },
        }),
      });
      const id = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });
      const deckId = Decks.insert({
        userId: id,
        name: 'deck1',
        intervalModifier: 1,
        createdAt: new Date(),
        newCardsToday: {
          date: new Date(),
          numCards: 0,
        },
      });
      Cards.insert({
        deckId,
        front: 'blaa',
        back: 'blarg',
        createdAt: new Date(),
        state: 'NEW',
        currentStep: 0,
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: DELETE_USER_MUTATION,
        variables: { userId: id },
      });
      assert.strictEqual(res.data.deleteUser, true);

      const deck = Decks.findOne({ userId: id });
      const card = Cards.findOne();
      assert.strictEqual(deck, undefined);
      assert.strictEqual(card, undefined);
    });
  });
}
