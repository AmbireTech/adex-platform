import React, { Fragment } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import {
	List,
	ListItem,
	Divider,
	ListItemText,
	ListItemIcon,
	ListItemSecondaryAction,
	IconButton,
	Typography,
	Paper,
} from '@material-ui/core'
import { CheckSharp, WarningSharp, RefreshSharp } from '@material-ui/icons'
import { selectWebsitesArray } from 'selectors'

const useStyles = makeStyles(theme => ({
	list: {
		width: '100%',
		backgroundColor: theme.palette.background.paper,
	},
	inline: {
		display: 'inline',
		wordBreak: 'break-all',
	},
	warning: {
		color: theme.palette.warning.main,
	},
	success: {
		color: theme.palette.success.main,
	},
}))

export default function Websites() {
	const classes = useStyles()
	const websites = useSelector(selectWebsitesArray)

	return (
		<Paper variant='outlined'>
			<List className={classes.list} dense>
				{websites.map((ws, index) => (
					<Fragment key={ws.id}>
						<ListItem alignItems='flex-start'>
							<ListItemIcon>
								{ws.issues.length ? (
									<WarningSharp className={classes.warning} />
								) : (
									<CheckSharp className={classes.success} />
								)}
							</ListItemIcon>
							<ListItemText
								primary={ws.id}
								secondary={
									// TODO:
									<Typography
										component='span'
										variant='caption'
										className={classes.inline}
									>
										{!!ws.issues && ws.issues.join(', ')}
									</Typography>
								}
							/>
							<ListItemSecondaryAction>
								{!!ws.issues.length && (
									<IconButton edge='end'>
										<RefreshSharp />
									</IconButton>
								)}
							</ListItemSecondaryAction>
						</ListItem>
						{index < websites.length - 1 && <Divider />}
					</Fragment>
				))}
			</List>
		</Paper>
	)
}
