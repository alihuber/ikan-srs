import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { Query, Mutation } from 'react-apollo';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableFooter from '@material-ui/core/TableFooter';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';

import UsersTableBody from './UsersTableBody';
import TablePaginationActions from './TablePaginationActions';
import Loading from '../Loading';
import AddUserDialog from './AddUserDialog';
import { USERS_QUERY, CREATE_USER_MUTATION } from '../../../../api/users/constants';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
  button: {
    margin: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  iconSmall: {
    fontSize: 20,
  },
});

const TablePaginationActionsWrapped = withStyles(styles, { withTheme: true })(TablePaginationActions);

const UsersTable = (props) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState({});
  const [pageNum, setPageNum] = useState(0);

  const handleAddClickOpen = () => {
    setAddDialogOpen(true);
  };

  const handleAddClose = () => {
    setAddDialogOpen(false);
  };

  const handleEditClickOpen = (userId) => {
    const openObj = {};
    openObj[userId] = true;
    setEditDialogOpen(openObj);
  };

  const handleEditClose = (userId) => {
    const openObj = editDialogOpen[userId] || {};
    openObj[userId] = false;
    setEditDialogOpen(openObj);
  };

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

  return (
    <>
      <Query query={USERS_QUERY} notifyOnNetworkStatusChange>
        {({ data, loading, refetch, fetchMore }) => {
          if (loading) {
            return <Loading />;
          }
          if (data) {
            const { usersList, usersCount } = data.users;
            return (
              <>
                <Button
                  name="addUserButton"
                  size="small"
                  variant="contained"
                  color="secondary"
                  className={props.classes.button}
                  onClick={handleAddClickOpen}
                >
                  Add User
                  <AddIcon className={classNames(props.classes.rightIcon, props.classes.iconSmall)} />
                </Button>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Admin</TableCell>
                      <TableCell>&nbsp;</TableCell>
                    </TableRow>
                  </TableHead>
                  <UsersTableBody
                    classes={props.classes}
                    usersList={usersList}
                    editDialogOpen={editDialogOpen}
                    handleDelete={handleDelete}
                    handleEditClickOpen={handleEditClickOpen}
                    handleEditClose={handleEditClose}
                    refetch={refetch}
                  />
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                        rowsPerPageOptions={[5]}
                        rowsPerPage={5}
                        colSpan={3}
                        count={usersCount}
                        page={pageNum}
                        onChangePage={(evt, page) => handleChangePage(evt, page, fetchMore)}
                        ActionsComponent={TablePaginationActionsWrapped}
                      />
                    </TableRow>
                  </TableFooter>
                </Table>
                <Mutation mutation={CREATE_USER_MUTATION}>
                  {(createUser) => {
                    return (
                      <AddUserDialog
                        open={addDialogOpen}
                        onClose={handleAddClose}
                        createUser={createUser}
                        refetch={refetch}
                        setPageNum={setPageNum}
                      />
                    );
                  }}
                </Mutation>
              </>
            );
          } else {
            return <Loading />;
          }
        }}
      </Query>
    </>
  );
};

UsersTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UsersTable);
