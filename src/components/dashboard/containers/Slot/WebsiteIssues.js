import React, { Fragment } from 'react'
import { Box } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { ExternalAnchor } from 'components/common/anchor/anchor'
import { Alert } from '@material-ui/lab'
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

export function WebsiteIssues({ issues, website }) {
	const classes = useStyles()
	const site = useSelector(state => selectWebsiteByWebsite(state, website))
	const defaultIssues = !website ? ['SLOT_ISSUE_NO_WEBSITE'] : []
	const data = issues || site.issues || defaultIssues

	return (
		<Fragment>
			{data.map((x = {}, index) => {
				const { label, args } = getIssue(x)
				return (
					<Box key={label} my={index !== 0 && index < data.length ? 1 : 0}>
						<Alert severity='warning' variant='outlined' classes={classes}>
							{t(label, {
								args: args.map((a, index) =>
									a.type === 'anchor' ? (
										<ExternalAnchor key={index} href={a.href}>
											{` ${t(a.label)}`}
										</ExternalAnchor>
									) : (
										t(a)
									)
								),
							})}
						</Alert>
					</Box>
				)
			})}
		</Fragment>
	)
}
