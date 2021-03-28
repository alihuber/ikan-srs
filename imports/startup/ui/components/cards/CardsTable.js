import React from 'react';
import PropTypes from 'prop-types';
import { Table, Pagination, Button } from 'semantic-ui-react';
import { PageSizeSelect } from '../PageSizeSelect';
import { CardRow } from './CardRow';
import { CardsTableHeader } from './CardsTableHeader';

const CardsTable = ({
  setPageNum,
  refetch,
  cardsList,
  totalCount,
  limit,
  onChangeLimit,
  column,
  direction,
  handleSort,
  currentPage,
  totalPages,
  handleDeleteCard,
  handleResetCard,
  handleResetDeck,
  deckId,
  onChangePage,
}) => {
  if (!cardsList) {
    return null;
  }
  const cardsRows = cardsList.map((card) => (
    <CardRow
      handleDeleteCard={handleDeleteCard}
      handleResetCard={handleResetCard}
      key={card._id}
      card={card}
      refetch={refetch}
      setPageNum={setPageNum}
    />
  ));
  return (
    <>
      <PageSizeSelect limit={limit} onChangeLimit={onChangeLimit} />
      Total count: {totalCount}
      <Table celled selectable sortable>
        <CardsTableHeader
          column={column}
          direction={direction}
          handleSort={handleSort}
        />

        <Table.Body>{cardsRows}</Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="8">
              <Pagination
                totalPages={totalPages}
                activePage={currentPage}
                onPageChange={onChangePage}
              />
              <Button
                floated="right"
                size="small"
                onClick={() => handleResetDeck(deckId)}
              >
                Reset All Cards
              </Button>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </>
  );
};

CardsTable.propTypes = {
  setPageNum: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  cardsList: PropTypes.array,
  totalCount: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangeLimit: PropTypes.func.isRequired,
  limit: PropTypes.string.isRequired,
  column: PropTypes.string.isRequired,
  direction: PropTypes.string,
  handleSort: PropTypes.func.isRequired,
  handleDeleteCard: PropTypes.func.isRequired,
  handleResetCard: PropTypes.func.isRequired,
  handleResetDeck: PropTypes.func.isRequired,
  deckId: PropTypes.string.isRequired,
};

export default CardsTable;
