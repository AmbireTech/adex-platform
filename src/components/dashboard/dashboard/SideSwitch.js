import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { push } from 'connected-react-router'
import { execute } from 'actions'
import { t } from 'selectors'

const sideIndex = {
	advertiser: 0,
	publisher: 1,
	'0': 'advertiser',
	'1': 'publisher',
}

const handleChange = (ev, index) => {
	execute(push(`/dashboard/${sideIndex[index + '']}`))
}

const useStyles = makeStyles(theme => {
	const activeColor = ({ side }) =>
		side === 'advertiser'
			? theme.palette.accentOne.main
			: theme.palette.accentTwo.main

	return {
		// TODO: keep it everywhere in case of components update
		root: {
			minWidth: 30,
			'&$selected': {
				color: activeColor,
			},
		},
		selected: {
			color: activeColor,
			'&$selected': {
				color: activeColor,
			},
		},
		indicator: {
			backgroundColor: activeColor,
		},
	}
})

const SideSwitch = ({ side, className }) => {
	const classes = useStyles({ side })
	return (
		<div className={className}>
			<Box bgcolor='background.paper' boxShadow={2}>
				<Tabs
					classes={classes}
					value={sideIndex[side]}
					onChange={handleChange}
					indicatorColor='primary'
					textColor='primary'
					variant='fullWidth'
					aria-label='side select'
				>
					<Tab classes={classes} label={t('ADVERTISER')} />
					<Tab classes={classes} label={t('PUBLISHER')} />
				</Tabs>
			</Box>
		</div>
	)
}

export default SideSwitch
