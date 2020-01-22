import React from 'react'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { CircularProgress } from '@material-ui/core'
import { styles } from './styles.js'
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import { t } from 'selectors'

// TODO: fix responsive styles
const propRow = ({
	classes,
	left,
	right,
	className,
	classNameLeft,
	classNameRight,
	style = {},
}) => (
	<Grid
		item
		container
		spacing={2}
		xs={12}
		className={classnames(className)}
		style={style}
	>
		<Grid
			item
			xs={12}
			sm={4}
			lg={3}
			className={classnames(classes.leftCol, classes.uppercase, classNameLeft)}
		>
			{left}
		</Grid>
		<Grid
			item
			xs={12}
			sm={8}
			lg={9}
			className={classnames(
				classes.rightCol,
				classes.breakLong,
				classNameRight
			)}
		>
			{right}
		</Grid>
	</Grid>
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
	<div className={classnames(classes.contentStickyTop)}>{children}</div>
)

const topLoading = ({ classes, msg, subMsg, className }) => (
	<div className={classnames(classes.contentTopLoading)}>
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
	<CircularProgress
		className={classnames(classes.progressCircleCenter)}
		size={50}
	/>
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
	>
		{spinner && (
			<Box p={4}>
				<CircularProgress
					color={`${color}.contrastText`}
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

export const PropRow = withStyles(styles)(propRow)
export const ContentBox = withStyles(styles)(contentBox)
export const ContentBody = withStyles(styles)(contentBody)
export const ContentStickyTop = withStyles(styles)(contentStickyTop)
export const TopLoading = withStyles(styles)(topLoading)
export const FullContentSpinner = withStyles(styles)(fullContentSpinner)
export const FullContentMessage = withStyles(styles)(fullContentMessage)
