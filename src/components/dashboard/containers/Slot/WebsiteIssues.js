import React, { Fragment } from 'react'
import {
	Box,
	Tooltip,
	List,
	ListItemText,
	ListItemIcon,
	ListItem,
	IconButton,
	Button,
	Chip,
	Typography,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { ExternalAnchor } from 'components/common/anchor/anchor'
import { Alert } from '@material-ui/lab'
import {
	LooksOneSharp,
	LooksTwoSharp,
	Looks3Sharp,
	RefreshSharp,
	InfoSharp,
	FileCopySharp,
} from '@material-ui/icons'
import { useSelector } from 'react-redux'
import { timeAgo } from 'helpers/analyticsTimeHelpers'
import { selectWebsiteByWebsite, t, selectAccountIdentityAddr } from 'selectors'
import { execute, updateWebsiteVerification, addToast } from 'actions'
import copy from 'copy-to-clipboard'

const UPDATE_AGAIN_AFTER = 2 * 60 * 60 * 1000 // 2 h

export const getIssue = issue => {
	const data = {
		label: issue,
		args: [],
	}
	switch (issue) {
		case 'SLOT_ISSUE_BLACKLISTED':
			data.args = [
				{
					type: 'break',
				},
				{
					type: 'anchor',
					href: 'https://www.adex.network/tos/',
					label: 'HERE',
				},
			]
			return data
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
	issueChip: {
		marginRight: theme.spacing(0.5),
		marginTop: theme.spacing(0.5),
		marginBottom: theme.spacing(0.5),
	},
	copyBtn: {
		marginLeft: theme.spacing(1),
	},
}))

export function RenderIssue({ label, args }) {
	return args.some(a => a.type === 'anchor' || a.type === 'break') ? (
		t(label, {
			args: args.map((a, index) => {
				switch (a.type) {
					case 'anchor':
						return (
							<ExternalAnchor key={index} href={a.href}>
								{` ${t(a.label)}`}
							</ExternalAnchor>
						)
					case 'break':
						return <br />
					default:
						return t(a)
				}
			}),
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
	SLOT_ISSUE_BLACKLISTED: { icon: LooksOneSharp, shortLabel: t('BLACKLISTED') },
	SLOT_ISSUE_OWNERSHIP_NOT_VERIFIED: {
		icon: LooksTwoSharp,
		shortLabel: t('NOT_VERIFIED'),
	},
	SLOT_ISSUE_SOMEONE_ELSE_VERIFIED: {
		icon: Looks3Sharp,
		shortLabel: t('VERIFIED_BY_SOMEONE_ELSE'),
	},
}

export const WebsiteVerifyBtn = ({ id, website, issues, updated }) => {
	const lastUpdated = updated ? Date.now() - new Date(updated).valueOf() : null
	const canUpdate = !updated || lastUpdated > UPDATE_AGAIN_AFTER
	return (
		!!issues.length && (
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
					<Typography
						component='div'
						variant='caption'
						display='block'
						align='right'
					>
						{t('VERIFICATION_UPDATED_AGO', {
							args: [timeAgo(new Date(updated).valueOf())],
						})}
					</Typography>
				)}
			</Box>
		)
	)
}

export function WebsiteIssues({ issues, website, asKeyWords, tryAgainBtn }) {
	const classes = useStyles()
	const site = useSelector(state => selectWebsiteByWebsite(state, website))
	const defaultIssues = !website ? ['SLOT_ISSUE_NO_WEBSITE'] : []
	const data = issues || site.issues || defaultIssues

	return (
		<Fragment>
			{!!data.length ? (
				<Fragment>
					{site.id && tryAgainBtn && <WebsiteVerifyBtn {...site} />}
					{data.map((id, index) => {
						const { label, args } = getIssue(id)
						return !!asKeyWords ? (
							<Tooltip
								arrow
								interactive
								key={id}
								title={<RenderIssue label={label} args={args} />}
							>
								<Chip
									size='small'
									label={ALL_ISSUES[label].shortLabel}
									className={classes.issueChip}
								/>
							</Tooltip>
						) : (
							<Box key={id} my={index !== 0 && index < data.length ? 1 : 0}>
								<Alert
									severity='warning'
									variant='filled'
									classes={{ message: classes.message }}
								>
									<RenderIssue label={label} args={args} />
								</Alert>
							</Box>
						)
					})}
				</Fragment>
			) : !!asKeyWords ? (
				<Typography component='div' variant='caption' color='secondary'>
					{t('WEBSITE_VERIFIED')}
				</Typography>
			) : (
				<Alert severity='success' variant='filled' classes={classes}>
					{t('WEBSITE_VERIFIED')}
				</Alert>
			)}
		</Fragment>
	)
}

export function WebsiteIssuesLegend() {
	return (
		<List dense disablePadding>
			<ListItem>
				<ListItemIcon>
					<InfoSharp />
				</ListItemIcon>
				<ListItemText primary={t('NEW_WEBSITE_CREATE_FROM_SLOT_INFO')} />
			</ListItem>
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
		</List>
	)
}

export function WebsiteDSNRecord({ website }) {
	const classes = useStyles()
	const identityAddr = useSelector(selectAccountIdentityAddr)
	const dnsRecord = `adex-publisher=${identityAddr}`

	return (
		<Box display='flex' flexDirection='column' height={1} width={1}>
			<Box mb={1}>
				<Typography className={classes.subtitle} component='div' gutterBottom>
					{t('DNS_RECORD_INFO', { args: [website] })}
				</Typography>
			</Box>
			<Box
				display='flex'
				flexDirection='row'
				component='div'
				alignItems='center'
				flexWrap='wrap'
				width={1}
				mb={1}
			>
				<Box p={1} color='grey.contrastText' bgcolor='grey.main'>
					<pre>{dnsRecord}</pre>
				</Box>
				<IconButton
					color='default'
					className={classes.copyBtn}
					onClick={() => {
						copy(dnsRecord)
						execute(
							addToast({
								type: 'info',
								label: t('COPIED_TO_CLIPBOARD'),
								timeout: 5000,
							})
						)
					}}
				>
					<FileCopySharp />
				</IconButton>
			</Box>
			<Box>
				<Typography className={classes.subtitle} component='div' gutterBottom>
					{t('WEBSITE_DNS_RECORD_MORE_INFO', {
						args: [
							<ExternalAnchor
								key={1}
								href='https://help.adex.network/hc/en-us/articles/360012481519-How-to-add-DNS-TXT-record-for-your-publisher-domain'
							>
								{` ${t('THIS_TUTORIAL')}`}
							</ExternalAnchor>,
						],
					})}
				</Typography>
			</Box>
		</Box>
	)
}
