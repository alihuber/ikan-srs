import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import first from 'lodash/first';

export default {
  Query: {
    currentUser(obj, args, context) {
      const user = context.user;
      if (user) {
        return user;
      } else {
        return {};
      }
    },
    users(obj, args, context) {
      const user = context.user;
      if (!user.admin) {
        return [];
      }
      return Meteor.users.find({}, { fields: { emails: 1, admin: 1, username: 1 } }).fetch();
    },
  },
  User: {
    email: (user) => {
      const email = user && first(user.emails);
      if (email) {
        return email.address;
      } else {
        return null;
      }
    },
    admin: (user) => {
      const foundUser = Meteor.users.findOne(user._id);
      return foundUser && foundUser.admin;
    },
  },
  Mutation: {
    createUser(obj, args, context) {
      const { username, admin, password } = args;
      const user = context.user;
      if (!user.admin) {
        throw new Error('not authorized');
      }
      const userId = Accounts.createUser({
        username,
        admin,
        password,
      });
      return first(Meteor.users.find({ _id: userId }, { fields: { admin: 1, username: 1 } }).fetch());
    },
    updateUser(obj, args, context) {
      const { userId, username, admin, password } = args;
      const adminBefore = Meteor.users.findOne(userId).admin;
      const user = context.user;
      if (!user.admin) {
        throw new Error('not authorized');
      }
      Meteor.users.update({ _id: userId }, { $set: { username, admin } });
      if (password.length >= 8) {
        Accounts.setPassword(userId, password);
      }
      if (admin !== adminBefore) {
        Meteor.users.update({ _id: userId }, { $set: { 'services.resume.loginTokens': [] } });
      }
      return first(Meteor.users.find({ _id: userId }, { fields: { admin: 1, username: 1 } }).fetch());
    },
    deleteUser(obj, args, context) {
      const { userId } = args;
      const user = context.user;
      if (!user.admin) {
        return false;
      }
      try {
        Meteor.users.update({ _id: userId }, { $set: { 'services.resume.loginTokens': [] } });
        Meteor.users.remove({ _id: userId });
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    },
  },
};
