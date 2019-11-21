import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Switch from '@material-ui/core/Switch'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'

const EddieSwitch = withStyles(theme => {
	const advColor = theme.palette.eddiePink.main
	const pubColor = theme.palette.eddieGreen.main
	return {
		switchBase: {
			color: advColor,

			'&$checked': {
				color: pubColor,
			},
			'&$checked + $track': {
				backgroundColor: pubColor,
			},
		},
		checked: {},
		track: { backgroundColor: advColor },
	}
})(Switch)

const RRSwitch = withReactRouterLink(props => (
	<ListItem>
		<ListItemText primary={props.label} />
		<ListItemSecondaryAction>
			<EddieSwitch {...props} />
		</ListItemSecondaryAction>
	</ListItem>
))

const SideSwitch = ({ side, t }) => {
	return (
		<div>
			{/* Keep both if there is no valid side and force react to rerender at the same time */}
			{side !== 'advertiser' && (
				<RRSwitch
					color='primary'
					checked={true}
					value='account'
					to={{ pathname: '/dashboard/advertiser' }}
					label={t('PUBLISHER')}
				/>
			)}
			{side !== 'publisher' && (
				<RRSwitch
					color='primary'
					checked={false}
					to={{ pathname: '/dashboard/publisher' }}
					label={t('ADVERTISER')}
				/>
			)}
		</div>
	)
}

export default SideSwitch
