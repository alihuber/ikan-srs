import { Table } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

export function CardsTableHeader({ handleSort, column, direction }) {
  return (
    // <Table.HeaderCell
    //   width={1}
    //   sorted={column === '_id' ? direction : null}
    //   onClick={() => handleSort('_id')}
    // >
    //   #
    // </Table.HeaderCell>
    // <Table.HeaderCell
    //   width={3}
    //   sorted={column === 'username' ? direction : null}
    //   onClick={() => handleSort('username')}
    // >
    //   Username
    // </Table.HeaderCell>
    // <Table.HeaderCell
    //   width={3}
    //   sorted={column === 'createdAt' ? direction : null}
    //   onClick={() => handleSort('createdAt')}
    // >
    //   createdAt
    // </Table.HeaderCell>
    // <Table.HeaderCell
    //   width={1}
    //   sorted={column === 'admin' ? direction : null}
    //   onClick={() => handleSort('admin')}
    // >
    //   admin
    // </Table.HeaderCell>
    // <Table.HeaderCell
    //   width={1}
    // >
    //   Actions
    // </Table.HeaderCell>
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
