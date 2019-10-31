import React, { useContext } from 'react';
import { Header } from 'semantic-ui-react';
import UsersTable from './UsersTable';
import CurrentUserContext from '../../contexts/CurrentUserContext';
import AnimContext from '../../contexts/AnimContext';

const Users = () => {
  const animClass = useContext(AnimContext);
  const currentUser = useContext(CurrentUserContext);
  return (
    <div className={animClass}>
      <Header as="h2" color="teal" textAlign="center">
        Users
      </Header>
      {currentUser && currentUser.admin ? <UsersTable /> : null}
    </div>
  );
};

export default Users;
