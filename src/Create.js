import React, { Component } from 'react';
import Logo from './logo.svg';

class Create extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentWillMount() {
    setTimeout(this.interval, 5000);
  }

  interval = () => {
      this.interval = setInterval(this.checkData, 1000);
  };

    checkData = () => {
        console.log('loading...');
        fetch('http://ec2-3-93-75-138.compute-1.amazonaws.com/api/v1/devices?siteId=1&state=1')
            .then(rsp => {
                if(rsp.status !== 200) {
                    console.log('loading...');
                    return false;
                }
                else {
                    return rsp.json();
                }
            })
            .then(data => {
                if(data.length < 1) {
                    return false;
                }
                else {
                    data.map(item => item.connectionState === 1 && item.operationalState === 1 ? this.props.history.replace('/site') : null)
                    clearInterval(this.interval);
                }
            });
    };

  render() {
    return (
      <div className="Setup">
        <div className="content">
            <img alt="Quest Automated Systems" src={Logo} />
            <h1>Welcome to Quest</h1>
            <p>Please wait while we detect connected devices...</p>
            <div className="spinnerHolder">
                <div className="spinner" />
            </div>
        </div>
      </div>
    );
  }
}

export default Create;
