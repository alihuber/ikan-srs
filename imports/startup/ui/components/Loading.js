import React from 'react';
import { ScaleLoader } from 'react-spinners';

export class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  render() {
    const { loading } = this.state;
    return (
      <div className="loading">
        <ScaleLoader color="#030e21" loading={loading} />
      </div>
    );
  }
}
