import React from 'react'
import { Typography, Slider, Box } from '@material-ui/core'
import { formatAbbrNum } from 'helpers/formatters'

const getSliderStep = (min, max, steps, precision = 2) => {
	const diff = max - min
	const step = diff / steps
	const fixed = parseFloat(step.toFixed(precision))

	return fixed
}

export const sliderFilterOptions = ({
	initial = [],
	filterTitle = '',
	stepsCount = 20,
	stepsPrecision = 2,
}) => {
	const min = initial[0] || 0
	const max = initial[1] || 100
	const step = getSliderStep(min, max, stepsCount, stepsPrecision)
	return {
		filter: true,
		display: 'true',
		filterType: 'custom',
		customFilterListOptions: {
			render: v =>
				`${filterTitle}: ${formatAbbrNum(v[0], 2)} - ${formatAbbrNum(v[1], 2)}`,
			update: (filterList, filterPos, index) => {
				filterList[index] = []
				return filterList
			},
		},

		filterOptions: {
			names: [],
			logic: (rowNumber, filters) => {
				const formated = Number(rowNumber.toString().replace(/[^0-9.]/g, ''))
				if (filters.length > 0) {
					return formated < filters[0] || formated > filters[1]
				}
				return false
			},
			display: (filterList, onChange, index, column) => {
				return (
					<Box>
						<Typography id={`range-slider-${column.name}`} gutterBottom>
							{filterTitle}
						</Typography>
						<Box pl={2} pr={3} pt={2}>
							<Slider
								min={min}
								max={max}
								marks={[
									{
										value: min,
										label: formatAbbrNum(min, 2),
									},
									{
										value: max,
										label: formatAbbrNum(max, 2),
									},
								]}
								// Max 20 steps (5,000,000 impressions step 1 ...)
								step={step}
								value={
									filterList[index].length > 0 ? filterList[index] : initial
								}
								onChange={(_, newValue) => {
									onChange(newValue, index, column)
								}}
								valueLabelDisplay='auto'
								aria-labelledby={`range-slider-${column.name}`}
								getAriaValueText={v => formatAbbrNum(v, 2)}
								valueLabelFormat={v => formatAbbrNum(v, 2)}
							/>
						</Box>
					</Box>
				)
			},
		},
	}
}
