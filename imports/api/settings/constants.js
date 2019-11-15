import { Mongo } from 'meteor/mongo';
import gql from 'graphql-tag';

export const Settings = new Mongo.Collection('settings');

export const DEFAULT_SETTINGS = {
  lapseSettings: {
    stepsInMinutes: 20,
    newInterval: 70,
    minimumIntervalInDays: 2,
    leechThreshold: 8,
    leechAction: 'TAG', // suspend / tag
  },

  learningSettings: {
    stepsInMinutes: [15, 1440, 8640],
    newCardsOrder: 'ADDED', // added / random
    newCardsPerDay: 1000,
    graduatingIntervalInDays: 15,
    easyIntervalInDays: 60,
    startingEase: 250,
  },
};

export const SETTINGS_QUERY = gql`
  query {
    settings {
      _id
      userId
      lapseSettings {
        stepsInMinutes
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
