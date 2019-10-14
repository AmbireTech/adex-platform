import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ValidItemHoc from 'components/common/stepper/ValidItemHoc'
import MaterialStepper from 'components/common/stepper/MaterialUiStepper'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class IdentitySteps extends Component {
	constructor(props) {
		super(props)

		this.state = {
			pages: this.mapPages(),
		}

		// TODO: Check if it is possible to need state update
	}

	mapPages = () => {
		const {
			GoBtn,
			CancelBtn,
			t,
			onSave,
			stepsId,
			stepsPages = [],
			stepsPreviewPage,
			validateIdBase,
			...rest
		} = this.props

		const cancelButton = () => (
			<CancelBtn {...rest} stepsId={stepsId} onSave={onSave} t={t} />
		)

		const validateId = (validateIdBase || '') + '-' + stepsId

		const pages = stepsPages.map((page, index) => {
			return {
				title: t(page.title),
				cancelBtn: cancelButton,
				component: ValidItemHoc(page.page),
				disableBtnsIfValid: page.disableBtnsIfValid,
				props: { ...this.props, validateId: validateId + '-' + index },
				completeBtn: page.final
					? () => <GoBtn {...rest} stepsId={stepsId} onSave={onSave} t={t} />
					: undefined,
			}
		})

		return pages
	}

	render() {
		return <MaterialStepper pages={this.state.pages} />
	}
}

IdentitySteps.propTypes = {
	actions: PropTypes.object.isRequired,
}

function mapStateToProps() {
	// const persist = state.persist
	// const memory = state.memory
	return {
		// account: persist.account
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
)(Translate(withStyles(styles)(IdentitySteps)))
