import { ApolloServer } from 'apollo-server-express';
import { WebApp } from 'meteor/webapp';
import { getUser } from 'meteor/apollo';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import merge from 'lodash/merge';
import UserSchema from '../../api/users/User.graphql';
import UserResolver from '../../api/users/resolvers';
import SettingsSchema from '../../api/settings/Setting.graphql';
import SettingsResolver from '../../api/settings/resolvers';
import DecksSchema from '../../api/decks/Deck.graphql';
import DecksNotificationsSchema from '../../api/deckNotifications/DeckNotification.graphql';
import DecksResolver from '../../api/decks/deck-resolvers';
import DeckNotificationResolver from '../../api/deckNotifications/deck-notification-resolvers';
import CardsResolver from '../../api/decks/card-resolvers';
import StatsSchema from '../../api/stats/Stats.graphql';
import StatsResolver from '../../api/stats/stats-resolvers';

const typeDefs = [
  UserSchema,
  SettingsSchema,
  DecksSchema,
  StatsSchema,
  DecksNotificationsSchema,
];

const DateResolver = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value); // ast value is always in string format
      }
      return null;
    },
  }),
};

const resolvers = merge(
  DateResolver,
  UserResolver,
  SettingsResolver,
  DecksResolver,
  CardsResolver,
  StatsResolver,
  DeckNotificationResolver
);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => ({
    user: await getUser(req.headers.authorization),
  }),
});

export async function startApolloServer() {
  await server.start();
  const app = WebApp.connectHandlers;

  server.applyMiddleware({
    app,
  });
}
