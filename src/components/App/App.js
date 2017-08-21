import React, { Component } from 'react';
import logo from './../../logo.svg';
import './App.css';
import './../../assets/react-toolbox/theme.css';
import theme from './../../assets/react-toolbox/theme.js';
import ThemeProvider from 'react-toolbox/lib/ThemeProvider';
import Button from 'react-toolbox/lib/button/Button';
import Layout from './../Layout/Layout'

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <Layout>
          <div className="App">
            
            <div className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h2>Welcome to React</h2>
            </div>
            <p className="App-intro">
              To get started, edit <code>src/App.js</code> and save to reload.
            </p>
            <Button label="Test Button" raised primary />
          </div>
        </Layout>
      </ThemeProvider>
    );
  }
}

export default App;
