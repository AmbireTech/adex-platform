import React from 'react'
import Anchor from 'components/common/anchor/anchor'
import Switch from '@material-ui/core/Switch'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const RRSwitch = withReactRouterLink(props => (
	<ListItem>
		<ListItemText primary={props.label} />
		<ListItemSecondaryAction>
			<Anchor {...props}>
				<Switch {...props} />
			</Anchor>
		</ListItemSecondaryAction>
	</ListItem>
))

const sideSwitch = ({ side, t, classes }) => {
	return (
		<div>
			{/* Keep both if there is no valid side and force react to rerender at the same time */}
			{side !== 'advertiser' && (
				<RRSwitch
					color='default'
					checked={true}
					value='account'
					to={{ pathname: '/dashboard/advertiser' }}
					label={t('PUBLISHER')}
					classes={{
						bar: classes.bar,
					}}
				/>
			)}
			{side !== 'publisher' && (
				<RRSwitch
					color='default'
					checked={false}
					to={{ pathname: '/dashboard/publisher' }}
					label={t('ADVERTISER')}
					classes={{
						bar: classes.bar,
					}}
				/>
			)}
		</div>
	)
}

export const SideSwitch = withStyles(styles)(sideSwitch)
