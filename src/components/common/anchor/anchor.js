import React from 'react'
import { Link } from '@material-ui/core'
import { OpenInNew } from '@material-ui/icons'

const getUrl = url => {
	url = (url || '').replace(/^(https?:)?\/\//i, '')
	if (url) {
		url = '//' + url
	}

	return url
}

const Anchor = ({
	href,
	target,
	children,
	label,
	underline,
	externalIcon,
	color,
	component,
	...rest
}) => {
	const isExternal = target && target === '_blank'
	const url = isExternal ? getUrl(href) : href

	const linkProps = {
		underline: underline || 'none',
		color: color || 'inherit',
		draggable: 'false',
		...(isExternal && { rel: 'noopener noreferrer' }),
		target,
		href: url,
		style: { wordBreak: 'break-all' }, // TODO: add it where needed only
		...(component ? { component } : {}),
		...rest,
	}
	return (
		<Link {...linkProps}>
			{!component && (children || label)}
			{!component && externalIcon && (
				<OpenInNew style={{ fontSize: 'small' }} />
			)}
		</Link>
	)
}

export const ExternalAnchor = ({ href, children, style, ...rest }) => (
	<Anchor
		style={{ fontWeight: 'bold' }}
		underline='always'
		target='_blank'
		color='primary'
		externalIcon
		href={href}
		{...rest}
	>
		{children}
	</Anchor>
)

export default Anchor
