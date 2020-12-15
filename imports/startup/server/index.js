import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ApolloServer } from 'apollo-server-express';
import { WebApp } from 'meteor/webapp';
import { getUser } from 'meteor/apollo';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import merge from 'lodash/merge';
import './appcache';
import UserSchema from '../../api/users/User.graphql';
import UserResolver from '../../api/users/resolvers';
import SettingsSchema from '../../api/settings/Setting.graphql';
import SettingsResolver from '../../api/settings/resolvers';
import DecksSchema from '../../api/decks/Deck.graphql';
import DecksResolver from '../../api/decks/deck-resolvers';
import CardsResolver from '../../api/decks/card-resolvers';

const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: 'MeteorServer' }), timestamp(), loggerFormat),
  transports: [new transports.Console()],
});

const typeDefs = [UserSchema, SettingsSchema, DecksSchema];

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

const resolvers = merge(DateResolver, UserResolver, SettingsResolver, DecksResolver, CardsResolver);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => ({
    user: await getUser(req.headers.authorization),
  }),
});

server.applyMiddleware({
  app: WebApp.connectHandlers,
  path: '/graphql',
});

WebApp.connectHandlers.use('/graphql', (req, res) => {
  if (req.method === 'GET') {
    res.end();
  }
});

Accounts.onLogin((loginObj) => {
  logger.log({ level: 'info', message: `successful login for user ${loginObj.user.username} with _id ${loginObj.user._id}` });
});

Accounts.onLogout((logoutObj) => {
  logger.log({
    level: 'info',
    message: `successful logout for user ${logoutObj.user && logoutObj.user.username} with _id ${logoutObj.user && logoutObj.user._id}`,
  });
});

Accounts.config({
  forbidClientAccountCreation: true,
});

Meteor.startup(() => {
  // seed admin user if not present
  const user = Meteor.users.findOne({ username: 'admin' });
  if (!user) {
    logger.log({ level: 'info', message: 'admin user not found, seeding admin user...' });
    Meteor.users.insert({ username: 'admin', admin: true });
    const newUser = Meteor.users.findOne({ username: 'admin' });
    const pw = process.env.ADMIN || 'adminadmin';
    Accounts.setPassword(newUser._id, pw);
  }

  logger.log({ level: 'info', message: `server started... registered users: ${Meteor.users.find({}).fetch().length}` });
});
