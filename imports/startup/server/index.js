import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { SyncedCron } from 'meteor/littledata:synced-cron';
import { startApolloServer } from './apollo';
import CollectStatsJob from './collectStatsJob';
import { getLogger } from './getLogger';

const logger = getLogger('MeteorServer');

Accounts.onLogin((loginObj) => {
  logger.log({
    level: 'info',
    message: `successful login for user ${loginObj.user.username} with _id ${loginObj.user._id}`,
  });
});

Accounts.onLogout((logoutObj) => {
  logger.log({
    level: 'info',
    message: `successful logout for user ${
      logoutObj.user && logoutObj.user.username
    } with _id ${logoutObj.user && logoutObj.user._id}`,
  });
});

Accounts.config({
  forbidClientAccountCreation: true,
});

Meteor.startup(() => {
  // seed admin user if not present
  const user = Meteor.users.findOne({ username: 'admin' });
  if (!user) {
    logger.log({
      level: 'info',
      message: 'admin user not found, seeding admin user...',
    });
    Meteor.users.insert({ username: 'admin', admin: true });
    const newUser = Meteor.users.findOne({ username: 'admin' });
    const pw = process.env.ADMIN || 'adminadmin';
    Accounts.setPassword(newUser._id, pw);
  }

  logger.log({
    level: 'info',
    message: `server started... registered users: ${
      Meteor.users.find({}).fetch().length
    }`,
  });
});

SyncedCron.add({
  name: 'collect stats',
  schedule: function (parser) {
    return parser.text('every 15 minutes');
  },
  job: async function () {
    const res = CollectStatsJob.collectStats();
    return res;
  },
});

SyncedCron.start();

try {
  startApolloServer().then();
} catch (e) {
  console.error(e.reason);
}
