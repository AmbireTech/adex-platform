import React, { forwardRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import MaterialStepper from 'components/common/stepper/MaterialUiStepper'
import { t } from 'selectors'

function FormSteps({ cancelFunction, stepsId, steps, closeDialog, ...rest }) {
	const [stepperSteps, setSteps] = useState([])

	useEffect(() => {
		const updatedSteps = steps.map((s, index) => ({
			...s,
			stepsId,
			title: t(s.title),
			props: { ...rest, stepsId, validateId: stepsId + '-' + index },
		}))

		setSteps(updatedSteps)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stepsId])

	return <MaterialStepper steps={stepperSteps} closeDialog={closeDialog} />
}

FormSteps.propTypes = {
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	steps: PropTypes.arrayOf(PropTypes.object),
}

export default forwardRef((props, ref) => (
	<FormSteps {...props} forwardedRef={ref} />
))
