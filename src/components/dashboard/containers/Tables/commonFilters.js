import React from 'react'
import { Typography, Slider, Box } from '@material-ui/core'
import { formatTokenAmount, formatAbbrNum } from 'helpers/formatters'

export const sliderFilterOptions = ({
	initial,
	filterTitle,
	isToken = false,
	decimals = 18,
}) => {
	console.log('INITIAL', initial)
	return {
		filter: true,
		display: 'true',
		filterType: 'custom',
		customFilterListOptions: {
			render: v =>
				`${filterTitle}: ${formatAbbrNum(v[0], 2)} - ${formatAbbrNum(v[1], 2)}`,
		},

		filterOptions: {
			names: [],
			logic: (rowNumber, filters) => {
				const formatedDeposit = isToken
					? formatTokenAmount(rowNumber, decimals)
					: rowNumber
				if (filters.length > 0) {
					return formatedDeposit < filters[0] || formatedDeposit > filters[1]
				}
				return false
			},
			display: (filterList, onChange, index, column) => {
				return (
					<Box>
						<Typography id={`range-slider-${column.name}`} gutterBottom>
							{filterTitle}
						</Typography>
						<Box pl={2} pr={2} pt={2}>
							<Slider
								min={initial[0]}
								max={initial[1]}
								value={
									filterList[index].length > 0 ? filterList[index] : initial
								}
								onChange={(_, newValue) => {
									onChange(newValue, index, column)
								}}
								valueLabelDisplay='auto'
								aria-labelledby={`range-slider-${column.name}`}
								getAriaValueText={formatAbbrNum}
								valueLabelFormat={formatAbbrNum}
							/>
						</Box>
					</Box>
				)
			},
		},
	}
}
