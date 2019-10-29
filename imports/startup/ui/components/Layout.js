import React from 'react';
import PropTypes from 'prop-types';
import Navbar from './Navbar.js';

const Layout = ({ history, children }) => {
  return (
    <div>
      <Navbar history={history} />
      <div>{children}</div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  history: PropTypes.object.isRequired,
};

export default Layout;
