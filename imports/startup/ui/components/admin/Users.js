import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import UsersTable from './UsersTable';
import CurrentUserContext from '../../contexts/CurrentUserContext';

const styles = {
  root: {
    paddingTop: 60,
  },
};

const Users = ({ classes }) => {
  return (
    <div className={classes.root}>
      <Typography variant="h3" gutterBottom>
        Users
      </Typography>
      <CurrentUserContext.Consumer>{currentUser => (currentUser && currentUser.admin ? <UsersTable /> : null)}</CurrentUserContext.Consumer>
    </div>
  );
};

Users.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Users);
