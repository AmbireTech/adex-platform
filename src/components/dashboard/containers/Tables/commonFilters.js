import React from 'react'
import { Typography, Slider, Box } from '@material-ui/core'
import { formatTokenAmount } from 'helpers/formatters'

export const sliderFilterOptions = ({
	initial,
	filterTitle,
	isToken = false,
	decimals = 18,
}) => {
	return {
		filter: true,
		display: 'true',
		filterType: 'custom',
		customFilterListOptions: {
			render: v => `${filterTitle}: ${v[0]} - ${v[1]}`,
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
						<Box m={3}>
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
							/>
						</Box>
					</Box>
				)
			},
		},
	}
}
