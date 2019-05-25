import React, { setGlobal } from 'reactn';
import Typography from '@material-ui/core/Typography';
import CurrentUserContext from '../../contexts/CurrentUserContext';

import UsersTable from './UsersTable';

const Users = () => {
  setGlobal({ loading: false });
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
