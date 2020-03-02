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
	externalIcon,
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
	return (
		<Link {...linkProps}>
			{children || label}{' '}
			{externalIcon && <OpenInNew style={{ fontSize: 'small' }} />}
		</Link>
	)
}

export const ExternalAnchor = ({ href, children, style }) => (
	<Anchor
		style={{ fontWeight: 'bold' }}
		underline='always'
		target='_blank'
		color='primary'
		externalIcon
		href={href}
	>
		{children}
	</Anchor>
)

export default Anchor
