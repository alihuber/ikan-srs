import { Mongo } from 'meteor/mongo';
import gql from 'graphql-tag';

export const Settings = new Mongo.Collection('settings');

export const SETTINGS_QUERY = gql`
  query {
    settings
  }
`;

export const UPDATE_SETTINGS_MUTATION = gql`
  mutation updateSetting($setting: SettingInput!) {
    updateSetting(setting: $setting) {
      _id
    }
  }
`;
