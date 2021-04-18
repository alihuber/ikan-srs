import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  Button,
  Divider,
  Container,
  Grid,
  Header,
  Modal,
} from 'semantic-ui-react';
import LineChart from './Linechart';
import AnimContext from '../../contexts/AnimContext';
import CurrentUserContext from '../../contexts/CurrentUserContext';
import { STATS_QUERY } from '../../../../api/stats/constants';
import LoadingIndicator from '../../LoadingIndicator';
import AddCardModal from '../cards/AddCardModal';
import { DECKS_QUERY } from '../../../../api/decks/constants';

const Dashboard = () => {
  const animClass = useContext(AnimContext);
  const history = useHistory();
  const currentUser = useContext(CurrentUserContext);
  const { data, loading, refetch } = useQuery(STATS_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
  });
  const {
    data: deckData,
    loading: decksLoading,
    refetch: refetchDecks,
  } = useQuery(DECKS_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
  });

  if (currentUser && (!currentUser._id || currentUser.admin)) {
    history.push('/');
    return null;
  } else {
    if (loading) {
      return <LoadingIndicator />;
    }
    if (data && data.stats && deckData && deckData.decks) {
      return (
        <div className={animClass}>
          <Container text style={{ paddingTop: '4em' }}>
            <Grid verticalAlign="middle">
              <Grid.Column>
                <Header size="large" color="teal" textAlign="center">
                  Dashboard
                </Header>
                {deckData.decks.length !== 0 ? (
                  <AddCardModal decks={deckData.decks} refetch={refetchDecks} />
                ) : null}
                <Divider />
                <Header as="h2" color="teal" textAlign="center">
                  Stats
                </Header>
                <LineChart data={data.stats} />
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

export default Dashboard;
