import { Table } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

export function CardsTableHeader({ handleSort, column, direction }) {
  return (
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell
          sorted={column === '_id' ? direction : null}
          onClick={() => handleSort('_id')}
        >
          ID
        </Table.HeaderCell>
        <Table.HeaderCell
          sorted={column === 'front' ? direction : null}
          onClick={() => handleSort('front')}
        >
          Front
        </Table.HeaderCell>
        <Table.HeaderCell
          sorted={column === 'back' ? direction : null}
          onClick={() => handleSort('back')}
        >
          Back
        </Table.HeaderCell>
        <Table.HeaderCell
          sorted={column === 'dueDate' ? direction : null}
          onClick={() => handleSort('dueDate')}
        >
          Due date
        </Table.HeaderCell>
        <Table.HeaderCell
          sorted={column === 'state' ? direction : null}
          onClick={() => handleSort('state')}
        >
          State
        </Table.HeaderCell>
        <Table.HeaderCell>Tags</Table.HeaderCell>
        <Table.HeaderCell colSpan="2" />
      </Table.Row>
    </Table.Header>
  );
}

CardsTableHeader.propTypes = {
  handleSort: PropTypes.func.isRequired,
  column: PropTypes.string.isRequired,
  direction: PropTypes.string.isRequired,
};
