import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Container, Grid, Header, Icon, Button } from 'semantic-ui-react';
import moment from 'moment';
import AnimContext from '../contexts/AnimContext';
import CurrentUserContext from '../contexts/CurrentUserContext';
import { DECK_QUERY } from '../../../api/decks/constants';
import LoadingIndicator from './LoadingIndicator';
import CardsList from './CardsList';

const EditDeck = () => {
  const animClass = useContext(AnimContext);
  const history = useHistory();
  const deckId = history.location.pathname.split('/')[2];
  const currentUser = useContext(CurrentUserContext);
  const { data, loading } = useQuery(DECK_QUERY, {
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
          <Container style={{ paddingTop: '4em' }}>
            <Grid verticalAlign="middle">
              <Grid.Column>
                <Header size="large" color="teal" textAlign="center">
                  Deck
                  {' '}
                  {data.deckQuery.name}
                </Header>
                <Header size="small" color="teal" textAlign="center">
                  Created:
                  {' '}
                  {moment(data.deckQuery.createdAt).format('DD.MM.YYYY HH:mm')}
                  {' '}
                  # Cards:
                  {' '}
                  {data.deckQuery.cards.length}
                </Header>
                <CardsList deck={data.deckQuery} />
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
