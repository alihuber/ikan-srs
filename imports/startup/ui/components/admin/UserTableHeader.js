import { Table } from 'semantic-ui-react';
import React from 'react';

export function UserTableHeader({ handleSort, column, direction }) {
  return (
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell
          width={1}
          sorted={column === '_id' ? direction : null}
          onClick={() => handleSort('_id')}
        >
          #
        </Table.HeaderCell>
        <Table.HeaderCell
          width={3}
          sorted={column === 'username' ? direction : null}
          onClick={() => handleSort('username')}
        >
          Username
        </Table.HeaderCell>
        <Table.HeaderCell
          width={3}
          sorted={column === 'createdAt' ? direction : null}
          onClick={() => handleSort('createdAt')}
        >
          createdAt
        </Table.HeaderCell>
        <Table.HeaderCell
          width={1}
          sorted={column === 'admin' ? direction : null}
          onClick={() => handleSort('admin')}
        >
          admin
        </Table.HeaderCell>
        <Table.HeaderCell
          width={1}
        >
          Actions
        </Table.HeaderCell>
      </Table.Row>
    </Table.Header>
  );
}
