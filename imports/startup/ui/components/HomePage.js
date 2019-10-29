import React from 'react';
import AnimContext from '../contexts/AnimContext';

const HomePage = () => {
  return (
    <AnimContext.Consumer>
      {(animClass) => (
        <div className={animClass}>
          <h3>Hello World</h3>
        </div>
      )}
    </AnimContext.Consumer>
  );
};

export default HomePage;
