import React from 'react';
import { Button, Table, Modal, Icon } from 'semantic-ui-react';
import truncate from 'lodash/truncate';
import PropTypes from 'prop-types';
import format from 'date-fns/format';
import EditCardModal from './EditCardModal';

export const CardRow = ({
  card,
  handleDeleteCard,
  handleResetCard,
  refetch,
}) => {
  return (
    <Table.Row>
      <Table.Cell>{truncate(card._id, { length: 6 })}</Table.Cell>
      <Table.Cell>{truncate(card.front, { length: 50 })}</Table.Cell>
      <Table.Cell>{truncate(card.back, { length: 50 })}</Table.Cell>
      <Table.Cell>{format(card.dueDate, 'dd.MM.yyyy HH:mm:ss')}</Table.Cell>
      <Table.Cell>{card.state}</Table.Cell>
      <Table.Cell>{card.tags}</Table.Cell>
      <Table.Cell>
        <Modal
          trigger={
            <Button
              compact
              size="mini"
              icon
              primary
              name={'editCard' + card._id}
              title="Edit"
            >
              <Icon name="edit" />
            </Button>
          }
        >
          <EditCardModal card={card} refetch={refetch} />
        </Modal>
        <Button
          name={'deleteCard_' + card._id}
          title="Delete"
          icon
          compact
          size="mini"
          color="red"
          onClick={() => handleDeleteCard(card._id)}
        >
          <Icon name="trash" />
        </Button>
        <Button
          name={'resetCard_' + card._id}
          title="Reset"
          icon
          compact
          size="mini"
          secondary
          onClick={() => handleResetCard(card._id)}
        >
          <Icon name="history" />
        </Button>
      </Table.Cell>
    </Table.Row>
  );
};

CardRow.propTypes = {
  card: PropTypes.object.isRequired,
  handleDeleteCard: PropTypes.func.isRequired,
  handleResetCard: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
};
