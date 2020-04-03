import React, { Fragment } from 'react'
import { Prompt } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'
import { Chip } from '@material-ui/core'
import { Info } from '@material-ui/icons'
import { t } from 'selectors'

const useStyles = makeStyles(theme => {
	const spacing = theme.spacing(1)
	return {
		changesLine: {
			display: 'flex',
			flexDirection: 'row',
			flexWrap: 'wrap',
			alignItems: 'center',
			color: theme.palette.secondary.main,
			marginBottom: spacing,
		},
		changeChip: {
			margin: spacing,
			marginLeft: 0,
		},
	}
})

export const DirtyProps = ({ dirtyProps = [], returnPropToInitialState }) => {
	const classes = useStyles()

	return (
		<Fragment>
			<Prompt when={!!dirtyProps.length} message={t('UNSAVED_CHANGES_ALERT')} />
			{!!dirtyProps.length && (
				<div className={classes.changesLine}>
					<Info className={classes.buttonLeft} />
					<span className={classes.buttonLeft}>{t('UNSAVED_CHANGES')}:</span>
					{dirtyProps.map(p => {
						return (
							<Chip
								className={classes.changeChip}
								key={p}
								label={t(p, { isProp: true })}
								onDelete={() => this.returnPropToInitialState(p)}
							/>
						)
					})}
				</div>
			)}
		</Fragment>
	)
}
