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
	Button,
	ListSubheader,
	Paper,
	Box,
} from '@material-ui/core'
import { CheckSharp, WarningSharp, RefreshSharp } from '@material-ui/icons'
import {
	WebsiteIssues,
	WebsiteIssuesLegend,
} from 'components/dashboard/containers/Slot/WebsiteIssues'
import { t, selectWebsitesArray } from 'selectors'
import { execute, updateWebsiteVerification } from 'actions'

const useStyles = makeStyles(theme => ({
	list: {
		width: '100%',
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
		<Fragment>
			<Box>
				<Paper variant='outlined'>
					<List className={classes.list} dense disablePadding>
						<ListSubheader disableSticky>
							{t('REGISTERED_WEBSITES')}
						</ListSubheader>
						{websites.map(({ id, issues }, index) => (
							<Fragment key={id}>
								<ListItem>
									<ListItemIcon>
										{issues.length ? (
											<WarningSharp className={classes.warning} />
										) : (
											<CheckSharp className={classes.success} />
										)}
									</ListItemIcon>
									<ListItemText
										primary={id}
										secondary={<WebsiteIssues issues={issues} asIcons />}
									/>
									<ListItemSecondaryAction>
										{!!issues.length && (
											<Button
												variant='contained'
												color='primary'
												startIcon={<RefreshSharp />}
												size='small'
												edge='end'
												onClick={() =>
													execute(updateWebsiteVerification({ id }))
												}
											>
												{t('TRY_VERIFY')}
											</Button>
										)}
									</ListItemSecondaryAction>
								</ListItem>
								{index < websites.length - 1 && <Divider />}
							</Fragment>
						))}
					</List>
				</Paper>
			</Box>
			<Box mt={2}>
				<Paper variant='outlined'>
					<WebsiteIssuesLegend />
				</Paper>
			</Box>
		</Fragment>
	)
}
