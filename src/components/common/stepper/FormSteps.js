import React, { forwardRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import MaterialStepper from 'components/common/stepper/MaterialUiStepper'
import { t, selectLocationQuery } from 'selectors'

function FormSteps({
	cancelFunction,
	stepsId,
	steps,
	closeDialog,
	hideNav,
	stepsProps,
	...rest
}) {
	const [stepperSteps, setSteps] = useState([])
	const { step = 0 } = useSelector(selectLocationQuery)

	useEffect(() => {
		const updatedSteps = steps.map((s, index) => ({
			...s,
			stepsId,
			title: t(s.title),
			cancelFunction,
			props: {
				...rest,
				stepsId,
				validateId: stepsId + '-' + index,
				stepsProps,
			},
		}))

		setSteps(updatedSteps)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stepsId])

	return (
		<MaterialStepper
			initialPage={step}
			steps={stepperSteps}
			closeDialog={closeDialog}
			hideNav={hideNav}
		/>
	)
}

FormSteps.propTypes = {
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	steps: PropTypes.arrayOf(PropTypes.object),
}

export default forwardRef((props, ref) => (
	<FormSteps {...props} forwardedRef={ref} />
))
