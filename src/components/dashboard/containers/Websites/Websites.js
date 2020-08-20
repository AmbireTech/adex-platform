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
	ListSubheader,
	Paper,
	Box,
} from '@material-ui/core'
import { CheckSharp, WarningSharp } from '@material-ui/icons'
import {
	WebsiteIssues,
	WebsiteIssuesLegend,
	WebsiteVerifyBtn,
} from 'components/dashboard/containers/Slot/WebsiteIssues'
import { t, selectWebsitesArray } from 'selectors'

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
						{websites.map(({ id, issues, updated }, index) => {
							return (
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
											secondaryTypographyProps={{
												component: 'div',
											}}
											secondary={<WebsiteIssues issues={issues} asKeyWords />}
										/>
										<ListItemSecondaryAction>
											<WebsiteVerifyBtn
												id={id}
												issues={issues}
												updated={updated}
											/>
										</ListItemSecondaryAction>
									</ListItem>
									{index < websites.length - 1 && <Divider />}
								</Fragment>
							)
						})}
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
