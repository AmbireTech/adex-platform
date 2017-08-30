import React, { Component } from 'react';
import theme from './theme.css';
import PublisherLogo from './../../common/icons/AdexPublisher';
import AdvertiserLogo from './../../common/icons/AdexAdvertiser';
import { BrowserRouter as Router, Link } from 'react-router-dom'
import Dialog from 'react-toolbox/lib/dialog';

const SideBox = ({salePoints, linkTo, linkTitle, icon, title}) => (
    <div className={theme.sideBox}>
      <div>
        {icon}
      </div>
      <h2>{title}</h2>
      <ul>
      {salePoints.map(function(point, key){
        return (<li key={key}> {point} </li>)
      })}
      </ul>
      <Link to={linkTo} > {linkTitle} </Link>
    </div>
)

class SideSelect extends Component {

  render() {
    console.log('theme.signinContainer', theme);
    return (
      <div >
        <Dialog
          active={true}
          title='Choose a your side'
        >

        <SideBox 
          title="Advertiser" 
          icon={<AdvertiserLogo />} 
          salePoints={['Have Something to sell', 'Transparency', 'Hoi']}
          linkTo="/dashboard/advertiser"
          linkTitle="Go to advertiser to advertise"
          />

          <SideBox 
          title="Publisher" 
          icon={<PublisherLogo />} 
          salePoints={['Decentralization', 'Transparency', 'Kor']}
          linkTo="/dashboard/publisher"
          linkTitle="Go to publisher to publish"
          />

        </Dialog>
      </div>
    );
  }
}

export default SideSelect;
