import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import classnames from 'classnames'
import { Box, StepButton } from '@material-ui/core'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Check from '@material-ui/icons/Check'
import SettingsIcon from '@material-ui/icons/Settings'
import GroupAddIcon from '@material-ui/icons/GroupAdd'
import VideoLabelIcon from '@material-ui/icons/VideoLabel'
import StepConnector from '@material-ui/core/StepConnector'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import GettingStartedImg from './GettingStartedImg'
import EmailEddie from 'resources/getting-started/GS-email-ic.png'

const QontoConnector = withStyles({
	alternativeLabel: {
		top: 10,
		left: 'calc(-50% + 16px)',
		right: 'calc(50% + 16px)',
	},
	// active: {
	// 	'& $line': {
	// 		borderColor: '#784af4',
	// 	},
	// },
	completed: {
		'& $line': {
			borderColor: '#784af4',
		},
	},
	line: {
		borderColor: '#eaeaf0',
		borderTopWidth: 3,
		borderRadius: 1,
	},
})(StepConnector)

const useQontoStepIconStyles = makeStyles({
	root: {
		color: '#eaeaf0',
		display: 'flex',
		height: 22,
		alignItems: 'center',
	},
	active: {
		color: '#784af4',
	},
	circle: {
		width: 8,
		height: 8,
		borderRadius: '50%',
		backgroundColor: 'currentColor',
	},
	completed: {
		color: '#784af4',
		zIndex: 1,
		fontSize: 18,
	},
})

function QontoStepIcon(props) {
	const classes = useQontoStepIconStyles()
	const { active, completed } = props

	return (
		<div
			className={clsx(classes.root, {
				[classes.active]: active,
			})}
		>
			{completed ? (
				<Check className={classes.completed} />
			) : (
				<div className={classes.circle} />
			)}
		</div>
	)
}

QontoStepIcon.propTypes = {
	active: PropTypes.bool,
	completed: PropTypes.bool,
}

const ColorlibConnector = withStyles({
	alternativeLabel: {
		top: 50,
	},
	active: {
		'& $line': {
			backgroundImage:
				'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
		},
	},
	completed: {
		'& $line': {
			backgroundImage:
				'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
		},
	},
	line: {
		height: 3,
		border: 0,
		backgroundColor: '#eaeaf0',
		borderRadius: 1,
	},
})(StepConnector)

const useColorlibStepIconStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.common.white,
		zIndex: 1,
		width: 100,
		height: 100,
		display: 'flex',
		borderRadius: '50%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	active: {
		// backgroundImage:
		// 	'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
		boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
	},
	completed: {
		// backgroundImage:
		// 	'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
	},
}))

const ImgIcon = ({ src, className }) => {
	return (
		<img
			src={src}
			height={80}
			width='auto'
			alt='logo'
			style={{ marginRight: 5 }}
			className={className}
		/>
	)
}

function ColorlibStepIcon(props) {
	const classes = useColorlibStepIconStyles()
	const { active, completed } = props
	const icons = {
		1: <ImgIcon src={EmailEddie} />,
		2: <GroupAddIcon />,
		3: <VideoLabelIcon />,
		4: <GroupAddIcon />,
		5: <VideoLabelIcon />,
	}

	return (
		<div
			className={clsx(classes.root, {
				[classes.active]: active,
				[classes.completed]: completed,
			})}
		>
			{icons[String(props.icon)]}
			{/* <GettingStartedImg src={EmailEddie}></GettingStartedImg> */}
		</div>
	)
}

ColorlibStepIcon.propTypes = {
	active: PropTypes.bool,
	completed: PropTypes.bool,
	icon: PropTypes.node,
}

const useStyles = makeStyles(theme => ({
	root: {
		width: '100%',
		backgroundColor: theme.palette.background.paper,
	},
	button: {
		marginRight: theme.spacing(1),
	},
	instructions: {
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(1),
	},
}))

function getSteps() {
	return [
		'Confirm your email address',
		'Create an ad unit',
		'Fund your account',
		'Launch your first campaign',
		'Receive your bonus',
	]
}

function getStepContent(step) {
	switch (step) {
		case 0:
			return "Your account is ready. Let's create your first ad! Not sure how? Read our tutorial >"
		case 1:
			return "Your account is ready. Let's create your first ad! Not sure how? Read our tutorial >"
		case 2:
			return "Your account is ready. Let's create your first ad! Not sure how? Read our tutorial >"
		case 3:
			return "Your account is ready. Let's create your first ad! Not sure how? Read our tutorial >"
		case 4:
			return "Your account is ready. Let's create your first ad! Not sure how? Read our tutorial >"
		default:
			return 'Unknown step'
	}
}

export default function CustomizedSteppers() {
	const classes = useStyles()
	const [activeStep, setActiveStep] = React.useState(0)
	const [completed, setCompleted] = React.useState({})
	const steps = getSteps()

	const handleBack = () => {
		setActiveStep(prevActiveStep => prevActiveStep - 1)
	}

	const handleStep = step => () => {
		setActiveStep(step)
	}

	// const handleComplete = () => {
	// 	const newCompleted = completed
	// 	newCompleted[activeStep] = true
	// 	setCompleted(newCompleted)
	// 	handleNext()
	// }

	const handleReset = () => {
		setActiveStep(0)
	}

	return (
		<div className={classes.root}>
			<Stepper
				nonLinear
				alternativeLabel
				activeStep={activeStep}
				connector={<ColorlibConnector />}
			>
				{steps.map((label, index) => (
					<Step key={label}>
						<StepButton
							onClick={handleStep(index)}
							completed={completed[index]}
						>
							<StepLabel StepIconComponent={ColorlibStepIcon}>
								{label}
							</StepLabel>
						</StepButton>
					</Step>
				))}
			</Stepper>
			<Box p={2} pl={[1, 2, 5]}>
				{activeStep === steps.length ? (
					<div>
						<Typography className={classes.instructions}>
							All steps completed - you&apos;re finished
						</Typography>
						<Button onClick={handleReset} className={classes.button}>
							Hide
						</Button>
					</div>
				) : (
					<div>
						<Typography className={classes.instructions}>
							{getStepContent(activeStep)}
						</Typography>
					</div>
				)}
			</Box>
		</div>
	)
}
