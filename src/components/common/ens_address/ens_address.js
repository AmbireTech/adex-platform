import React, { Component } from "react";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import CircularProgress from "@material-ui/core/CircularProgress";
import { withStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import Translate from "components/translate/Translate";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "actions";
import { resolveENS } from "services/adex-ens/actions";
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
  	const { actions } = this.props;
  	if (address && address !== prevState.address) {
  		const { updateENSResolution, updateENSResolutionError } = actions;
  		updateENSResolution({
  			ensName: "",
  			address
  		});
  		if (isEthAddress(address)) {
  			this.setState({
  				isSearching: true
  			});
  			try {
  				const result = await resolveENS(address);
  				if (result.error) {
  					this.setState({
  						isSearching: false
  					});
  					updateENSResolutionError(result.error);
  				} else {
  					this.setState({
  						isSearching: false
  					});
  					updateENSResolution({
  						ensName: result.ensName,
  						address: result.address
  					});
  				}
  			} catch (error) {
  				updateENSResolutionError(error);
  			}
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
  	const { classes, label, ens, t, required, onBlur, onFocus } = this.props;
  	const { isSearching, address } = this.state;
  	const { ensName, error } = ens;
  	return (
  		<div className={classes.root}>
        <>
          <TextField
          	className={classnames(classes.input)}
          	label={label}
          	required={required}
          	value={address}
          	onChange={e => this.reverseAddress(e)}
          	onBlur={() => onBlur}
          	onFocus={() => onFocus}
          	helperText={error ? `${t(error)}` : ""}
          	error={error}
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
  		</div>
  	);
  }
}

ENSAddress.propTypes = {
	text: PropTypes.string,
	required: PropTypes.bool,
	label: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	value: PropTypes.string,
	onBlur: PropTypes.func,
	onFocus: PropTypes.func
};

ENSAddress.defaultProps = {
	label: "Enter ERC20 Address"
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
)(Translate(withStyles(styles)(ENSAddress)));
