import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import merge from 'lodash/merge';
import { ApolloServer } from 'apollo-server-express';
import { Accounts } from 'meteor/accounts-base';
import assert from 'assert';
import UserSchema from '../imports/api/users/User.graphql';
import UserResolver from '../imports/api/users/resolvers';

const { createTestClient } = require('apollo-server-testing');
const gql = require('graphql-tag');

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

  const USERS_QUERY = gql`
    query {
      users {
        _id
        admin
        username
      }
    }
  `;

  describe('Queries', () => {
    it('fetches list of users if admin queries the database', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({ user: { id: 1, username: 'admin', admin: true } }),
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
        context: () => ({ user: { id: 1, username: 'testuser' } }),
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
}
