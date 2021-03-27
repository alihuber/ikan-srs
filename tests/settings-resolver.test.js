import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import merge from 'lodash/merge';
import { ApolloServer } from 'apollo-server-express';
import assert from 'assert';
import UserSchema from '../imports/api/users/User.graphql';
import SettingSchema from '../imports/api/settings/Setting.graphql';
import {
  Settings,
  SETTINGS_QUERY,
  UPDATE_SETTINGS_MUTATION,
  DEFAULT_SETTINGS,
} from '../imports/api/settings/constants';
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
        context: () => ({
          user: { _id: 1, username: 'testuser', admin: false },
        }),
      });
      const { query } = createTestClient(server);
      const res = await query({ query: SETTINGS_QUERY });
      assert.equal(res.data.settings.learningSettings, null);
      assert.equal(res.data.settings.lapseSettings, null);
    });

    it('returns settings if data found for user', async () => {
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

      const { query } = createTestClient(server);
      const res = await query({ query: SETTINGS_QUERY });
      assert.equal(res.data.settings.lapseSettings.newInterval, 0.7);
      assert.equal(res.data.settings.lapseSettings.leechAction, 'TAG');
      assert.equal(res.data.settings.learningSettings.startingEase, 2.5);
      assert.equal(res.data.settings.learningSettings.newCardsOrder, 'ADDED');
      assert.deepEqual(res.data.settings.learningSettings.stepsInMinutes, [
        15,
        1440,
        8640,
      ]);
    });
  });

  describe('Update settings mutation', () => {
    it('updates settings for user', async () => {
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

      const setting = {
        lapseSettings: {
          newInterval: 1,
          minimumIntervalInDays: 2,
          leechThreshold: 10,
          leechAction: 'TAG',
        },
        learningSettings: {
          stepsInMinutes: [2, 20],
          newCardsOrder: 'RANDOM',
          newCardsPerDay: 30,
          graduatingIntervalInDays: 2,
          easyIntervalInDays: 8,
          startingEase: 1.9,
        },
      };

      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: UPDATE_SETTINGS_MUTATION,
        variables: { setting },
      });
      assert.notEqual(res.data.updateSetting, null);

      assert.equal(res.data.updateSetting.lapseSettings.newInterval, 1);
      assert.equal(
        res.data.updateSetting.lapseSettings.minimumIntervalInDays,
        2
      );
      assert.equal(res.data.updateSetting.lapseSettings.leechThreshold, 10);
      assert.equal(res.data.updateSetting.lapseSettings.leechAction, 'TAG');

      assert.deepEqual(res.data.updateSetting.learningSettings.stepsInMinutes, [
        2,
        20,
      ]);
      assert.equal(
        res.data.updateSetting.learningSettings.newCardsOrder,
        'RANDOM'
      );
      assert.equal(res.data.updateSetting.learningSettings.newCardsPerDay, 30);
      assert.equal(
        res.data.updateSetting.learningSettings.graduatingIntervalInDays,
        2
      );
      assert.equal(
        res.data.updateSetting.learningSettings.easyIntervalInDays,
        8
      );
      assert.equal(res.data.updateSetting.learningSettings.startingEase, 1.9);
    });
  });
}
