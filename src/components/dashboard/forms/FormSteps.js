import React, { Component } from 'react'
import PropTypes from 'prop-types'
// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import actions from 'actions'
import MaterialStepper from 'components/common/stepper/MaterialUiStepper'
import ValidItemHoc from 'components/dashboard/forms/ValidItemHoc'
import Translate from 'components/translate/Translate'

class FormSteps extends Component {
	shouldComponentUpdate(nextProps) {
		return JSON.stringify(this.props) !== JSON.stringify(nextProps)
	}

	render() {
		const pages = []
		const {
			t,
			SaveBtn,
			CancelBtn,
			cancelFunction,
			onSave,
			stepsId,
			stepsPages,
			stepsPreviewPage,
			validateIdBase,
			...rest
		} = this.props
		const cancelButton = () => (
			<CancelBtn {...rest} stepsId={stepsId} onSave={onSave} t={t} />
		)
		const validateId = (validateIdBase || '') + '-' + stepsId

		stepsPages.forEach((page, index) => {
			pages.push({
				title: t(page.title),
				cancelBtn: cancelButton,
				component: !page.pageValidation
					? ValidItemHoc(page.page || page)
					: page.page || page,
				pageValidation: page.pageValidation,
				goToNextPageIfValid: page.goToNextPageIfValid,
				props: { ...this.props, stepsId, validateId: validateId + '-' + index },
			})
		})

		pages.push({
			title: t(stepsPreviewPage.title || 'PREVIEW'),
			completeBtn: () => (
				<SaveBtn {...rest} stepsId={stepsId} onSave={onSave} t={t} />
			),
			cancelBtn: cancelButton,
			component: ValidItemHoc(stepsPreviewPage.page || stepsPreviewPage),
			props: {
				...this.props,
				validateId: validateId + '-' + stepsPages.length,
			},
		})

		return (
			// <div style={{ textAlign: 'left' }}>
			<MaterialStepper pages={pages} />
			// </div>
		)
	}
}

FormSteps.propTypes = {
	title: PropTypes.string,
	itemPages: PropTypes.arrayOf(PropTypes.func),
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	stepsPages: PropTypes.arrayOf(PropTypes.object),
}

export default Translate(FormSteps)
