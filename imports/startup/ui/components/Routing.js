import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import HomePage from './HomePage';
import LoadingIndicator from './LoadingIndicator';

const Login = lazy(() => import('./Login'));
const NotFoundPage = lazy(() => import('./NotFoundPage'));
const Users = lazy(() => import('./admin/Users'));
const Settings = lazy(() => import('./Settings'));
const Decks = lazy(() => import('./Decks'));
const Learn = lazy(() => import('./Learn'));
const EditDeck = lazy(() => import('./EditDeck'));
const renderLoader = () => <LoadingIndicator />;

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
              <Suspense fallback={renderLoader()}>
                <Login />
              </Suspense>
            </Route>
            <Route exact path="/users">
              <Suspense fallback={renderLoader()}>
                <Users />
              </Suspense>
            </Route>
            <Route exact path="/settings">
              <Suspense fallback={renderLoader()}>
                <Settings />
              </Suspense>
            </Route>
            <Route exact path="/decks">
              <Suspense fallback={renderLoader()}>
                <Decks />
              </Suspense>
            </Route>
            <Route exact path="/learn/:deckId">
              <Suspense fallback={renderLoader()}>
                <Learn />
              </Suspense>
            </Route>
            <Route exact path="/editDeck/:deckId">
              <Suspense fallback={renderLoader()}>
                <EditDeck />
              </Suspense>
            </Route>
            <Route exact>
              <Suspense fallback={renderLoader()}>
                <NotFoundPage />
              </Suspense>
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
