import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Header } from 'semantic-ui-react';
import UsersTable from './UsersTable';
import CurrentUserContext from '../../contexts/CurrentUserContext';
import AnimContext from '../../contexts/AnimContext';

const Users = () => {
  const history = useHistory();
  const animClass = useContext(AnimContext);
  const currentUser = useContext(CurrentUserContext);
  if (currentUser && !currentUser.admin) {
    history.push('/');
  }
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
