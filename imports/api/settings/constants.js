import { Mongo } from 'meteor/mongo';
import { gql } from '@apollo/client';

export const Settings = new Mongo.Collection('settings');

export const DEFAULT_SETTINGS = {
  lapseSettings: {
    stepInMinutes: 20,
    newInterval: 0.7,
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
    startingEase: 2.5,
  },
};

export const SETTINGS_QUERY = gql`
  query {
    settings {
      _id
      userId
      lapseSettings {
        stepInMinutes
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
        stepInMinutes
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
