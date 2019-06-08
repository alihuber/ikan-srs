import React from 'react';

const LoadingContext = React.createContext({ loading: false, setLoading: () => {} });

export default LoadingContext;
