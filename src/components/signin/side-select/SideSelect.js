import React, { Component } from 'react';
import theme from './theme.css';
import PublisherLogo from './../../common/icons/AdexIconTxt';
import { BrowserRouter as Router, Link } from 'react-router-dom'

class SideSelect extends Component {
  render() {
    console.log('theme.signinContainer', theme);
    return (
      <div >
        <PublisherLogo />
        <Link to="/dashboard/publisher" > Go to publisher to publish </Link>
        <Link to="/dashboard/advertiser" > Go to advertiser to advertise</Link>
      </div>
    );
  }
}

export default SideSelect;
