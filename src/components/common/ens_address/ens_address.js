import React, { Component } from "react";
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import CircularProgress from "@material-ui/core/CircularProgress";
import { withStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import { ethers } from "ethers";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "actions";
import { styles } from "./styles";
import { isEthAddress } from "helpers/validators";

class ENSAddress extends Component {
	constructor(props) {
		super(props);
		this.state = {
			resolved: "",
			error: "",
			isSearching: false,
			address: ""
		};

		this.reverseAddress = this.reverseAddress.bind(this);
	}

  componentDidUpdate = async (prevProps, prevState) => {
  	const { address } = this.state;
  	if (address !== prevState.address) {
  		const provider = ethers.getDefaultProvider();
  		const { updateENSResolution } = this.props.actions;
  		updateENSResolution({
  			ensName: "",
  			address
  		});
  		if (isEthAddress(address)) {
  			this.setState({
  				isSearching: true
  			});

  			console.log(address.indexOf(""));

  			await provider.lookupAddress(address).then(async ensName => {
  				if (ensName !== null) {
  					const resolvedAddress = await provider.resolveName(ensName);
  					if (resolvedAddress === address) {
  						this.setState({
  							isSearching: false
  						});
  						updateENSResolution({ ensName, address });
  					}
  				} else {
  					this.setState({
  						error: "Address has no ens name associated to it.",
  						isSearching: false
  					});
  				}
  			});
  		}
  	}
  };

  reverseAddress = async event => {
  	const { value } = event.target;
  	this.setState({
  		address: value
  	});
  };

  render() {
  	const {
  		classes,
  		placeholder,
  		ens: { ensName }
  	} = this.props;
  	const { isSearching, address } = this.state;
  	return (
  		<Paper className={classes.root}>
        <>
          <InputBase
          	className={classnames(classes.input)}
          	placeholder={placeholder}
          	inputProps={{ "aria-label": "reverse ens names" }}
          	value={address}
          	onChange={e => this.reverseAddress(e)}
          />
          {ensName && <span>{ensName}</span>}
        </>
        <IconButton
        	className={classnames(classes.iconButton)}
        	aria-label="search"
        >
        	{!isSearching && <SearchIcon />}
        	{isSearching && (
        		<CircularProgress
        			variant="indeterminate"
        			className={classnames(classes.progress)}
        		/>
        	)}
        </IconButton>
  		</Paper>
  	);
  }
}

ENSAddress.propTypes = {
	placeholder: PropTypes.string.isRequired,
};

ENSAddress.defaultProps = {
	placeholder: "Enter ERC20 Address"
};

function mapStateToProps(state, props) {
	const {
		memory: { ens }
	} = state;

	return {
		ens
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withStyles(styles)(ENSAddress));
