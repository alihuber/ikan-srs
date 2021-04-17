import { Meteor } from 'meteor/meteor';
import { Cards, Decks } from '../../api/decks/constants';
import { Stats } from '../../api/stats/constants';

const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(
    label({ label: 'server/collectStatsJob' }),
    timestamp(),
    loggerFormat
  ),
  transports: [new transports.Console()],
});

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
