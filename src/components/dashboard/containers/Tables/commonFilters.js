import React from 'react'
import { Typography, Slider, Box } from '@material-ui/core'
import {
	formatTokenAmount,
	formatAbbrNum,
	formatNumberWithoutCommas,
} from 'helpers/formatters'

export const sliderFilterOptions = ({
	initial,
	filterTitle,
	stepSetting = 1,
	isToken = false,
	decimals = 18,
}) => {
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
				const formated = isToken
					? formatTokenAmount(rowNumber, decimals)
					: rowNumber
				if (filters.length > 0) {
					return (
						Number(formatNumberWithoutCommas(formated)) < filters[0] ||
						Number(formatNumberWithoutCommas(formated)) > filters[1]
					)
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
								min={initial[0]}
								max={initial[1]}
								marks={[
									{
										value: initial[0],
										label: formatAbbrNum(initial[0], 2),
									},
									{
										value: initial[1],
										label: formatAbbrNum(initial[1], 2),
									},
								]}
								step={stepSetting}
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
