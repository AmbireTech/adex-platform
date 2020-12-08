import React from 'react'
import { Box, Chip } from '@material-ui/core'
import { Error as ErrorIcon } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import { t } from 'selectors'

const getDirtyValidationErrors = (validations = {}) => {
	const errors = Object.keys(validations).reduce((dirtyErrs, key) => {
		const err = validations[key]
		if (err.dirty) {
			dirtyErrs.push({ msg: err.errMsg, field: t(key, { isProp: true }) })
		}
		return dirtyErrs
	}, [])

	return errors
}

export const styles = theme => {
	const errColor = theme.palette.error.main
	return {
		errChip: {
			color: errColor,
			borderColor: errColor,
			'& svg': {
				color: 'inherit',
			},
			margin: theme.spacing(0.5),
		},
	}
}

const useStyles = makeStyles(styles)

export const DirtyErrors = ({
	validations,
	chipsProps = {},
	boxProps = {},
}) => {
	const classes = useStyles()
	const dirtyErrors = getDirtyValidationErrors(validations)
	return (
		!!dirtyErrors.length && (
			<Box bgcolor='error.main' p={0.5} {...boxProps}>
				{dirtyErrors.map(err => (
					<Chip
						key={err.field}
						classes={{ root: classes.errChip }}
						icon={<ErrorIcon />}
						variant='default'
						size='small'
						label={`${err.field}: ${err.msg}`}
						color='default'
						{...chipsProps}
					/>
				))}
			</Box>
		)
	)
}
