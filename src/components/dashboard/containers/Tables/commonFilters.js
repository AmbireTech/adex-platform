import React from 'react'
import { Typography, Slider, Box } from '@material-ui/core'

export const sliderFilterOptions = (initial, filterTitle) => {
	return {
		filter: true,
		display: 'true',
		filterType: 'custom',
		filterList: initial,
		customFilterListOptions: {
			render: v => {
				console.log(v)
				if (v === initial) return null
				else return `${filterTitle}: ${v[0]} - ${v[1]}`
			},
		},
		filterOptions: {
			names: [],
			logic(deposit, filters) {
				// if (filters[0] && filters[1]) {
				// 	return age < filters[0] || age > filters[1]
				// } else if (filters[0]) {
				// 	return age < filters[0]
				// } else if (filters[1]) {
				// 	return age > filters[1]
				// }
				// return false
			},
			display: (filterList, onChange, index, column) => {
				return (
					<Box>
						<Typography id={`range-slider-${column.name}`} gutterBottom>
							{filterTitle}
						</Typography>
						<Box m={3}>
							<Slider
								min={0}
								max={2000}
								value={filterList[index]}
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
