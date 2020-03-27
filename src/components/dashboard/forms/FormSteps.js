import React, { forwardRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import MaterialStepper from 'components/common/stepper/MaterialUiStepper'
import ValidItemHoc from 'components/dashboard/forms/ValidItemHoc'
import { t } from 'selectors'

function FormSteps(props) {
	const {
		SaveBtn,
		cancelFunction,
		onSave,
		stepsId,
		stepsPages,
		stepsPreviewPage,
		validateIdBase,
		closeDialog,
		...rest
	} = props

	const [pages, setPages] = useState([])

	useEffect(() => {
		const validateId = (validateIdBase || '') + '-' + stepsId

		const updatedPages = []

		stepsPages.forEach((page, index) => {
			updatedPages.push({
				title: t(page.title),
				cancelFunction,
				component: !page.pageValidation
					? ValidItemHoc(page.page || page)
					: page.page || page,
				pageValidation: page.pageValidation,
				goToNextPageIfValid: page.goToNextPageIfValid,
				stepsId,
				props: { ...props, stepsId, validateId: validateId + '-' + index },
			})
		})

		updatedPages.push({
			title: t(stepsPreviewPage.title || 'PREVIEW'),
			completeBtn: () => (
				<SaveBtn {...rest} stepsId={stepsId} onSave={onSave} t={t} />
			),
			cancelFunction,
			component: ValidItemHoc(stepsPreviewPage.page || stepsPreviewPage),
			stepsId,
			props: {
				...props,
				validateId: validateId + '-' + stepsPages.length,
			},
		})

		setPages(updatedPages)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [validateIdBase, stepsId])

	return <MaterialStepper pages={pages} closeDialog={closeDialog} />
}

FormSteps.propTypes = {
	title: PropTypes.string,
	itemPages: PropTypes.arrayOf(PropTypes.func),
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	stepsPages: PropTypes.arrayOf(PropTypes.object),
}

export default forwardRef((props, ref) => (
	<FormSteps {...props} forwardedRef={ref} />
))
