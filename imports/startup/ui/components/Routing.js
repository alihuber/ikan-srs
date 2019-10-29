/* global window, location */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Router, Route } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';

import HomePage from './HomePage.js';
import Login from './Login.js';
import NotFoundPage from './NotFoundPage';
// import Users from './admin/Users';

export const history = createBrowserHistory();

export const appRoutes = () => {
  const routes = [];
  routes.push({ path: '/', component: HomePage });
  routes.push({ path: '/login', component: Login });
  // routes.push({ path: '/users', component: Users });
  routes.push({ component: NotFoundPage });
  return routes;
};

const Routing = ({ LayoutComponent }) => {
  const [width, setWidth] = useState(window.innerWidth);
  const LoadingLayout = LayoutComponent;
  const routeElements = [];

  window.addEventListener('resize', () => {
    setWidth(document.body.clientWidth);
  });

  appRoutes().forEach((r) => {
    routeElements.push(
      <Route
        path={r.path}
        key={r.component.name.toString()}
        exact
        render={(props) => {
          const Component = r.component;
          return <Component routeProps={props} />;
        }}
      />
    );
  });

  if (width !== 0 && width > 860) {
    return (
      <Router history={history}>
        <LoadingLayout history={history}>
          {/* use fade transition effect */}
          {routeElements}
        </LoadingLayout>
      </Router>
    );
  } else if (width !== 0) {
    return (
      <Router history={history}>
        <LoadingLayout history={history}>
          {/* use slide transition effect */}
          {routeElements}
        </LoadingLayout>
      </Router>
    );
  } else {
    return null;
  }
};

Routing.propTypes = {
  LayoutComponent: PropTypes.func,
};

export default Routing;
