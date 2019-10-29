/* global window, location */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Router, Route } from 'react-router-dom';
// import createBrowserHistory from 'history/createBrowserHistory';

import HomePage from './HomePage.js';
import Login from './Login.js';
import NotFoundPage from './NotFoundPage';

export const history = require('history').createBrowserHistory();
// import Users from './admin/Users';

export const appRoutes = () => {
  const routes = [];
  routes.push({ path: '/', component: HomePage });
  routes.push({ path: '/login', component: Login });
  routes.push({ component: NotFoundPage });
  // routes.push({ path: '/users', component: Users });
  return routes;
};

const Routing = ({ LayoutComponent }) => {
  const LoadingLayout = LayoutComponent;
  const routeElements = [];

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

  return (
    <Router history={history}>
      <div className="transition-container">
        <LoadingLayout history={history}>{routeElements}</LoadingLayout>
      </div>
    </Router>
  );
};

Routing.propTypes = {
  LayoutComponent: PropTypes.func,
};

export default Routing;
