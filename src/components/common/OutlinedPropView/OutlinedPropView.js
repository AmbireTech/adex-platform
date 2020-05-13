import React from 'react'

import { OutlinedInput, InputLabel, FormControl, Box } from '@material-ui/core'

const PropBaseComponent = ({ value, inputRef, ...rest }) => (
	<Box {...rest}>{value}</Box>
)

const OutlinedPropView = ({ label, value }) => (
	<Box py={1}>
		<FormControl variant='outlined' fullWidth>
			<InputLabel shrink disableAnimation>
				{label}
			</InputLabel>

			<OutlinedInput
				fullWidth
				notched
				readOnly
				name={label}
				label={label}
				inputComponent={PropBaseComponent}
				inputProps={{ style: { height: 'auto', wordWrap: 'break-word' } }}
				value={value}
			/>
		</FormControl>
	</Box>
)

export default OutlinedPropView
