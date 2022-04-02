import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useQuery } from '@apollo/client';
import {
  Button,
  Card,
  Divider,
  Container,
  Grid,
  Header,
} from 'semantic-ui-react';
import format from 'date-fns/format';
import LineChart from './Linechart';
import AnimContext from '../../contexts/AnimContext';
import CurrentUserContext from '../../contexts/CurrentUserContext';
import { STATS_QUERY } from '../../../../api/stats/constants';
import LoadingIndicator from '../../LoadingIndicator';
import AddCardModal from '../cards/AddCardModal';
import {
  DECKS_NAME_QUERY,
  LEARNABLE_DECKS_QUERY,
} from '../../../../api/decks/constants';

const handleLearn = (deckId, nav) => {
  nav(`/learn/${deckId}`);
};

const learnableDecksList = (learnable, navigate) => {
  return (
    <>
      <Header as="h2" color="teal" textAlign="center">
        {`Learnable Decks (${learnable.length})`}
      </Header>
      <Card.Group>
        {learnable.map((deck) => (
          <Card fluid key={deck._id}>
            <Card.Content>
              <Button
                color="green"
                floated="right"
                onClick={() => handleLearn(deck._id, navigate)}
              >
                Learn now
              </Button>
              <Card.Header>{deck.name}</Card.Header>
              <Card.Meta>
                Number of due cards: &nbsp;
                <b style={{ color: 'red' }}>{deck.dueCards}</b>
              </Card.Meta>
              <Card.Meta>
                Next due card: &nbsp;
                <b style={{ color: 'black' }}>
                  {format(deck.nextDueCard, 'dd.MM.yyyy HH:mm')}
                </b>
              </Card.Meta>
            </Card.Content>
          </Card>
        ))}
      </Card.Group>
    </>
  );
};

const Dashboard = () => {
  const animClass = useContext(AnimContext);
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });
  const navigate = useNavigate();
  const currentUser = useContext(CurrentUserContext);
  const { data, loading } = useQuery(STATS_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
  });
  const { data: deckData, loading: decksLoading } = useQuery(DECKS_NAME_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
  });
  const {
    data: learnableData,
    loading: learnableLoading,
    refetch: learnableRefetch,
  } = useQuery(LEARNABLE_DECKS_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (currentUser && (!currentUser._id || currentUser.admin)) {
      navigate('/');
    }
  }, [currentUser]);

  if (currentUser && (!currentUser._id || currentUser.admin)) {
    return null;
  } else {
    if (loading || decksLoading) {
      return <LoadingIndicator />;
    }
    if (data && data.stats && deckData && deckData.deckNameIds) {
      return (
        <div className={animClass}>
          <Container text style={{ paddingTop: '4em' }}>
            <Grid verticalAlign="middle">
              <Grid.Column>
                <Header size="large" color="teal" textAlign="center">
                  Dashboard
                </Header>
                {deckData.deckNameIds.length !== 0 ? (
                  <AddCardModal
                    decks={deckData.deckNameIds}
                    refetch={learnableRefetch}
                  />
                ) : null}
                <Divider />
                <Header as="h2" color="teal" textAlign="center">
                  Stats
                </Header>
                <LineChart
                  data={data.stats}
                  isTabletOrMobile={isTabletOrMobile}
                />
                {learnableLoading
                  ? null
                  : learnableData &&
                    learnableData.learnable &&
                    learnableData.learnable.length !== 0 &&
                    learnableDecksList(learnableData.learnable, navigate)}
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
