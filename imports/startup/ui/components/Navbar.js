import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Menu } from 'semantic-ui-react';

import CurrentUserContext from '../contexts/CurrentUserContext';

const handleLogout = (history) => {
  Meteor.logout(() => {
    toast.success('Logout successful!', {
      position: toast.POSITION.BOTTOM_CENTER,
    });
    history.push('/');
  });
};

const handleHome = (history) => {
  history.push('/');
};

const handleUsers = (history) => {
  history.push('/users');
};

const handleLogin = (history) => {
  history.push('/login');
};

const Navbar = (props) => {
  const history = useHistory();
  const currentUser = useContext(CurrentUserContext);
  return (
    <Menu fixed="top" inverted>
      <Container>
        <Menu.Item as="a" onClick={() => handleHome(history)}>
          Home
        </Menu.Item>

        {!currentUser || !currentUser._id ? (
          <Menu.Item position="right" as="a" header onClick={() => handleLogin(history)}>
            Login
          </Menu.Item>
        ) : null}
        {currentUser && currentUser.username ? (
          <Menu.Item position="right" as="a">
            Logged in as:&nbsp;
            {currentUser.username}
          </Menu.Item>
        ) : null}
        {currentUser && currentUser.admin ? <Menu.Item onClick={() => handleUsers(history)}>Users</Menu.Item> : null}
        {currentUser && currentUser._id ? (
          <Menu.Item position="right" as="a" onClick={() => handleLogout(history)}>
            Logout
          </Menu.Item>
        ) : null}
      </Container>
    </Menu>
  );
};

export default Navbar;
