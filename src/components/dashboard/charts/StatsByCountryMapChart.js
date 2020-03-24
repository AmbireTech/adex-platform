import React, { useState } from 'react'

import PropTypes from 'prop-types'
import { Box } from '@material-ui/core'

import { useSelector } from 'react-redux'
import MapChart from 'components/dashboard/charts/map/MapChart'
import ReactTooltip from 'react-tooltip' // TEMP: use material-ui tooltip if possible

function StatsByCountryMapChart({ selector }) {
	const { chartData, hoverColor, pressedColor } = useSelector(selector)

	const [content, setContent] = useState('')

	return (
		<Box mb={2}>
			<MapChart
				setTooltipContent={setContent}
				chartData={chartData}
				hoverColor={hoverColor}
				pressedColor={pressedColor}
			/>
			<ReactTooltip>{content}</ReactTooltip>
		</Box>
	)
}

StatsByCountryMapChart.propTypes = {
	selector: PropTypes.func.isRequired,
}

export default StatsByCountryMapChart
