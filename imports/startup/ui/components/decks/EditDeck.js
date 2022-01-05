import React, { useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Container, Grid, Header } from 'semantic-ui-react';
import format from 'date-fns/format';
import AnimContext from '../../contexts/AnimContext';
import CurrentUserContext from '../../contexts/CurrentUserContext';
import { DECK_QUERY } from '../../../../api/decks/constants';
import LoadingIndicator from '../../LoadingIndicator';
import CardsList from '../cards/CardsList';

const EditDeck = () => {
  const animClass = useContext(AnimContext);
  const navigate = useNavigate();
  const params = useParams();
  const deckId = params.deckId;
  const currentUser = useContext(CurrentUserContext);
  const { data, loading } = useQuery(DECK_QUERY, {
    notifyOnNetworkStatusChange: true,
    variables: { deckId },
  });
  if (currentUser && (!currentUser._id || currentUser.admin)) {
    navigate('/');
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
                  Deck {data.deckQuery.name}
                </Header>
                <Header size="small" color="teal" textAlign="center">
                  Created:{' '}
                  {format(data.deckQuery.createdAt, 'dd.MM.yyyy HH:mm')} #
                  Cards: {data.deckQuery.cards.length}
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
