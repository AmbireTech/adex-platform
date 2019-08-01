import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Translate from 'components/translate/Translate'
// import classnames from 'classnames'
import CircularProgress from '@material-ui/core/CircularProgress'
import Fab from '@material-ui/core/Fab'
import CheckIcon from '@material-ui/icons/Check'
import SaveIcon from '@material-ui/icons/Save'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

// NOTE: Separate component to track the validations and spinner to avoid rerender of item top level components
class SaveBtn extends Component {

	render() {
		let { spinner, classes, success, dirtyProps, save, validations, validationId } = this.props
		return (

			<div className={classes.position}>
				<div className={classes.wrapper}>
					<Fab
						variant='fab'
						color='primary'
						// className={buttonClassname}
						onClick={() => save()}
						disabled={spinner || !dirtyProps.length || !!Object.keys(validations[validationId] || {}).length}
					// {...other}
					>
						{/*TODO: Success */}
						{success ? <CheckIcon /> : <SaveIcon />}
					</Fab>
					{!!spinner && <CircularProgress size={68} className={classes.fabProgress} />}
				</div>
			</div>
		)
	}
}

SaveBtn.propTypes = {
	spinnerId: PropTypes.string,
	validationId: PropTypes.string,
	itemId: PropTypes.string,
	validations: PropTypes.object
}

function mapStateToProps(state, props) {
	// const persist = state.persist
	const memory = state.memory
	return {
		spinner: memory.spinners[props.spinnerId],
		validations: memory.validations
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
)(Translate(withStyles(styles)(SaveBtn)))
