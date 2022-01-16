import { endOfDay, startOfDay } from 'date-fns';
import { Meteor } from 'meteor/meteor';
import { Cards, Decks } from '../../api/decks/constants';
import { Stats } from '../../api/stats/constants';
import { getLogger } from './getLogger';

const logger = getLogger('server/collectStatsJob');

export default class CollectStatsJob {
  static collectStats() {
    const states = ['NEW', 'LEARNING', 'RELEARNING', 'GRADUATED'];
    logger.log({
      level: 'info',
      message: 'collecting stats...',
    });
    const userIds = Meteor.users
      .find()
      .fetch()
      .map((u) => u._id);
    userIds.forEach((userId) => {
      // TODO: this is just to mitigate heroku/galaxy behaviour
      // skip if there are already stats for this user today
      if (
        Stats.findOne({
          userId,
          date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
        })
      ) {
        return;
      }
      const result = { date: new Date(), userId };
      const decks = Decks.find({ userId }, { fields: { _id: 1 } }).fetch();
      const deckIds = decks.map((d) => d._id);
      let data = {
        decksCount: decks.length,
      };
      let cardsCount = 0;
      const statesCountMap = {};
      deckIds.forEach((deckId) => {
        cardsCount += Cards.find({ deckId }).count();
        states.forEach((state) => {
          if (!statesCountMap[state]) {
            statesCountMap[state] = [];
          }
          statesCountMap[state].push(Cards.find({ state, deckId }).count());
        });
      });
      states.forEach((state) => {
        const values = statesCountMap[state];
        if (values) {
          statesCountMap[state] = values.reduce((acc, cur) => acc + cur, 0);
        }
      });
      data.cardsCount = cardsCount;
      data = { ...data, ...statesCountMap };
      result.data = data;
      Stats.insert(result);
    });
    logger.log({
      level: 'info',
      message: 'collecting stats finished',
    });
  }
}
