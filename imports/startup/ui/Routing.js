import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoadingIndicator from './LoadingIndicator';

const Login = lazy(() => import('./pages/Login'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const Users = lazy(() => import('./components/admin/Users'));
const Settings = lazy(() => import('./components/settings/Settings'));
const Decks = lazy(() => import('./components/decks/Decks'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const Learn = lazy(() => import('./components/Learn'));
const EditDeck = lazy(() => import('./components/decks/EditDeck'));
const renderLoader = () => <LoadingIndicator />;

const Routing = ({ LayoutComponent }) => {
  const LoadingLayout = LayoutComponent;
  return (
    <Router>
      <Suspense fallback={renderLoader()}>
        <div className="transition-container">
          <LoadingLayout>
            <Routes>
              <Route exact path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/decks" element={<Decks />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/learn/:deckId" element={<Learn />} />
              <Route path="/editDeck/:deckId" element={<EditDeck />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </LoadingLayout>
        </div>
      </Suspense>
    </Router>
  );
};

Routing.propTypes = {
  LayoutComponent: PropTypes.func,
};

export default Routing;
