/* global window, location */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { spring, AnimatedSwitch } from 'react-router-transition';
import { Router, Route } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';

import HomePage from './HomePage.js';
import Login from './Login.js';
import NotFoundPage from './NotFoundPage';
import Users from './admin/Users';

export const history = createBrowserHistory();

export const appRoutes = () => {
  const routes = [];
  routes.push({ path: '/', component: HomePage });
  routes.push({ path: '/login', component: Login });
  routes.push({ path: '/users', component: Users });
  routes.push({ component: NotFoundPage });
  return routes;
};

function glide(val) {
  return spring(val, {
    stiffness: 174,
    damping: 24,
  });
}

const pageTransitions = {
  atEnter: {
    offset: 130,
  },
  atLeave: {
    offset: glide(-130),
  },
  atActive: {
    offset: glide(0),
  },
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
          <AnimatedSwitch
            atEnter={{ opacity: 0 }}
            atLeave={{ opacity: 0 }}
            atActive={{ opacity: 1 }}
            runOnMount={location.pathname === '/'}
            className="switch-wrapper"
          >
            {routeElements}
          </AnimatedSwitch>
        </LoadingLayout>
      </Router>
    );
  } else if (width !== 0) {
    return (
      <Router history={history}>
        <LoadingLayout history={history}>
          <AnimatedSwitch
            {...pageTransitions}
            runOnMount={location.pathname === '/'}
            mapStyles={styles => ({
              transform: `translateX(${styles.offset}%)`,
            })}
            className="switch-wrapper"
          >
            {routeElements}
          </AnimatedSwitch>
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
