import { Meteor } from 'meteor/meteor';
import groupBy from 'lodash/groupBy';
import { Decks, Cards } from '../../api/decks/constants';
import { DeckNotification } from '../../api/deckNotifications/constants';

const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(
    label({ label: 'server/checkLearnableDecksJob' }),
    timestamp(),
    loggerFormat
  ),
  transports: [new transports.Console()],
});

export default class CheckLearnableDecksJob {
  static checkLearnableDecks() {
    logger.log({
      level: 'info',
      message: 'collecting learnable decks...',
    });
    const res = [];
    Meteor.users
      .find({}, { _id: 1 })
      .fetch()
      .forEach((reqUser) => {
        const deckIdsForUser = Decks.find({ userId: reqUser._id }, { _id: 1 })
          .fetch()
          .map((d) => d._id);
        const dueCards = Cards.find({
          deckId: { $in: deckIdsForUser },
          dueDate: { $lte: new Date() },
        }).fetch();
        if (dueCards.length !== 0) {
          const deckGroups = groupBy(dueCards, 'deckId');
          Object.keys(deckGroups).forEach((deckId) => {
            const nextDueCard = Array.from(deckGroups[deckId]).sort((a, b) => {
              return (
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
              );
            })[0].dueDate;
            res.push({
              userId: reqUser._id,
              deckId,
              dueDate: nextDueCard,
            });
          });
        }
      });
    res.forEach((dueDeck) => {
      if (
        !DeckNotification.findOne({
          userId: dueDeck.userId,
          dueDate: dueDeck.dueDate,
          deckId: dueDeck._id,
        })
      ) {
        logger.log({
          level: 'info',
          message: `inserting found deck Notification : ${JSON.stringify(
            dueDeck
          )}`,
        });
        DeckNotification.insert(dueDeck);
      }
    });
  }
}
