import React, { Component } from 'react';

class Login extends Component {

  componentWillMount() {
    this.props.auth.login();
  }

  login() {
    this.props.auth.login();
  }

  render() {
    return (
      <div className="Login">
        <h2>Log In to Tesla</h2>
        <button
        type="button"
        onClick={this.login.bind(this)}>Log In</button>
      </div>
    );
  }
}

export default Login;
