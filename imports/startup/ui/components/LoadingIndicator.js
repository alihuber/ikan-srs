import React from 'react';
import { Loader } from 'semantic-ui-react';

const LoadingIndicator = () => (
  <>
    <div className="indicatorTop" />
    <Loader active inline="centered" size="large">
      Loading
    </Loader>
  </>
);

export default LoadingIndicator;
