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
