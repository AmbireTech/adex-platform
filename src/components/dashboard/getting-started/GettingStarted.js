import React, { Fragment } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Box, StepButton, Link } from '@material-ui/core'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import EmailEddie from 'resources/getting-started/GS-email-ic.png'
import FundEddie from 'resources/getting-started/GS-fund-ic.png'
import CreateEddie from 'resources/getting-started/GS-create-ic.png'
import LaunchEddie from 'resources/getting-started/GS-launch-ic.png'
import PlaceEddie from 'resources/getting-started/GS-place-ic.png'
import BonusEddie from 'resources/getting-started/GS-bonus-ic.png'
import { t, selectHasCreatedAdUnit } from 'selectors'
import { useSelector } from 'react-redux'
import { ColorlibStepIcon, ColorlibConnector } from './Colorlib'

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

export default function GettingStarted(props) {
	const classes = useStyles()
	const { side } = props
	const [activeStep, setActiveStep] = React.useState(0)
	//TODO: see why side selector and side in general is not saved
	const hasCreatedAdUnit = useSelector(selectHasCreatedAdUnit)
	const steps = {
		advertiser: [
			{
				label: 'Confirm your email address',
				content: "Welcome to  the platform. Let's first confirm your email!",
				icon: EmailEddie,
				check: false,
			},
			{
				label: 'Create an ad unit',
				content: "Your account is ready. Let's create your first ad!",
				icon: CreateEddie,
				check: hasCreatedAdUnit,
			},
			{
				label: 'Fund your account',
				content:
					"Now that you have your first ad unit, let's fund your account!",
				icon: FundEddie,
				check: false,
			},
			{
				label: 'Launch your first campaign',
				content:
					"Now that you have money in your account, let's launch your first campaign!",
				icon: LaunchEddie,
				check: false,
			},
			{
				label: 'Receive your bonus',
				content: "Your account is ready. Let's create your first ad!",
				icon: BonusEddie,
				check: false,
			},
		],
	}

	const handleStep = step => () => {
		setActiveStep(step)
	}

	const handleReset = () => {
		setActiveStep(0)
	}

	return (
		<Fragment>
			{steps[side] && (
				<Box className={classes.root} m={1}>
					{/* TODO: add mobile version */}
					{/* https://material-ui.com/components/steppers/#mobile-stepper */}
					<Stepper
						nonLinear
						alternativeLabel
						activeStep={activeStep}
						connector={<ColorlibConnector />}
					>
						{steps[side].map(({ label, icon, check }, index) => (
							<Step key={label}>
								<StepButton onClick={handleStep(index)}>
									<StepLabel
										StepIconComponent={ColorlibStepIcon}
										StepIconProps={{ icon, completed: check }}
									>
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
									<strong>{`STEP ${activeStep + 1}: ${steps[side][activeStep]
										.label || ''}`}</strong>
								</Typography>
								<Typography className={classes.instructions}>
									{steps[side][activeStep].content} {'Not sure how? See '}
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
			)}
		</Fragment>
	)
}
