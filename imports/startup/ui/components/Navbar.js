import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Menu, Dropdown } from 'semantic-ui-react';

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

const handleSettings = (history) => {
  history.push('/settings');
};

const Navbar = () => {
  const history = useHistory();
  const currentUser = useContext(CurrentUserContext);
  return (
    <Menu fixed="top" inverted>
      <Container>
        <Menu.Item as="a" onClick={() => handleHome(history)} itemname="homeButton">
          Home
        </Menu.Item>
        {currentUser && currentUser.admin ? (
          <Menu.Item as="a" onClick={() => handleUsers(history)} itemname="usersButton">
            Users
          </Menu.Item>
        ) : null}

        {!currentUser || !currentUser._id ? (
          <Menu.Item
            position="right" as="a" header onClick={() => handleLogin(history)}
            itemname="loginButton"
          >
            Login
          </Menu.Item>
        ) : null}
        {currentUser && currentUser._id && !currentUser.admin ? (
          <Menu.Menu position="right">
            <Dropdown item text="Menu">
              <Dropdown.Menu>
                <Dropdown.Item as="a" onClick={() => handleSettings(history)}>
                  Settings
                </Dropdown.Item>
                <Dropdown.Item as="a" onClick={() => handleLogout(history)}>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Menu>
        ) : null}
        {currentUser && currentUser._id && currentUser.admin ? (
          <Menu.Item position="right" as="a" onClick={() => handleLogout(history)} itemname="logoutButton">
            Logout
          </Menu.Item>
        ) : null}
      </Container>
    </Menu>
  );
};

export default Navbar;
