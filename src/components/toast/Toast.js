import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Snackbar, IconButton } from '@material-ui/core'
import { Close } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'
import { isWindowReloading } from 'helpers/miscHelpers'

const typeToSeverity = {
	accept: 'success',
	success: 'success',
	warning: 'warning',
	info: 'info',
	cancel: 'error',
	error: 'error',
}

export class Toast extends Component {
	constructor(props) {
		super(props)

		this.state = {
			active: false,
			toast: {},
		}
	}

	componentWillReceiveProps(nextProps) {
		let toast = this.state.toast
		let nextToast = nextProps.toasts[0]

		if (!nextToast) {
			this.setState({ active: false, toast: {} })
			return
		}

		if (!isWindowReloading()) {
			let isNewToast = !!nextToast && toast.id !== nextToast.id

			if (isNewToast) {
				this.setState({ active: true, toast: nextToast })
			}
		}
	}

	close = id => {
		this.setState({ active: false })
		setTimeout(() => this.props.actions.removeToast(id), 100)
	}

	render() {
		const { toast } = this.state

		if (!toast) return null

		const anchorOrigin = toast.anchorOrigin || {
			vertical: 'bottom',
			horizontal: 'center',
		}

		if (toast.top) {
			anchorOrigin.horizontal = 'center'
			anchorOrigin.vertical = 'top'
		}

		return (
			<Snackbar
				open={this.state.active}
				autoHideDuration={toast.timeout || 0}
				onClose={() => !toast.unclosable && this.close(toast.id)}
				anchorOrigin={anchorOrigin}
			>
				<Alert
					severity={typeToSeverity[toast.type]}
					variant='filled'
					action={
						<Fragment>
							{toast.action && toast.action}
							{!toast.unclosable && (
								<IconButton
									key={`close-${toast.id}`}
									aria-label='Close'
									color='inherit'
									size='small'
									onClick={() => !toast.unclosable && this.close(toast.id)}
								>
									<Close />
								</IconButton>
							)}
						</Fragment>
					}
				>
					{(toast.label || '').toString()}
				</Alert>
			</Snackbar>
		)
	}
}

Toast.propTypes = {
	actions: PropTypes.object.isRequired,
	toasts: PropTypes.array.isRequired,
}

function mapStateToProps(state) {
	// let persist = state.persist
	let memory = state.memory
	return {
		toasts: memory.toasts || [],
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
)(Toast)
