import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Box, Tabs, Tab, Divider } from '@material-ui/core'
import { push } from 'connected-react-router'
import { execute } from 'actions'
import { t } from 'selectors'
import { Paper } from '@material-ui/core'

const sideIndex = {
	advertiser: 0,
	publisher: 1,
	'0': 'advertiser',
	'1': 'publisher',
}

const handleChange = (ev, index) => {
	execute(push(`/dashboard/${sideIndex[index + '']}`))
}

const useTabsStyles = makeStyles(theme => {
	return {
		indicator: {
			// NOTE: we use Tab background color as indicator
			// There is an animation for the Tabs indicator that looks out of
			// sync with Tab background change
			background: '0',
		},
	}
})

const useTabStyles = makeStyles(theme => {
	const activeColor = ({ side }) =>
		side === 'advertiser'
			? theme.palette.primary.main
			: theme.palette.primary.main
	return {
		root: {
			minWidth: 30,
			backgroundColor: theme.palette.appBar.main,
			'&$selected': {
				color: theme.palette.common.white,
				backgroundColor: activeColor,
			},
			'&:hover': {
				backgroundColor: theme.palette.action.hover,
			},
		},
		selected: {
			color: theme.palette.common.white,
			backgroundColor: activeColor,
		},
	}
})

const SideSwitch = ({ side, className }) => {
	const tabsClasses = useTabsStyles({ side })
	const tabClasses = useTabStyles({ side })
	return (
		<div className={className}>
			<Box bgcolor='background.paper'>
				<Divider />
				<Tabs
					classes={tabsClasses}
					value={sideIndex[side]}
					onChange={handleChange}
					textColor='primary'
					variant='fullWidth'
					aria-label='side select'
				>
					<Tab classes={tabClasses} label={t('ADVERTISER')} />
					<Tab classes={tabClasses} label={t('PUBLISHER')} />
				</Tabs>
				<Divider />
			</Box>
		</div>
	)
}

export default SideSwitch
