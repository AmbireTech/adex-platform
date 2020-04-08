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
			? theme.palette.accentOne.main
			: theme.palette.accentTwo.main
	return {
		root: {
			minWidth: 30,
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
			<Box bgcolor='background.paper' boxShadow={2}>
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
			</Box>
		</div>
	)
}

export default SideSwitch
