import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import HomePage from './HomePage.js';
import Login from './Login.js';
import NotFoundPage from './NotFoundPage';

export const appRoutes = () => {
  const routes = [];
  routes.push({ path: '/', component: HomePage });
  routes.push({ component: NotFoundPage });
  routes.push({ path: '/login', component: Login });
  // routes.push({ path: '/users', component: Users });
  return routes;
};

const Routing = ({ LayoutComponent }) => {
  const LoadingLayout = LayoutComponent;
  return (
    <Router>
      <div className="transition-container">
        <LoadingLayout>
          <Switch>
            <Route exact path="/">
              <HomePage />
            </Route>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact>
              <NotFoundPage />
            </Route>
          </Switch>
        </LoadingLayout>
      </div>
    </Router>
  );
};

Routing.propTypes = {
  LayoutComponent: PropTypes.func,
};

export default Routing;
