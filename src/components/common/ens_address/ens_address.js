import React, { Component } from "react"
import PropTypes from "prop-types"
import Paper from "@material-ui/core/Paper"
import InputBase from "@material-ui/core/InputBase"
import IconButton from "@material-ui/core/IconButton"
import SearchIcon from "@material-ui/icons/Search"
import CircularProgress from "@material-ui/core/CircularProgress"
import { withStyles } from "@material-ui/core/styles"
import classnames from "classnames"
import Translate from "components/translate/Translate"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import actions from "actions"
import { resolveENS } from "services/adex-ens/actions"
import { styles } from "./styles"
import { isEthAddress } from "helpers/validators"

class ENSAddress extends Component {
	constructor(props) {
		super(props)
		this.state = {
			resolved: "",
			error: "",
			isSearching: false,
			address: ""
		}

		this.reverseAddress = this.reverseAddress.bind(this)
	}

  componentDidUpdate = async (prevProps, prevState) => {
  	const { address } = this.state
  	const { t, actions } = this.props
  	if (address !== prevState.address) {
  		const { updateENSResolution } = actions
  		updateENSResolution({
  			ensName: "",
  			address
  		})
  		if (isEthAddress(address)) {
  			this.setState({
  				isSearching: true
  			})
  			try {
  				const result = await resolveENS(address, t('ENS_NOT_ASSOCIATED'))
  				if (result.error) {
  					this.setState({
  						error: result.error,
  						isSearching: false
  					})
  				} else {
  					this.setState({
  						isSearching: false
  					})
  					updateENSResolution({
  						ensName: result.ensName,
  						address: result.address
  					})
  				}
  			} catch (error) {
  				this.setState({
  					error: error
  				})
  			}
  		}
  	}
  }

  reverseAddress = async event => {
  	const { value } = event.target
  	this.setState({
  		address: value
  	})
  }

  render() {
  	const {
  		classes,
  		placeholder,
  		ens: { ensName }
  	} = this.props
  	const { isSearching, address } = this.state
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
  	)
  }
}

ENSAddress.propTypes = {
	placeholder: PropTypes.string.isRequired
}

ENSAddress.defaultProps = {
	placeholder: "Enter ERC20 Address"
}

function mapStateToProps(state, props) {
	const {
		memory: { ens }
	} = state

	return {
		ens
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(withStyles(styles)(ENSAddress)))
