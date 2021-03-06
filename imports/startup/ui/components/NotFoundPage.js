import React, { useContext } from 'react';
import { Container } from 'semantic-ui-react';
import AnimContext from '../contexts/AnimContext';

const NotFoundPage = () => {
  const animClass = useContext(AnimContext);
  return (
    <div className={animClass}>
      <Container text style={{ paddingTop: '4em' }}>
        <h3>404 - Not found</h3>
      </Container>
    </div>
  );
};

export default NotFoundPage;
