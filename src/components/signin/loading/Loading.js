import React, { Component } from 'react';
import Logo from './components/icons/AdexLogo';
import { BrowserRouter as Router, Link } from 'react-router-dom'

class Signin extends Component {
  render() {
    return (
      <div className="App" style={{backgroundImage: `url(${require('./../../resources/background.png')})`}}>

        <div className="App-header">
          <img src={<Logo />} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <Link to="/dashboard" > Go to dashboard to dashboard </Link>
      </div>
    );
  }
}

export default Signin;
