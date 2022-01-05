import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Menu, Dropdown } from 'semantic-ui-react';

import CurrentUserContext from './contexts/CurrentUserContext';

const handleLogout = (navigate) => {
  Meteor.logout(() => {
    toast.success('Logout successful!', {
      position: toast.POSITION.BOTTOM_CENTER,
    });
    navigate('/');
  });
};

const handleDashboard = (navigate) => {
  navigate('/dashboard');
};

const handleUsers = (navigate) => {
  navigate('/users');
};

const handleLogin = (navigate) => {
  navigate('/login');
};

const handleDecks = (navigate) => {
  navigate('/decks');
};

const handleSettings = (navigate) => {
  navigate('/settings');
};

const Navbar = () => {
  const navigate = useNavigate();
  const currentUser = useContext(CurrentUserContext);
  return (
    <Menu fixed="top" inverted>
      <Container>
        {currentUser && currentUser._id && !currentUser.admin ? (
          <Menu.Item
            as="a"
            onClick={() => handleDashboard(navigate)}
            itemname="dashboardButton"
          >
            Dashboard
          </Menu.Item>
        ) : null}
        {currentUser && currentUser.admin ? (
          <Menu.Item
            as="a"
            onClick={() => handleUsers(navigate)}
            itemname="usersButton"
          >
            Users
          </Menu.Item>
        ) : null}

        {!currentUser || !currentUser._id ? (
          <Menu.Item
            position="right"
            as="a"
            header
            onClick={() => handleLogin(navigate)}
            itemname="loginButton"
          >
            Login
          </Menu.Item>
        ) : null}
        {currentUser && currentUser._id && !currentUser.admin ? (
          <Menu.Menu position="right">
            <Dropdown item text="Menu">
              <Dropdown.Menu>
                <Dropdown.Item as="a" onClick={() => handleDecks(navigate)}>
                  Decks
                </Dropdown.Item>
                <Dropdown.Item as="a" onClick={() => handleSettings(navigate)}>
                  Settings
                </Dropdown.Item>
                <Dropdown.Item as="a" onClick={() => handleLogout(navigate)}>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Menu>
        ) : null}
        {currentUser && currentUser._id && currentUser.admin ? (
          <Menu.Item
            position="right"
            as="a"
            onClick={() => handleLogout(navigate)}
            itemname="logoutButton"
          >
            Logout
          </Menu.Item>
        ) : null}
      </Container>
    </Menu>
  );
};

export default Navbar;
