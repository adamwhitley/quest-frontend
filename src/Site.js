import React, { Component } from 'react';
import Map from './Map.js';

class Site extends Component {
  render() {
    return (
      <div className="Site">
        <div className="siteBar">
            Northeast > Site One
        </div>
        <Map />
      </div>
    );
  }
}

export default Site;
