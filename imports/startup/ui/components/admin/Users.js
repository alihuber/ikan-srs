import React from 'react';
import Typography from '@material-ui/core/Typography';
import UsersTable from './UsersTable';
import CurrentUserContext from '../../contexts/CurrentUserContext';

const Users = () => {
  return (
    <>
      <Typography variant="h3" gutterBottom>
        Users
      </Typography>
      <CurrentUserContext.Consumer>{currentUser => (currentUser && currentUser.admin ? <UsersTable /> : null)}</CurrentUserContext.Consumer>
    </>
  );
};

export default Users;
