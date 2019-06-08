import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';
import Navbar from './Navbar.js';
import Loading from './Loading.js';
import LoadingContext from '../contexts/LoadingContext.js';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  content: {
    padding: theme.spacing.unit * 5,
  },
});

const Layout = ({ history, children, classes }) => {
  const { loading } = useContext(LoadingContext);
  return (
    <div>
      <Navbar history={history} />
      <div className={classes.root}>
        <CssBaseline />
        <div className={classes.content}>
          {children}
          {loading ? <Loading /> : null}
        </div>
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Layout);
