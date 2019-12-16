import React from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import SimpleSchema from 'simpl-schema';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { AutoForm } from 'uniforms-semantic';
import { toast } from 'react-toastify';
import { UPDATE_SETTINGS_MUTATION } from '../../../api/settings/constants';

const lapseSettingsSchema = new SimpleSchema({
  stepInMinutes: {
    type: SimpleSchema.Integer,
    min: 1,
  },
  newInterval: { type: Number, min: 0 },
  minimumIntervalInDays: { type: SimpleSchema.Integer, min: 1 },
  leechThreshold: SimpleSchema.Integer,
  leechAction: {
    type: String,
    allowedValues: ['SUSPEND', 'TAG'],
  },
});

const learningSettingsSchema = new SimpleSchema({
  stepsInMinutes: {
    type: Array,
    minCount: 1,
    maxCount: 5,
  },
  'stepsInMinutes.$': {
    type: SimpleSchema.Integer,
    min: 1,
  },
  newCardsOrder: {
    type: String,
    allowedValues: ['ADDED', 'RANDOM'],
  },
  newCardsPerDay: { type: SimpleSchema.Integer, min: 1 },
  graduatingIntervalInDays: { type: SimpleSchema.Integer, min: 1 },
  easyIntervalInDays: { type: SimpleSchema.Integer, min: 0 },
  startingEase: { type: Number, min: 0 },
});

const settingsSchema = new SimpleSchema({
  lapseSettings: {
    type: lapseSettingsSchema,
  },
  learningSettings: {
    type: learningSettingsSchema,
  },
});

const bridge = new SimpleSchema2Bridge(settingsSchema);

const handleSubmit = (values, updateSetting, refetch) => {
  const { lapseSettings, learningSettings } = values;
  const newLapseSettings = {
    stepInMinutes: lapseSettings.stepInMinutes,
    newInterval: lapseSettings.newInterval,
    minimumIntervalInDays: lapseSettings.minimumIntervalInDays,
    leechThreshold: lapseSettings.leechThreshold,
    leechAction: lapseSettings.leechAction,
  };
  const newLearningSettings = {
    stepsInMinutes: learningSettings.stepsInMinutes,
    newCardsOrder: learningSettings.newCardsOrder,
    newCardsPerDay: learningSettings.newCardsPerDay,
    graduatingIntervalInDays: learningSettings.graduatingIntervalInDays,
    easyIntervalInDays: learningSettings.easyIntervalInDays,
    startingEase: learningSettings.startingEase,
  };
  const setting = { lapseSettings: newLapseSettings, learningSettings: newLearningSettings };
  updateSetting({ variables: { setting } })
    .then(() => {
      refetch();
      toast.success('Update successful!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    })
    .catch((error) => {
      console.log(error);
      toast.error('Update error!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    });
};

const SettingsForm = ({ lapseSettings, learningSettings, refetch }) => {
  const [updateSetting, _] = useMutation(UPDATE_SETTINGS_MUTATION);
  const model = { lapseSettings, learningSettings };
  return <AutoForm schema={bridge} onSubmit={(doc) => handleSubmit(doc, updateSetting, refetch)} model={model} />;
};

SettingsForm.propTypes = {
  refetch: PropTypes.func.isRequired,
  lapseSettings: PropTypes.object.isRequired,
  learningSettings: PropTypes.object.isRequired,
};

export default SettingsForm;
