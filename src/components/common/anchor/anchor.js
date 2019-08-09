import React from 'react'
import Link from '@material-ui/core/Link'

const getUrl = (url) => {

	url = (url || '').replace(/^(https?:)?\/\//i, '')
	if (url) {
		url = '//' + url
	}

	return url
}

const Anchor = ({ href, target, children, label, ...rest }) => {
	let url = target && target === '_blank' ? getUrl(href) : href
	return (
		<Link
			underline='none'
			color='inherit'
			draggable='false'
			rel='noopener noreferrer'
			{...rest}
			target={target}
			href={url}
			style={{ wordBreak: 'break-all' }} // TODO: add it where needed only
		>
			{children || label}
		</Link>
	)
}

export default Anchor