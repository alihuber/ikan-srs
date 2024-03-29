import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Container, Grid, Header } from 'semantic-ui-react';
import LoadingIndicator from '../../LoadingIndicator';
import { SETTINGS_QUERY } from '../../../../api/settings/constants';
import CurrentUserContext from '../../contexts/CurrentUserContext';
import AnimContext from '../../contexts/AnimContext';
import SettingsForm from './SettingsForm';

const Settings = () => {
  const navigate = useNavigate();
  const animClass = useContext(AnimContext);
  const currentUser = useContext(CurrentUserContext);

  const { data, loading, refetch } = useQuery(SETTINGS_QUERY, {
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (currentUser && !currentUser._id) {
      navigate('/');
    }
  }, [currentUser]);

  if (currentUser && !currentUser._id) {
    return null;
  } else {
    if (loading) {
      return <LoadingIndicator />;
    }
    if (data) {
      const lapseSettings = data.settings.lapseSettings;
      const learningSettings = data.settings.learningSettings;
      return (
        <div className={animClass}>
          <Container text style={{ paddingTop: '4em' }}>
            <Grid textAlign="center">
              <Grid.Column style={{ textAlign: 'inherit' }}>
                <Header size="large" color="teal" textAlign="center">
                  Settings
                </Header>
                <SettingsForm
                  refetch={refetch}
                  lapseSettings={lapseSettings}
                  learningSettings={learningSettings}
                />
              </Grid.Column>
            </Grid>
          </Container>
        </div>
      );
    } else {
      return <LoadingIndicator />;
    }
  }
};

export default Settings;
