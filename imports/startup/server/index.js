import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ApolloServer } from 'apollo-server-express';
import { WebApp } from 'meteor/webapp';
import { getUser } from 'meteor/apollo';
import merge from 'lodash/merge';
import './appcache';
import UserSchema from '../../api/users/User.graphql';
import UserResolver from '../../api/users/resolvers';
import SettingsSchema from '../../api/settings/Setting.graphql';
import SettingsResolver from '../../api/settings/resolvers';

const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: 'MeteorServer' }), timestamp(), loggerFormat),
  transports: [new transports.Console()],
});

const typeDefs = [UserSchema, SettingsSchema];

const resolvers = merge(UserResolver, SettingsResolver);

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
