import { Mongo } from 'meteor/mongo';
import { gql } from '@apollo/client';

export const Stats = new Mongo.Collection('stats');

export const STATS_QUERY = gql`
  query {
    stats {
      _id
      date
      userId
      data {
        decksCount
        cardsCount
        NEW
        LEARNING
        RELEARNING
        GRADUATED
      }
    }
  }
`;

export const LEARNABLE_DECKS_QUERY = gql`
  query {
    learnable {
      _id
      userId
      name
      createdAt
      numCards
      newCards
      learningCards
      relearningCards
      graduatedCards
      newCardsToday {
        date
        numCards
      }
    }
  }
`;
