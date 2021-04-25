import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import merge from 'lodash/merge';
import { ApolloServer } from 'apollo-server-express';
import assert from 'assert';
import UserSchema from '../imports/api/users/User.graphql';
import SettingSchema from '../imports/api/settings/Setting.graphql';
import DecksSchema from '../imports/api/decks/Deck.graphql';
import DeckNotificationsSchema from '../imports/api/deckNotifications/DeckNotification.graphql';
import { Decks } from '../imports/api/decks/constants';
import {
  DeckNotification,
  DECK_NOTIFICATIONS_QUERY,
  FETCHED_NOTIFICATION_MUTATION,
} from '../imports/api/deckNotifications/constants';
import DeckNotificationResolver from '../imports/api/deckNotifications/deck-notification-resolvers';

const { createTestClient } = require('apollo-server-testing');

const typeDefs = [
  UserSchema,
  SettingSchema,
  DecksSchema,
  DeckNotificationsSchema,
];

const resolvers = merge(DeckNotificationResolver);

if (Meteor.isServer) {
  const constructTestServer = ({ context }) => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context,
    });

    return { server };
  };

  describe('DeckNotifications query', () => {
    it('returns no data if no data found for user', async () => {
      resetDatabase();
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: 1, username: 'testuser', admin: false },
        }),
      });
      const { query } = createTestClient(server);
      const res = await query({ query: DECK_NOTIFICATIONS_QUERY });
      assert.deepStrictEqual(res.data.deckNotifications, []);
    });
  });

  describe('MarkAsFetched mutation', () => {
    it('returns false if no data found for user', async () => {
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
        mutation: FETCHED_NOTIFICATION_MUTATION,
        variables: { notificationId: 'abc123' },
      });
      assert.deepStrictEqual(res.data.markAsFetched, false);
    });

    it('marks a notifications as fetched', async () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        admin: false,
        password: 'example123',
      });
      const deckId1 = Decks.insert({
        userId,
        name: 'deck1',
        createdAt: new Date(),
        intervalModifier: 1,
        newCardsToday: { date: new Date(), numCards: 0 },
      });
      const notificationId = DeckNotification.insert({
        userId,
        deckId: deckId1,
        dueDate: new Date(),
      });
      const { server } = constructTestServer({
        context: () => ({
          user: { _id: userId, username: 'testuser', admin: false },
        }),
      });
      const { mutate } = createTestClient(server);
      const res = await mutate({
        mutation: FETCHED_NOTIFICATION_MUTATION,
        variables: { notificationId },
      });
      const updated = DeckNotification.findOne(notificationId);
      assert.deepStrictEqual(res.data.markAsFetched, true);
      assert.strictEqual(updated.fetched, true);
    });
  });
}
