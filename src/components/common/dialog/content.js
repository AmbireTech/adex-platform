import React from 'react'

import { CircularProgress, Typography, Box } from '@material-ui/core'
import OutlinedPropView from 'components/common/OutlinedPropView'
import { styles } from './styles.js'
import clsx from 'clsx'
import { withStyles } from '@material-ui/core/styles'
import { t } from 'selectors'

// TODO: Use it with Grid in previews - we can have more than one in row
export const PropRow = ({ left, right }) => (
	<Box p={1}>
		<OutlinedPropView label={left} value={right} />
	</Box>
)

const contentBox = ({ classes, children, className }) => (
	<Box
		width={1}
		height={1}
		display='flex'
		flexDirection='column'
		className={className}
	>
		{children}
	</Box>
)

const contentBody = ({ classes, children, className }) => (
	<Box flexGrow={1} className={className}>
		{children}
	</Box>
)

const contentStickyTop = ({ classes, children, className }) => (
	<div className={clsx(classes.contentStickyTop)}>{children}</div>
)

const topLoading = ({ classes, msg, subMsg, className }) => (
	<div className={clsx(classes.contentTopLoading)}>
		<CircularProgress className={classes.contentTopLoadingCircular} size={50} />
		<div>
			<Typography component='div'> {msg} </Typography>
			{subMsg && (
				<Typography component='div'>
					<strong>{subMsg}</strong>
				</Typography>
			)}
		</div>
	</div>
)

const fullContentSpinner = ({ classes }) => (
	<CircularProgress className={clsx(classes.progressCircleCenter)} size={50} />
)

const fullContentMessage = ({
	children,
	msgs = [],
	spinner,
	color = 'primary',
}) => (
	<Box
		width={1}
		height={1}
		display='flex'
		flexDirection='column'
		alignItems='center'
		justifyContent='center'
		bgcolor={`${color}.main`}
		color={`${color}.contrastText`}
		borderRadius='borderRadius'
	>
		{spinner && (
			<Box p={4}>
				<CircularProgress
					color='inherit'
					// className={classes.contentTopLoadingCircular}
					size={69}
				/>
			</Box>
		)}
		{children}
		{msgs
			.filter(x => !!x && x.message)
			.map((msg, index) => {
				const message = t(msg.message, { args: msg.args })
				return (
					<Typography key={index} component='div'>
						{msg.strong ? <strong>{message}</strong> : message}
					</Typography>
				)
			})}
	</Box>
)

export const ContentBox = withStyles(styles)(contentBox)
export const ContentBody = withStyles(styles)(contentBody)
export const ContentStickyTop = withStyles(styles)(contentStickyTop)
export const TopLoading = withStyles(styles)(topLoading)
export const FullContentSpinner = withStyles(styles)(fullContentSpinner)
export const FullContentMessage = withStyles(styles)(fullContentMessage)
