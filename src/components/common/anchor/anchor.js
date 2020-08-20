import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from '@material-ui/core'
import { OpenInNew } from '@material-ui/icons'
import clsx from 'clsx'

export const styles = theme => ({
	externalIcon: {
		marginLeft: theme.spacing(0.5),
		fontSize: 'small',
	},
	link: {
		display: 'inline-flex',
		alignItems: 'center',
	},
})

const useStyles = makeStyles(styles)

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
	className,
	...rest
}) => {
	const classes = useStyles()

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
		<Link {...linkProps} className={clsx(className, classes.link)}>
			{!component && (children || label)}
			{!component && externalIcon && (
				<OpenInNew className={classes.externalIcon} />
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
