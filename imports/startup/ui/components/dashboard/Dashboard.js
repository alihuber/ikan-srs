import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
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

const handleLearn = (deckId, hist) => {
  hist.push(`/learn/${deckId}`);
};

const Dashboard = () => {
  const animClass = useContext(AnimContext);
  const history = useHistory();
  const currentUser = useContext(CurrentUserContext);
  const { data, loading } = useQuery(STATS_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
  });
  const {
    data: deckData,
    loading: decksLoading,
    refetch: refetchDecks,
  } = useQuery(DECKS_NAME_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
  });
  const { data: learnableData, loading: learnableLoading } = useQuery(
    LEARNABLE_DECKS_QUERY,
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'no-cache',
    }
  );

  if (currentUser && (!currentUser._id || currentUser.admin)) {
    history.push('/');
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
                    refetch={refetchDecks}
                  />
                ) : null}
                <Divider />
                <Header as="h2" color="teal" textAlign="center">
                  Stats
                </Header>
                <LineChart data={data.stats} />
                <Header as="h2" color="teal" textAlign="center">
                  Learnable Decks
                </Header>
                <Card.Group>
                  {learnableLoading
                    ? null
                    : learnableData &&
                      learnableData.learnable &&
                      learnableData.learnable.map((deck) => (
                        <Card fluid key={deck._id}>
                          <Card.Content>
                            <Button
                              color="green"
                              floated="right"
                              onClick={() => handleLearn(deck._id, history)}
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
