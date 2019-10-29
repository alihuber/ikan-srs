import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
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
  const { history } = props;
  return (
    <div>
      <h6 onClick={() => handleHome(history)}>
        Home
      </h6>
      <CurrentUserContext.Consumer>
        {currentUser => (
          <React.Fragment>
            {!currentUser || !currentUser._id ? (
              <h6 onClick={() => handleLogin(history)}>
                Login
              </h6>
            ) : null}
            {currentUser && currentUser.username ? (
              <h6>
                Logged in as:&nbsp;
                {currentUser.username}
              </h6>
            ) : null}
            {currentUser && currentUser.admin ? (
              <h6 onClick={() => handleUsers(history)}>
                Users
              </h6>
            ) : null}
            {currentUser && currentUser._id ? (
              <h6 onClick={() => handleLogout(history)}>
                Logout
              </h6>
            ) : null}
          </React.Fragment>
        )}
      </CurrentUserContext.Consumer>
    </div>
  );
};

Navbar.propTypes = {
  history: PropTypes.object.isRequired,
};

export default Navbar;
