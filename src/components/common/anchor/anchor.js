import React from 'react'
import Link from '@material-ui/core/Link'
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
	color,
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
		...rest,
	}
	return <Link {...linkProps}>{children || label}</Link>
}

export const ExternalAnchor = ({ href, children, style }) => (
	<Anchor
		style={{ fontWeight: 'bold' }}
		underline='always'
		target='_blank'
		color='primary'
		href={href}
	>
		{children} <OpenInNew style={{ fontSize: 'small' }} />
	</Anchor>
)

export default Anchor
