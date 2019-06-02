import { Meteor } from 'meteor/meteor';
import React, { setGlobal } from 'reactn';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CurrentUserContext from '../contexts/CurrentUserContext';

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flexGrow: 1,
    cursor: 'pointer',
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

const handleLogout = (history) => {
  setGlobal({ loading: true });
  Meteor.logout(() => {
    toast.success('Logout successful!', {
      position: toast.POSITION.BOTTOM_CENTER,
    });
    history.push('/');
  });
};

const handleHome = (history) => {
  setGlobal({ loading: true });
  history.push('/');
};

const handleUsers = (history) => {
  setGlobal({ loading: true });
  history.push('/users');
};

const Navbar = (props) => {
  const { classes, history } = props;
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" color="inherit" className={classes.flex} onClick={() => handleHome(history)}>
            Home
          </Typography>
          <CurrentUserContext.Consumer>
            {currentUser => (
              <React.Fragment>
                {!currentUser || !currentUser._id ? (
                  <Button name="loginButton" color="inherit" component={NavLink} to="/login">
                    Login
                  </Button>
                ) : null}
                {currentUser && currentUser.username ? (
                  <Typography>
                    Logged in as:&nbsp;
                    {currentUser.username}
                  </Typography>
                ) : null}
                {currentUser && currentUser.admin ? (
                  <Button name="usersButton" color="inherit" onClick={() => handleUsers(history)}>
                    Users
                  </Button>
                ) : null}
                {currentUser && currentUser._id ? (
                  <Button name="logoutButton" color="inherit" onClick={() => handleLogout(history)}>
                    Logout
                  </Button>
                ) : null}
              </React.Fragment>
            )}
          </CurrentUserContext.Consumer>
        </Toolbar>
      </AppBar>
    </div>
  );
};

Navbar.propTypes = {
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Navbar);
