import React, { Fragment } from 'react'
import {
	Box,
	Tooltip,
	List,
	ListSubheader,
	ListItemText,
	ListItemIcon,
	ListItem,
	Button,
	Typography,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { ExternalAnchor } from 'components/common/anchor/anchor'
import { Alert } from '@material-ui/lab'
import {
	LooksOneSharp,
	LooksTwoSharp,
	Looks3Sharp,
	Looks4Sharp,
	RefreshSharp,
	InfoSharp,
} from '@material-ui/icons'
import { useSelector } from 'react-redux'
import { timeAgo } from 'helpers/timeHelpers'
import { selectWebsiteByWebsite, t } from 'selectors'
import { execute, updateWebsiteVerification } from 'actions'

const UPDATE_AGAIN_AFTER = 2 * 60 * 60 * 1000 // 2 h

export const getIssue = issue => {
	const data = {
		label: issue,
		args: [],
	}
	switch (issue) {
		case 'SLOT_ISSUE_INTEGRATION_NOT_VERIFIED':
			data.args = [
				{
					type: 'anchor',
					href:
						'https://help.adex.network/hc/en-us/articles/360013352340-How-to-verify-your-publisher-website',
					label: 'HERE',
				},
			]
			return data
		case 'SLOT_ISSUE_OWNERSHIP_NOT_VERIFIED':
			data.args = [
				{
					type: 'anchor',
					href:
						'https://help.adex.network/hc/en-us/articles/360012481519-How-to-add-DNS-TXT-record-for-your-publisher-domain',
					label: 'HERE',
				},
			]
			return data

		default:
			return data
	}
}

const useStyles = makeStyles(theme => ({
	message: {
		display: 'block',
	},
}))

export function RenderIssue({ label, args }) {
	return args.some(a => a.type === 'anchor') ? (
		t(label, {
			args: args.map((a, index) =>
				a.type === 'anchor' ? (
					<ExternalAnchor key={index} href={a.href}>
						{` ${t(a.label)}`}
					</ExternalAnchor>
				) : (
					t(a)
				)
			),
		})
	) : (
		<div
			dangerouslySetInnerHTML={{
				__html: t(label, { args }),
			}}
		/>
	)
}

export const ALL_ISSUES = {
	SLOT_ISSUE_BLACKLISTED: LooksOneSharp,
	SLOT_ISSUE_INTEGRATION_NOT_VERIFIED: LooksTwoSharp,
	SLOT_ISSUE_OWNERSHIP_NOT_VERIFIED: Looks3Sharp,
	SLOT_ISSUE_SOMEONE_ELSE_VERIFIED: Looks4Sharp,
}

export const WebsiteVerifyBtn = ({ id, website, issues, updated }) => {
	const lastUpdated = updated ? Date.now() - new Date(updated).valueOf() : null
	const canUpdate = !updated || lastUpdated > UPDATE_AGAIN_AFTER
	return (
		issues.length && (
			<Box my={1}>
				<Button
					disabled={!canUpdate}
					fullWidth
					variant='contained'
					color='primary'
					startIcon={<RefreshSharp />}
					onClick={() => execute(updateWebsiteVerification({ id, website }))}
				>
					{t('TRY_VERIFY')}
				</Button>
				{!canUpdate && (
					<Typography variant='caption' display='block' align='right'>
						{t('VERIFICATION_UPDATED_AGO', {
							args: [timeAgo(new Date(updated).valueOf())],
						})}
					</Typography>
				)}
			</Box>
		)
	)
}

export function WebsiteIssues({ issues, website, asIcons, tryAgainBtn }) {
	const classes = useStyles()
	const site = useSelector(state => selectWebsiteByWebsite(state, website))
	const defaultIssues = !website ? ['SLOT_ISSUE_NO_WEBSITE'] : []
	const data = issues || site.issues || defaultIssues

	return (
		<Fragment>
			{tryAgainBtn && data.length && (
				<Box my={1}>
					<Button
						fullWidth
						variant='contained'
						color='primary'
						startIcon={<RefreshSharp />}
						onClick={() => execute(updateWebsiteVerification({ id: site.id }))}
					>
						{t('TRY_VERIFY')}
					</Button>
				</Box>
			)}
			{data.map((id, index) => {
				const { label, args } = getIssue(id)
				const Icon = ALL_ISSUES[label]

				return !!asIcons ? (
					<Tooltip
						key={id}
						title={<RenderIssue label={label} args={args} />}
						aria-label='add'
					>
						<Icon />
					</Tooltip>
				) : (
					<Box key={id} my={index !== 0 && index < data.length ? 1 : 0}>
						<Alert severity='warning' variant='outlined' classes={classes}>
							<RenderIssue label={label} args={args} />
						</Alert>
					</Box>
				)
			})}
		</Fragment>
	)
}

export function WebsiteIssuesLegend() {
	return (
		<List dense disablePadding>
			<ListSubheader disableSticky>{t('ISSUES_LEGEND')}</ListSubheader>
			<ListItem>
				<ListItemIcon>
					<InfoSharp />
				</ListItemIcon>
				<ListItemText
					primary={t('VERIFICATION_INFO_TEXT', {
						args: [24, 'HOURS', 2, 'HOURS'],
					})}
				/>
			</ListItem>
			{Object.entries(ALL_ISSUES).map(([issue, Icon], index) => {
				const { label, args } = getIssue(issue)
				return (
					<ListItem key={label}>
						<ListItemIcon>
							<Icon />
						</ListItemIcon>
						<ListItemText primary={<RenderIssue label={label} args={args} />} />
					</ListItem>
				)
			})}
		</List>
	)
}
