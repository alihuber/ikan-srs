import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import { Container, Grid, Header } from 'semantic-ui-react';
import AnimContext from '../contexts/AnimContext';
import CurrentUserContext from '../contexts/CurrentUserContext';
import { DECK_QUERY } from '../../../api/decks/constants';
import LoadingIndicator from './LoadingIndicator';
import CardsTable from './CardsTable';

const EditDeck = () => {
  const animClass = useContext(AnimContext);
  const history = useHistory();
  const deckId = history.location.pathname.split('/')[2];
  const currentUser = useContext(CurrentUserContext);
  const { data, loading, refetch } = useQuery(DECK_QUERY, {
    notifyOnNetworkStatusChange: true,
    variables: { deckId },
  });
  if (currentUser && (!currentUser._id || currentUser.admin)) {
    history.push('/');
    return null;
  } else {
    if (loading) {
      return <LoadingIndicator />;
    }
    if (data) {
      return (
        <div className={animClass}>
          <Container text style={{ paddingTop: '4em' }}>
            <Grid verticalAlign="middle">
              <Grid.Column>
                <Header size="large" color="teal" textAlign="center">
                  Deck {data.deckQuery.name}
                </Header>
                <CardsTable deck={data.deckQuery} />
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

export default EditDeck;
