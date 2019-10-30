import React from 'react';
import PropTypes from 'prop-types';
import { Container } from 'semantic-ui-react';
import Navbar from './Navbar.js';

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <Container style={{ paddingTop: '7em' }}>{children}</Container>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default Layout;
