import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import first from 'lodash/first';
import { Settings, DEFAULT_SETTINGS } from '../settings/constants';

const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: 'UserResolver' }), timestamp(), loggerFormat),
  transports: [new transports.Console()],
});

export default {
  Query: {
    currentUser(_, __, context) {
      const reqUser = context.user;
      logger.log({ level: 'info', message: `got currentUser request for _id ${reqUser && reqUser._id}` });
      const user = reqUser && Meteor.users.findOne(reqUser._id);
      if (user) {
        logger.log({ level: 'info', message: `got currentUser with _id ${reqUser && reqUser._id}` });
        return user;
      } else {
        logger.log({ level: 'info', message: 'currentUser not found, returning {}' });
        return {};
      }
    },
    users(_, { pageNum = 1 }, context) {
      check(pageNum, Number);
      const reqUser = context.user;
      logger.log({ level: 'info', message: `got users request for _id ${reqUser && reqUser._id}` });
      const user = reqUser && first(Meteor.users.find({ _id: reqUser._id }, { fields: { admin: 1, username: 1 } }).fetch());
      if (!user.admin) {
        logger.log({ level: 'warn', message: `users requester with _id ${user._id} is no admin` });
        return { usersCount: 0, usersList: [] };
      }
      logger.log({ level: 'info', message: `returning users for _id ${user._id}` });
      // 5 == page size, not configurable for now
      const skip = 5 * (pageNum - 1);
      const usersCount = Meteor.users.find({}).count();
      const foundUsers = Meteor.users.find({}, { fields: { emails: 1, admin: 1, username: 1 }, skip, limit: 5 }).fetch();
      return {
        usersCount,
        usersList: foundUsers,
      };
    },
  },
  Mutation: {
    createUser(_, args, context) {
      Match.test(args, { username: String, admin: Boolean, password: String });
      const { username, admin, password } = args;
      const reqUser = context.user;
      const user = reqUser && Meteor.users.findOne(reqUser._id);
      logger.log({ level: 'info', message: `got createUser request from _id ${user && user._id}` });
      if (!user.admin) {
        logger.log({ level: 'warn', message: `create user requester with _id ${user._id} is no admin` });
        throw new Error('not authorized');
      }
      const userId = Accounts.createUser({
        username,
        password,
      });
      logger.log({ level: 'info', message: `created user with _id ${userId}` });
      if (admin) {
        logger.log({ level: 'info', message: `setting admin flag on user with _id ${userId}` });
        Meteor.users.update({ _id: userId }, { $set: { admin } });
      }
      const newUser = Meteor.users.findOne({ _id: userId }, { fields: { admin: 1, username: 1 } });
      logger.log({ level: 'info', message: `created user ${JSON.stringify(newUser)}` });
      Settings.insert({ userId, ...DEFAULT_SETTINGS });
      return newUser;
    },
    updateUser(_, args, context) {
      Match.test(args, { userId: String, username: String, admin: Boolean, password: Match.Maybe(String) });
      const { userId, username, admin, password } = args;
      const adminBefore = Meteor.users.findOne(userId).admin;
      const reqUser = context.user;
      const user = reqUser && Meteor.users.findOne(reqUser._id);
      logger.log({ level: 'info', message: `got updateUser request from _id ${user && user._id}` });
      if (!user.admin) {
        logger.log({ level: 'warn', message: `update user requester with ${user._id} is no admin` });
        throw new Error('not authorized');
      }
      logger.log({ level: 'info', message: `updating user with _id ${userId}, setting admin to ${admin}` });
      Meteor.users.update({ _id: userId }, { $set: { username, admin } });
      if (password && password.length >= 8) {
        logger.log({ level: 'info', message: `setting new password for user with _id ${userId}` });
        Accounts.setPassword(userId, password);
      }
      if (admin !== adminBefore) {
        logger.log({ level: 'info', message: `forcing user with _id ${userId} to logout since his admin status changed` });
        Meteor.users.update({ _id: userId }, { $set: { 'services.resume.loginTokens': [] } });
      }
      logger.log({ level: 'info', message: `updated user with _id ${userId}` });
      return Meteor.users.findOne({ _id: userId }, { fields: { admin: 1, username: 1 } });
    },
    deleteUser(_, args, context) {
      Match.test(args, { userId: String });
      const { userId } = args;
      const reqUser = context.user;
      logger.log({ level: 'info', message: `got deleteUser request from _id ${reqUser && reqUser._id}` });
      const user = reqUser && Meteor.users.findOne(reqUser._id);
      if (!user.admin) {
        logger.log({ level: 'warn', message: `delete user requester with _id ${user._id} is no admin` });
        throw new Error('not authorized');
      }
      const userToDelete = Meteor.users.findOne({ _id: userId });
      if (userToDelete) {
        logger.log({ level: 'info', message: `deleting user with _id ${userId}` });
        try {
          Meteor.users.update({ _id: userId }, { $set: { 'services.resume.loginTokens': [] } });
          Meteor.users.remove({ _id: userId });
          logger.log({ level: 'info', message: `deleted user with _id ${userId}` });
          Settings.remove({ userId });
          return true;
        } catch (err) {
          logger.log({ level: 'err', message: `deleting user with _id ${userId} failed: ${JSON.stringify(err)}` });
          return false;
        }
      } else {
        logger.log({ level: 'info', message: `could not delete user with _id ${userId}` });
        return false;
      }
    },
  },
};
