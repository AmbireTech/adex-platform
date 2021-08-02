import React from 'react'
import { Box } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { t } from 'selectors'
import { Alert } from '@material-ui/lab'

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
	return {
		errAlert: {
			paddingTop: 0,
			paddingBottom: 0,
		},
	}
}

const useStyles = makeStyles(styles)

export const DirtyErrors = ({
	validations,
	alertProps = {},
	boxProps = {},
}) => {
	const classes = useStyles()
	const dirtyErrors = getDirtyValidationErrors(validations)
	return (
		!!dirtyErrors.length && (
			<Box p={0.5} {...boxProps}>
				{dirtyErrors.map(err => (
					<Box my={0.5}>
						<Alert
							severity='error'
							key={err.field}
							classes={{ root: classes.errAlert }}
							{...alertProps}
						>
							{`${err.field}: ${err.msg}`}
						</Alert>
					</Box>
				))}
			</Box>
		)
	)
}
