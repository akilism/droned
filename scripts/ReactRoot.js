import { default as React, Component } from 'react';
import { default as ReactDOM } from 'react-dom';
import Map from './Map';

export default class Root extends Component {

  render() {
    return (
      <div>
      	<h1>Drone Strikes</h1>
        <Map />
      </div>
    );
  }
}
