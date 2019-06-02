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
      const { server } = constructTestServer({
        context: () => ({ user: { _id: 1, username: 'admin', admin: true } }),
      });
      const { query } = createTestClient(server);
      const res = await query({ query: USERS_QUERY });
      assert.equal(res.data.users.length, 0);
      Accounts.createUser({
        username: 'admin',
        admin: true,
        password: 'adminadmin',
      });
      Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });
      const res2 = await query({ query: USERS_QUERY });
      assert.equal(res2.data.users.length, 2);
    });

    it('fetches no users if normal user queries the database', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({ user: { _id: 1, username: 'testuser' } }),
      });
      Accounts.createUser({
        username: 'admin',
        admin: true,
        password: 'adminadmin',
      });
      Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });
      const { query } = createTestClient(server);
      const res = await query({ query: USERS_QUERY });
      assert.equal(res.data.users.length, 0);
    });
  });

  describe('Current user query', () => {
    it('fetches information about the current user if user', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({ user: { _id: 1, username: 'foouser' } }),
      });
      const { query } = createTestClient(server);
      const res = await query({ query: CURRENT_USER_QUERY });
      assert.equal(res.data.currentUser.username, null);
      assert.equal(res.data.currentUser._id, null);
      assert.equal(res.data.currentUser.admin, null);
      Accounts.createUser({
        username: 'foouser',
        admin: false,
        password: 'example123',
      });
      const res2 = await query({ query: CURRENT_USER_QUERY });
      assert.equal(res2.data.currentUser.username, 'foouser');
      assert.equal(res2.data.currentUser.admin, null);
    });
  });

  describe('Create user mutation', () => {
    it('throws error if non-admin calls mutation', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({ user: { _id: 1, username: 'noadmin', admin: null } }),
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: CREATE_USER_MUTATION,
        variables: { username: 'newuser', password: 'newpassword', admin: false },
      });
      assert.equal(res.errors[0].message, 'not authorized');
      assert.equal(res.errors[0].path[0], 'createUser');
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
      assert.equal(res.errors[0].message, 'Variable "$username" of required type "String!" was not provided.');
    });

    it('creates an admin user', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({ user: { _id: 1, username: 'admin', admin: true } }),
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: CREATE_USER_MUTATION,
        variables: { username: 'newuser', password: 'newpassword', admin: true },
      });
      assert.equal(res.data.createUser.username, 'newuser');
      assert.equal(res.data.createUser.admin, true);

      const { query } = createTestClient(server);
      const res2 = await query({ query: USERS_QUERY });
      assert.equal(res2.data.users.length, 1);
    });

    it('creates an non-admin user', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({ user: { _id: 1, username: 'admin', admin: true } }),
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: CREATE_USER_MUTATION,
        variables: { username: 'newuser', password: 'newpassword', admin: false },
      });
      assert.equal(res.data.createUser.username, 'newuser');
      assert.equal(res.data.createUser.admin, null);

      const { query } = createTestClient(server);
      const res2 = await query({ query: USERS_QUERY });
      assert.equal(res2.data.users.length, 1);
    });
  });

  describe('Update user mutation', () => {
    it('throws error if non-admin calls mutation', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({ user: { _id: 1, username: 'noadmin', admin: null } }),
      });
      const id = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: UPDATE_USER_MUTATION,
        variables: { userId: id, username: 'changeduser', password: 'newpassword', admin: false },
      });
      assert.equal(res.errors[0].message, 'not authorized');
      assert.equal(res.errors[0].path[0], 'updateUser');
    });

    it('throws error if param is missing', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({ user: { _id: 1, username: 'admin', admin: true } }),
      });
      const id = Accounts.createUser({
        username: 'testuser',
        admin: true,
        password: 'example123',
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: UPDATE_USER_MUTATION,
        variables: { userId: id, password: 'newpassword', admin: false },
      });
      assert.equal(res.errors[0].message, 'Variable "$username" of required type "String!" was not provided.');
    });

    it('updates an user', async () => {
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
        variables: { userId: id, username: 'newuser', password: 'newpassword', admin: false },
      });
      assert.equal(res.data.updateUser.username, 'newuser');
      assert.equal(res.data.updateUser.admin, false);

      const { query } = createTestClient(server);
      const res2 = await query({ query: USERS_QUERY });
      assert.equal(res2.data.users.length, 1);
      assert.equal(res2.data.users[0].username, 'newuser');
      assert.equal(res2.data.users[0].admin, false);
    });
  });

  describe('Delete user mutation', () => {
    it('throws error if non-admin calls mutation', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({ user: { _id: 1, username: 'noadmin', admin: null } }),
      });
      const id = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: DELETE_USER_MUTATION,
        variables: { userId: id },
      });
      assert.equal(res.errors[0].message, 'not authorized');
      assert.equal(res.errors[0].path[0], 'deleteUser');
    });

    it('returns false if called with non-existent userId', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({ user: { _id: 1, username: 'admin', admin: true } }),
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: DELETE_USER_MUTATION,
        variables: { userId: 'abc123' },
      });
      assert.equal(res.data.deleteUser, false);
    });

    it('deletes an user', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({ user: { _id: 1, username: 'admin', admin: true } }),
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
      assert.equal(res.data.deleteUser, true);

      const { query } = createTestClient(server);
      const res2 = await query({ query: USERS_QUERY });
      assert.equal(res2.data.users.length, 0);
    });
  });
}
