import React, { Fragment } from 'react'
import {
	Box,
	Tooltip,
	List,
	ListSubheader,
	ListItemText,
	ListItemIcon,
	ListItem,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { ExternalAnchor } from 'components/common/anchor/anchor'
import { Alert } from '@material-ui/lab'
import {
	LooksOneSharp,
	LooksTwoSharp,
	Looks3Sharp,
	Looks4Sharp,
} from '@material-ui/icons'
import { useSelector } from 'react-redux'
import { selectWebsiteByWebsite, t } from 'selectors'

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
	return (
		<div
			dangerouslySetInnerHTML={{
				__html: t(label, {
					args: args.map((a, index) =>
						a.type === 'anchor' ? (
							<ExternalAnchor key={index} href={a.href}>
								{` ${t(a.label)}`}
							</ExternalAnchor>
						) : (
							<div
								dangerouslySetInnerHTML={{
									__html: t(a),
								}}
							/>
						)
					),
				}),
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

export function WebsiteIssues({ issues, website, asIcons }) {
	const classes = useStyles()
	const site = useSelector(state => selectWebsiteByWebsite(state, website))
	const defaultIssues = !website ? ['SLOT_ISSUE_NO_WEBSITE'] : []
	const data = issues || site.issues || defaultIssues

	return (
		<Fragment>
			{data.map((x = {}, index) => {
				const { label, args } = getIssue(x)
				const Icon = ALL_ISSUES[label]

				return !!asIcons ? (
					<Tooltip
						title={<RenderIssue label={label} args={args} />}
						aria-label='add'
					>
						<Icon />
					</Tooltip>
				) : (
					<Box key={x.id} my={index !== 0 && index < data.length ? 1 : 0}>
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
		<List
			dense
			// disablePadding
		>
			<ListSubheader disableSticky>{t('ISSUES_LEGEND')}</ListSubheader>
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
