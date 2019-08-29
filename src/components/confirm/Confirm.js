import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Dialog from '@material-ui/core/Dialog'
import Button from '@material-ui/core/Button'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Translate from 'components/translate/Translate'

export class Confirm extends Component {
	constructor(props) {
		super(props)

		this.cancel = this.cancel.bind(this)
		this.confirm = this.confirm.bind(this)
		this.state = {
			active: false,
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ active: nextProps.visible })
	}

	confirm() {
		if (typeof this.props.confirm === 'function') {
			this.props.confirm()
		}
		this.setState({ active: false })
	}

	cancel() {
		if (typeof this.props.cancel === 'function') {
			this.props.cancel()
		}

		this.setState({ active: false })
	}

	render() {
		const {
			title,
			text,
			children,
			cancelLabel,
			confirmLabel,
			t,
			noActionBtns,
		} = this.props
		return (
			<Dialog open={this.state.active}>
				<DialogTitle id='alert-dialog-title'>{title}</DialogTitle>
				<DialogContent>
					<DialogContentText id='alert-dialog-description'>
						{text}
					</DialogContentText>
					{children}
				</DialogContent>
				{!noActionBtns && (
					<DialogActions>
						<Button onClick={this.cancel} color='primary'>
							{cancelLabel || t('CANCEL')}
						</Button>
						<Button onClick={this.confirm} color='primary' autoFocus>
							{confirmLabel || t('OK')}
						</Button>
					</DialogActions>
				)}
			</Dialog>
		)
	}
}

Confirm.propTypes = {
	actions: PropTypes.object.isRequired,
	cancelLabel: PropTypes.string,
	confirmLabel: PropTypes.string,
	title: PropTypes.string.isRequired,
	text: PropTypes.string,
	confirm: PropTypes.func,
	cancel: PropTypes.func,
	visible: PropTypes.bool,
	calledOn: PropTypes.number,
	noActionBtns: PropTypes.bool,
}

function mapStateToProps(state) {
	state = state.memory
	return {
		cancelLabel: state.confirm.data.cancelLabel,
		confirmLabel: state.confirm.data.confirmLabel,
		title: state.confirm.data.title || '',
		text: state.confirm.data.text || '',
		confirm: state.confirm.onConfirm,
		cancel: state.confirm.onCancel,
		visible: state.confirm.active || false,
		calledOn: state.confirm.calledOn,
		noActionBtns: state.confirm.noActionBtns,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(Confirm))
