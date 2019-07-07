import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/Check';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { Mutation } from 'react-apollo';
import EditUserDialog from './EditUserDialog';
import { DELETE_USER_MUTATION, UPDATE_USER_MUTATION } from '../../../../api/users/constants';

const UsersTableBody = ({ classes, usersList, editDialogOpen, handleEditClickOpen, handleEditClose, handleDelete, refetch }) => {
  return (
    <TableBody>
      {usersList
        && usersList.map((user) => {
          const editOpen = editDialogOpen[user._id] || false;
          return (
            <TableRow className={classes.row} key={user._id}>
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
                  className={classes.button}
                  onClick={() => handleEditClickOpen(user._id)}
                >
                  Edit
                  <EditIcon className={classNames(classes.rightIcon, classes.iconSmall)} />
                </Button>
                <Mutation mutation={DELETE_USER_MUTATION}>
                  {(deleteUser) => {
                    return (
                      <Button
                        name={'deleteUser_' + user._id}
                        size="small"
                        variant="contained"
                        color="secondary"
                        className={classes.button}
                        onClick={() => handleDelete(user._id, deleteUser, refetch)}
                      >
                        Delete
                        <DeleteIcon className={classNames(classes.rightIcon, classes.iconSmall)} />
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
  );
};

UsersTableBody.propTypes = {
  classes: PropTypes.object.isRequired,
  usersList: PropTypes.array.isRequired,
  editDialogOpen: PropTypes.func.isRequired,
  handleEditClickOpen: PropTypes.func.isRequired,
  handleEditClose: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
};

export default UsersTableBody;
