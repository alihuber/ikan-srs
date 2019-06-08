import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { Query, Mutation } from 'react-apollo';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckIcon from '@material-ui/icons/Check';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';

import AddUserDialog from './AddUserDialog';
import EditUserDialog from './EditUserDialog';
import { USERS_QUERY, DELETE_USER_MUTATION, UPDATE_USER_MUTATION, CREATE_USER_MUTATION } from '../../../../api/users/constants';

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

const UsersTable = (props) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState({});

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
      toast.success('Deletion successful!', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    });
  };

  return (
    <>
      <Query query={USERS_QUERY}>
        {({ data, refetch }) => {
          if (data) {
            const { users } = data;
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
                  <TableBody>
                    {users
                      && users.map((user) => {
                        const editOpen = editDialogOpen[user._id] || false;
                        return (
                          <TableRow className={props.classes.row} key={user._id}>
                            <TableCell component="th" scope="row">
                              {user._id}
                            </TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.admin ? <CheckIcon /> : null}</TableCell>
                            <TableCell>
                              <Button
                                name={'editUser_' + user._id}
                                size="small"
                                variant="contained"
                                color="secondary"
                                className={props.classes.button}
                                onClick={() => handleEditClickOpen(user._id)}
                              >
                                Edit
                                <EditIcon className={classNames(props.classes.rightIcon, props.classes.iconSmall)} />
                              </Button>
                              <Mutation mutation={DELETE_USER_MUTATION}>
                                {(deleteUser) => {
                                  return (
                                    <Button
                                      name={'deleteUser_' + user._id}
                                      size="small"
                                      variant="contained"
                                      color="secondary"
                                      className={props.classes.button}
                                      onClick={() => handleDelete(user._id, deleteUser, refetch)}
                                    >
                                      Delete
                                      <DeleteIcon className={classNames(props.classes.rightIcon, props.classes.iconSmall)} />
                                    </Button>
                                  );
                                }}
                              </Mutation>
                              <Mutation mutation={UPDATE_USER_MUTATION}>
                                {(updateUser) => {
                                  return (
                                    <EditUserDialog
                                      open={editOpen}
                                      onClose={() => handleEditClose(user._id)}
                                      updateUser={updateUser}
                                      refetch={refetch}
                                      userId={user._id}
                                      username={user.username}
                                      admin={user.admin}
                                    />
                                  );
                                }}
                              </Mutation>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
                <Mutation mutation={CREATE_USER_MUTATION}>
                  {(createUser) => {
                    return <AddUserDialog open={addDialogOpen} onClose={handleAddClose} createUser={createUser} refetch={refetch} />;
                  }}
                </Mutation>
              </>
            );
          } else {
            return <CircularProgress />;
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
