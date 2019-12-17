import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import { Icon, Table, Button, Modal, Responsive, Divider } from 'semantic-ui-react';
import LoadingIndicator from './LoadingIndicator';
import { CARDS_FOR_DECK_QUERY } from '../../../api/decks/constants';

const CardsTable = () => {
  const history = useHistory();
  const deckId = history.location.pathname.split('/')[2];
  const [pageNum, setPageNum] = useState(0);
  const { data, loading, refetch, fetchMore } = useQuery(CARDS_FOR_DECK_QUERY, {
    notifyOnNetworkStatusChange: true,
    variables: { deckId },
  });

  const handleDelete = (cardId, deleteCardFunc, reFetch) => {
    deleteCardFunc({ variables: { cardId } }).then(() => {
      reFetch();
      setPageNum(0);
      toast.success('Deletion successful!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    });
  };

  const handleChangePage = (_, page, fetchmore) => {
    fetchmore({
      variables: {
        pageNum: page + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return fetchMoreResult;
      },
    });
    setPageNum(page);
  };

  if (loading) {
    return <LoadingIndicator />;
  }
  if (data) {
    const { cardsList } = data.cardsForDeck;
    const tableHeader = (
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>ID</Table.HeaderCell>
          <Table.HeaderCell>Front</Table.HeaderCell>
          <Table.HeaderCell>Back</Table.HeaderCell>
          <Table.HeaderCell colSpan="2"></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
    );
    const tableBody = (
      <Table.Body>
        {cardsList &&
          cardsList.map(card => {
            return (
              <Table.Row key={card._id}>
                <Table.Cell>{card._id}</Table.Cell>
                <Table.Cell collapsing>{card.front}</Table.Cell>
                <Table.Cell collapsing>{card.back}</Table.Cell>
                <Table.Cell collapsing textAlign="right">
                  <Modal
                    trigger={
                      <Button compact size="mini" primary name={'editCard' + card._id}>
                        Edit
                      </Button>
                    }
                  />
                  <Button
                    name={'deleteCard_' + card._id}
                    compact
                    size="mini"
                    secondary
                    onClick={() => handleDelete(card._id, deleteCard, refetch)}
                  >
                    Delete
                  </Button>
                </Table.Cell>
              </Table.Row>
            );
          })}
      </Table.Body>
    );

    return (
      <>
        <Modal
          trigger={
            <Button name="addCardButton" size="small" primary>
              Add Card
            </Button>
          }
        />
        <Divider />
        <Responsive minWidth={768}>
          <Table celled striped compact>
            {tableHeader}
            {tableBody}
          </Table>
        </Responsive>
        <Responsive maxWidth={768}>
          <Table celled striped compact>
            {tableBody}
          </Table>
        </Responsive>
      </>
    );
  } else {
    return <LoadingIndicator />;
  }
};

export default CardsTable;
