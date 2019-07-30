import React from "react";
import { PropTypes } from "prop-types";
import { ethers } from "ethers";
import {  isEthAddress } from 'helpers/validators'

class ReverseENS extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.lookup
    };
  }

  componentDidMount() {
    const { name } = this.state;
    if (!name) return false;
    if (isEthAddress(name)) {
      this.fetchName(name);
    }
  }

  fetchName = lookup => {
    const provider = ethers.getDefaultProvider();
    try {
      provider.lookupAddress(lookup).then(name => {
        if (!!name) this.setState({ name });
      });
    } catch (err) {
      console.error(err);
    }
  };

  render() {
    const { name } = this.state;
    return <>{name}</>;
  }
}

ReverseENS.propTypes = {
  lookup: PropTypes.string.isRequired
};

export default ReverseENS;
