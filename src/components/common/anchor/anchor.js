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
	style,
	...rest
}) => {
	let url = target && target === '_blank' ? getUrl(href) : href
	return (
		<Link
			underline={underline || 'none'}
			color={color || 'inherit'}
			draggable='false'
			rel='noopener noreferrer'
			{...rest}
			target={target}
			href={url}
			style={{ wordBreak: 'break-all', ...style }} // TODO: add it where needed only
		>
			{children || label}
		</Link>
	)
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
