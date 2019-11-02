import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Query, Mutation } from 'react-apollo';
import { Dimmer, Loader, Table, Button, Modal } from 'semantic-ui-react';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import UsersTableFooter from './UsersTableFooter';
import { DELETE_USER_MUTATION, USERS_QUERY } from '../../../../api/users/constants';

const UsersTable = () => {
  const [pageNum, setPageNum] = useState(0);

  const handleDelete = (userId, deleteUser, refetch) => {
    deleteUser({ variables: { userId } }).then(() => {
      refetch();
      setPageNum(0);
      toast.success('Deletion successful!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    });
  };

  const handleChangePage = (_, page, fetchMore) => {
    fetchMore({
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

  const LoadingIndicator = () => (
    <Dimmer active inverted>
      <Loader inverted>Loading</Loader>
    </Dimmer>
  );

  return (
    <>
      <Query query={USERS_QUERY} notifyOnNetworkStatusChange>
        {({ data, loading, refetch, fetchMore }) => {
          if (loading) {
            return <LoadingIndicator />;
          }
          if (data) {
            const { usersList, usersCount } = data.users;
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
                <Table celled striped compact>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>ID</Table.HeaderCell>
                      <Table.HeaderCell>Username</Table.HeaderCell>
                      <Table.HeaderCell>Admin</Table.HeaderCell>
                      <Table.HeaderCell colSpan="2"></Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {usersList
                      && usersList.map((user) => {
                        return (
                          <Table.Row key={user._id}>
                            <Table.Cell>{user._id}</Table.Cell>
                            <Table.Cell collapsing>{user.username}</Table.Cell>
                            <Table.Cell collapsing textAlign="center">
                              {user.admin ? 'yes' : null}
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
                              <Mutation mutation={DELETE_USER_MUTATION}>
                                {(deleteUser) => {
                                  return (
                                    <Button
                                      name={'deleteUser_' + user._id}
                                      compact
                                      size="mini"
                                      secondary
                                      onClick={() => handleDelete(user._id, deleteUser, refetch)}
                                    >
                                      Delete
                                    </Button>
                                  );
                                }}
                              </Mutation>
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                  </Table.Body>
                  <UsersTableFooter
                    count={usersCount}
                    page={pageNum}
                    rowsPerPage={5}
                    onChangePage={(evt, page) => handleChangePage(evt, page, fetchMore)}
                  />
                </Table>
              </>
            );
          } else {
            return <LoadingIndicator />;
          }
        }}
      </Query>
    </>
  );
};

export default UsersTable;
