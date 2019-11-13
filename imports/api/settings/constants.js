import { Mongo } from 'meteor/mongo';
import gql from 'graphql-tag';

export const Settings = new Mongo.Collection('settings');

export const DEFAULT_SETTINGS = {
  lapseSettings: {
    newInterval: 0,
    minimumIntervalInDays: 1,
    leechThreshold: 8,
    leechAction: 'SUSPEND', // suspend / tag
  },

  learningSettings: {
    stepsInMinutes: [1, 10],
    newCardsOrder: 'ADDED', // added / random
    newCardsPerDay: 20,
    graduatingIntervalInDays: 1,
    easyIntervalInDays: 4,
    startingEase: 2.5,
  },
};

export const SETTINGS_QUERY = gql`
  query {
    settings {
      _id
      userId
      lapseSettings {
        newInterval
        minimumIntervalInDays
        leechThreshold
        leechAction
      }
      learningSettings {
        stepsInMinutes
        newCardsOrder
        newCardsPerDay
        graduatingIntervalInDays
        easyIntervalInDays
        startingEase
      }
    }
  }
`;

export const UPDATE_SETTINGS_MUTATION = gql`
  mutation updateSetting($setting: SettingInput!) {
    updateSetting(setting: $setting) {
      _id
      lapseSettings {
        newInterval
        minimumIntervalInDays
        leechThreshold
        leechAction
      }

      learningSettings {
        stepsInMinutes
        newCardsOrder
        newCardsPerDay
        graduatingIntervalInDays
        easyIntervalInDays
        startingEase
      }
    }
  }
`;
