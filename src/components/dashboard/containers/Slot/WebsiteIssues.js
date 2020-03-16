import React, { Fragment } from 'react'
import { Typography } from '@material-ui/core'
import { ExternalAnchor } from 'components/common/anchor/anchor'
import { t } from 'selectors'

const getIssue = issue => {
	const data = {
		label: issue,
		args: [],
	}
	switch (issue) {
		case 'SLOT_ISSUE_INTEGRATION_NOT_VERIFIED':
			data.args = [
				{
					type: 'anchor',
					href: '',
					label: 'HERE',
				},
			]
			return data
		case 'SLOT_ISSUE_OWNERSHIP_NOT_VERIFIED':
			data.args = [
				{
					type: 'anchor',
					href: '',
					label: 'HERE',
				},
			]
			return data

		default:
			return data
	}
}

export function WebsiteIssues({ issues }) {
	return (
		<Fragment>
			{issues.map((x = {}) => {
				const { label, args } = getIssue(x)
				return (
					<Typography key={x.label} component='div' color='secondary'>
						{t(label, {
							args: args.map((a, index) =>
								a.type === 'anchor' ? (
									<ExternalAnchor key={index} href={a.href}>
										{t(a.label)}
									</ExternalAnchor>
								) : (
									t(a)
								)
							),
						})}
					</Typography>
				)
			})}
		</Fragment>
	)
}
