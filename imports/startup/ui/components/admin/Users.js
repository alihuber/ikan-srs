import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Grid, Header } from 'semantic-ui-react';
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
      <Container style={{ paddingTop: '4em' }}>
        <Grid textAlign="center">
          <Grid.Column style={{ textAlign: 'inherit' }}>
            <Header size="large" color="teal" textAlign="center">
              Users
            </Header>
            {currentUser && currentUser.admin ? <UsersTable /> : null}
          </Grid.Column>
        </Grid>
      </Container>
    </div>
  );
};

export default Users;
