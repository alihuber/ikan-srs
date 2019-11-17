import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import { Icon, Table, Button, Modal, Responsive, Divider } from 'semantic-ui-react';
import LoadingIndicator from '../LoadingIndicator';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import UsersTableFooter from './UsersTableFooter';
import { DELETE_USER_MUTATION, USERS_QUERY } from '../../../../api/users/constants';

const UsersTable = () => {
  const [pageNum, setPageNum] = useState(0);
  const { data, loading, refetch, fetchMore } = useQuery(USERS_QUERY, {
    notifyOnNetworkStatusChange: true,
  });
  const [deleteUser, _] = useMutation(DELETE_USER_MUTATION);

  const handleDelete = (userId, deleteUserFunc, reFetch) => {
    deleteUserFunc({ variables: { userId } }).then(() => {
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
    const { usersList, usersCount } = data.users;
    const tableHeader = (
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>ID</Table.HeaderCell>
          <Table.HeaderCell>Username</Table.HeaderCell>
          <Table.HeaderCell>Admin</Table.HeaderCell>
          <Table.HeaderCell colSpan="2"></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
    );
    const tableBody = (
      <Table.Body>
        {usersList
          && usersList.map((user) => {
            return (
              <Table.Row key={user._id}>
                <Table.Cell>{user._id}</Table.Cell>
                <Table.Cell collapsing>{user.username}</Table.Cell>
                <Table.Cell collapsing textAlign="center">
                  {user.admin ? <Icon name="check" /> : null}
                </Table.Cell>
                <Table.Cell collapsing textAlign="right">
                  <Modal
                    trigger={(
                      <Button compact size="mini" primary name={'editUser_' + user._id}>
                        Edit
                      </Button>
                    )}
                  >
                    <EditUserModal
                      userId={user._id}
                      username={user.username}
                      admin={user.admin}
                      refetch={refetch}
                      setPageNum={setPageNum}
                    />
                  </Modal>
                  <Button
                    name={'deleteUser_' + user._id}
                    compact
                    size="mini"
                    secondary
                    onClick={() => handleDelete(user._id, deleteUser, refetch)}
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
          trigger={(
            <Button name="addUserButton" size="small" primary>
              Add User
            </Button>
          )}
        >
          <AddUserModal refetch={refetch} setPageNum={setPageNum} />
        </Modal>
        <Divider />
        <Responsive minWidth={768}>
          <Table celled striped compact>
            {tableHeader}
            {tableBody}
            <UsersTableFooter
              count={usersCount}
              page={pageNum}
              rowsPerPage={5}
              onChangePage={(evt, page) => handleChangePage(evt, page, fetchMore)}
            />
          </Table>
        </Responsive>
        <Responsive maxWidth={768}>
          <Table celled striped compact>
            {tableBody}
            <UsersTableFooter
              count={usersCount}
              page={pageNum}
              rowsPerPage={5}
              onChangePage={(evt, page) => handleChangePage(evt, page, fetchMore)}
            />
          </Table>
        </Responsive>
      </>
    );
  } else {
    return <LoadingIndicator />;
  }
};

export default UsersTable;
