import React from 'react';
import PropTypes from 'prop-types';
import { Table, Pagination } from 'semantic-ui-react';

import { PageSizeSelect } from '../PageSizeSelect';
import { UserRow } from './UserRow';
import { UsersTableHeader } from './UsersTableHeader';

const UsersTable = ({
  setPageNum,
  refetch,
  usersList,
  totalCount,
  limit,
  onChangeLimit,
  column,
  direction,
  handleSort,
  currentPage,
  totalPages,
  handleDelete,
  onChangePage }) => {
  if (!usersList) {
    return null;
  }
  const usersRows = usersList.map((user) => (
    <UserRow
      handleDelete={handleDelete}
      key={user._id}
      user={user}
      refetch={refetch}
      setPageNum={setPageNum}
    />
  ));
  return (
    <>
      <PageSizeSelect
        limit={limit}
        onChangeLimit={onChangeLimit}
      />
      Total count:
      {' '}
      {totalCount}
      <Table celled selectable sortable>
        <UsersTableHeader
          column={column}
          direction={direction}
          handleSort={handleSort}
        />

        <Table.Body>{usersRows}</Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="8">
              <Pagination
                totalPages={totalPages}
                activePage={currentPage}
                onPageChange={onChangePage}
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </>
  );
};

UsersTable.propTypes = {
  setPageNum: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  usersList: PropTypes.array,
  totalCount: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangeLimit: PropTypes.func.isRequired,
  limit: PropTypes.string.isRequired,
  column: PropTypes.string.isRequired,
  direction: PropTypes.string,
  handleSort: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export default UsersTable;
