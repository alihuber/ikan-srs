import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import merge from 'lodash/merge';
import { ApolloServer } from 'apollo-server-express';
import assert from 'assert';
import UserSchema from '../imports/api/users/User.graphql';
import SettingSchema from '../imports/api/settings/Setting.graphql';
import { Settings, SETTINGS_QUERY, UPDATE_SETTINGS_MUTATION } from '../imports/api/settings/constants';
import SettingResolver from '../imports/api/settings/resolvers';

const { createTestClient } = require('apollo-server-testing');

const typeDefs = [UserSchema, SettingSchema];

const resolvers = merge(SettingResolver);

if (Meteor.isServer) {
  const constructTestServer = ({ context }) => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context,
    });

    return { server };
  };

  describe('Settings query', () => {
    it('returns no settings if no data found for user', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({ user: { _id: 1, username: 'testuser', admin: false } }),
      });
      const { query } = createTestClient(server);
      const res = await query({ query: SETTINGS_QUERY });
      assert.equal(res.data.settings.folders, null);
      assert.equal(res.data.settings.interval, null);
    });

    it('returns settings if data found for user', async () => {
      resetDatabase();
      const folderName = 'foonews';
      const url = 'http://mynews.rss';
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });

      const { server } = constructTestServer({
        context: () => ({ user: { _id: userId, username: 'testuser', admin: false } }),
      });
      Settings.insert({
        /* TODO: */
      });

      const { query } = createTestClient(server);
      const res = await query({ query: SETTINGS_QUERY });
      assert.equal(res.data.settings.folders[0].folderName, folderName);
      assert.equal(res.data.settings.folders[0].subscriptions[0].url, url);
      assert.equal(res.data.settings.interval, '60');
    });
  });

  describe('Update settings mutation', () => {
    it('creates settings if no data found for user', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });
      const { server } = constructTestServer({
        context: () => ({ user: { _id: userId, username: 'testuser', admin: false } }),
      });

      const setting = {
        /* TODO: */
      };

      const { mutate } = createTestClient(server);
      const res = await mutate({ mutation: UPDATE_SETTINGS_MUTATION, variables: { setting } });
      assert.notEqual(res.data.updateSetting, null);
    });
  });
}
