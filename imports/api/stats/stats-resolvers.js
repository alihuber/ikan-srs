import { Meteor } from 'meteor/meteor';
import { getLogger } from '../../startup/server/getLogger';
import { Stats } from './constants';

const logger = getLogger('StatsResolver');

export default {
  Query: {
    async stats(obj, args, context) {
      const reqUser = context.user;
      logger.log({
        level: 'info',
        message: `got stats request for _id ${reqUser && reqUser._id}`,
      });
      const user = reqUser && Meteor.users.findOne(reqUser._id);
      if (user) {
        return Stats.find({ userId: user._id }, { sort: { date: 1 } });
      } else {
        logger.log({ level: 'info', message: 'user not found, returning []' });
        return [];
      }
    },
  },
};
