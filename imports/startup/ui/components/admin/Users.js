import React, { useContext } from 'react';
import Typography from '@material-ui/core/Typography';
import CurrentUserContext from '../../contexts/CurrentUserContext';
import LoadingContext from '../../contexts/LoadingContext';

import UsersTable from './UsersTable';

const Users = () => {
  const { loading, setLoading } = useContext(LoadingContext);
  if (loading) {
    setLoading(false);
  }
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
