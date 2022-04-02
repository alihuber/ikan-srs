import { Meteor } from 'meteor/meteor';
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Header } from 'semantic-ui-react';
import UsersList from './UsersList';
import CurrentUserContext from '../../contexts/CurrentUserContext';
import AnimContext from '../../contexts/AnimContext';

const Users = () => {
  const navigate = useNavigate();
  const animClass = useContext(AnimContext);
  const currentUser = useContext(CurrentUserContext);
  useEffect(() => {
    if (currentUser && !currentUser.admin) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser]);

  return (
    <div className={animClass}>
      <Container style={{ paddingTop: '4em' }}>
        <Grid textAlign="center">
          <Grid.Column style={{ textAlign: 'inherit' }}>
            <Header size="large" color="teal" textAlign="center">
              Users
            </Header>
            {currentUser && currentUser.admin ? <UsersList /> : null}
          </Grid.Column>
        </Grid>
      </Container>
    </div>
  );
};

export default Users;
