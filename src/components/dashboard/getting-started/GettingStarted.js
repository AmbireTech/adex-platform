import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import classnames from 'classnames'
import { Box, StepButton, Link } from '@material-ui/core'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Check from '@material-ui/icons/Check'
import StepConnector from '@material-ui/core/StepConnector'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import EmailEddie from 'resources/getting-started/GS-email-ic.png'
import FundEddie from 'resources/getting-started/GS-fund-ic.png'
import CreateEddie from 'resources/getting-started/GS-create-ic.png'
import LaunchEddie from 'resources/getting-started/GS-launch-ic.png'
import PlaceEddie from 'resources/getting-started/GS-place-ic.png'
import BonusEddie from 'resources/getting-started/GS-bonus-ic.png'
import { PRIMARY, SECONDARY } from 'components/App/themeMUi'

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

const ColorlibConnector = withStyles(theme => ({
	alternativeLabel: {
		top: 50,
	},
	active: {
		// '& $line': {
		// 	backgroundImage:
		// 		'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
		// },
	},
	completed: {
		// '& $line': {
		// 	backgroundImage:
		// 		'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
		// },
	},
	line: {
		height: 3,
		border: 0,
		background: `linear-gradient(to right, transparent 50%, #fff 50%), ${
			theme.palette.grey[300]
		}`,
		backgroundSize: `16px 2px, 100% 2px`,
	},
}))(StepConnector)

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
		border: `3px solid ${theme.palette.grey[300]}`,
		transition: '0.5s',
		'&:hover': {
			boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
			transform: 'translateY(-5px)',
		},
	},
	active: {
		border: `3px solid ${PRIMARY}`,
	},
	completed: {
		border: `3px solid ${SECONDARY}`,
	},
}))

function ColorlibStepIcon(props) {
	const classes = useColorlibStepIconStyles()
	const { active, completed } = props
	const icons = {
		1: EmailEddie,
		2: CreateEddie,
		3: FundEddie,
		4: LaunchEddie,
		5: BonusEddie,
	}

	return (
		<Box
			className={clsx(classes.root, {
				[classes.active]: active,
				[classes.completed]: completed,
			})}
			style={{
				backgroundImage: `url(${icons[String(props.icon)]})`,
				backgroundSize: 'cover',
			}}
		/>
	)
}

ColorlibStepIcon.propTypes = {
	active: PropTypes.bool,
	completed: PropTypes.bool,
	icon: PropTypes.node,
}

const useStyles = makeStyles(theme => ({
	root: {
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
			return "Welcome to  the platform. Let's first confirm your email!"
		case 1:
			return "Your account is ready. Let's create your first ad!"
		case 2:
			return "Now that you have your first ad unit, let's fund your account!"
		case 3:
			return "Now that you have money in your account, let's launch your first campaign!"
		case 4:
			return "Your account is ready. Let's create your first ad!"
		default:
			return 'Unknown step'
	}
}

export default function GettingStarted() {
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
		<Box className={classes.root} m={1}>
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
			<Box p={2} pl={[1, 2, 5]} pt={1}>
				{activeStep === steps.length ? (
					<Box>
						<Typography className={classes.instructions}>
							All steps completed - you&apos;re finished
						</Typography>
						<Button onClick={handleReset} className={classes.button}>
							Hide
						</Button>
					</Box>
				) : (
					<Box>
						<Typography variant={'body1'} className={classes.instructions}>
							<strong>{`STEP ${activeStep + 1}: ${getSteps()[activeStep] ||
								''}`}</strong>
						</Typography>
						<Typography className={classes.instructions}>
							{getStepContent(activeStep)} {'Not sure how? See '}
							<Link
								href='#'
								onClick={ev => ev.preventDefault()}
								className={classes.instructions}
							>
								{'our tutorial.'}
							</Link>
						</Typography>
					</Box>
				)}
			</Box>
		</Box>
	)
}
