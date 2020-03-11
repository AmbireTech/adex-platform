import React, { Fragment, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
	Box,
	StepButton,
	MobileStepper,
	Stepper,
	Step,
	StepLabel,
	Button,
	Typography,
	Hidden,
	Link,
	ExpansionPanel,
	ExpansionPanelDetails,
	ExpansionPanelSummary,
	Tooltip,
} from '@material-ui/core'
import {
	KeyboardArrowLeft,
	KeyboardArrowRight,
	ExpandMore,
	Close,
	Star,
	StarBorder,
} from '@material-ui/icons'
import EmailEddie from 'resources/getting-started/GS-email-ic.png'
import FundEddie from 'resources/getting-started/GS-fund-ic.png'
import CreateEddie from 'resources/getting-started/GS-create-ic.png'
import LaunchEddie from 'resources/getting-started/GS-launch-ic.png'
import PlaceEddie from 'resources/getting-started/GS-place-ic.png'
import BonusEddie from 'resources/getting-started/GS-bonus-ic.png'
import { t, sectStepsData, selectHideGettingStarted } from 'selectors'
import { useSelector } from 'react-redux'
import { ColorlibStepIcon, ColorlibConnector } from './Colorlib'
import { hideGettingStarted, execute } from 'actions'
import {
	createAdUnitTutorial,
	fundAccountTutorial,
	launchFirstCampaign,
	createAdSlot,
	placeAdSlot,
} from './Tutorials'

const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.background.paper,
		flex: 1,
	},
	button: {
		marginRight: theme.spacing(1),
	},
	instructions: {
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(1),
	},
}))

const getSteps = ({
	hasCreatedAdUnit,
	hasCreatedCampaign,
	hasCreatedAdSlot,
	hasConfirmedEmail,
	hasFundedAccount,
	hasImpressions,
	has5000Impressions,
}) => ({
	advertiser: [
		{
			label: t('TUTORIAL_CONFIRM_EMAIL_LABEL'),
			content: (
				<span
					dangerouslySetInnerHTML={{
						__html: t('TUTORIAL_CONFIRM_EMAIL_CONTENT'),
					}}
				/>
			),
			contentCompleted: t('TUTORIAL_CONFIRM_EMAIL_COMPLETE'),
			icon: EmailEddie,
			check: hasConfirmedEmail,
		},
		{
			label: t('TUTORIAL_ADD_UNIT_LABEL'),
			content: t('TUTORIAL_ADD_UNIT_CONTENT'),
			contentCompleted: t('TUTORIAL_CREATE_UNIT_COMPLETE'),
			icon: CreateEddie,
			check: hasCreatedAdUnit,
			tutorial: createAdUnitTutorial,
		},
		{
			label: t('TUTORIAL_FUND_ACCOUNT_LABEL'),
			content: t('TUTORIAL_FUND_ACCOUNT_CONTENT'),
			contentCompleted: t('TUTORIAL_FUND_ACC_COMPLETE'),
			icon: FundEddie,
			check: hasFundedAccount,
			tutorial: fundAccountTutorial,
		},
		{
			label: t('TUTORIAL_FIRST_CAMPAIGN_LABEL'),
			content: t('TUTORIAL_FIRST_CAMPAIGN_CONTENT'),
			contentCompleted: t('TUTORIAL_LAUNCH_CAMPAIGN_COMPLETE'),
			icon: LaunchEddie,
			check: hasCreatedCampaign,
			tutorial: launchFirstCampaign,
		},
		// {
		// 	label: 'Receive your bonus',
		// 	content: "Your account is ready. Let's create your first ad!",
		// 	icon: BonusEddie,
		// 	check: false,
		// },
	],
	publisher: [
		{
			label: t('TUTORIAL_CONFIRM_EMAIL_LABEL'),
			content: (
				<span
					dangerouslySetInnerHTML={{
						__html: t('TUTORIAL_CONFIRM_EMAIL_CONTENT'),
					}}
				/>
			),
			contentCompleted: t('TUTORIAL_CONFIRM_EMAIL_COMPLETE'),
			icon: EmailEddie,
			check: hasConfirmedEmail,
		},
		{
			label: t('TUTORIAL_ADD_SLOT_LABEL'),
			content: t('TUTORIAL_ADD_SLOT_CONTENT'),
			contentCompleted: t('TUTORIAL_CREATE_AD_SLOT_COMPLETE'),
			icon: CreateEddie,
			check: hasCreatedAdSlot,
			tutorial: createAdSlot,
		},
		{
			label: t('TUTORIAL_PLACE_SLOT_LABEL'),
			content: t('TUTORIAL_ADD_SLOT_CONTENT'),
			contentCompleted: t('TUTORIAL_PLACE_AD_SLOT_COMPLETE'),
			icon: PlaceEddie,
			check: hasImpressions,
			tutorial: placeAdSlot,
		},
		{
			label: t('TUTORIAL_REACH_5000_LABEL'),
			content: t('TUTORIAL_REACH_5000_CONTENT'),
			contentCompleted: t('TUTORIAL_5000_IMPRESSIONS_COMPLETE'),
			icon: LaunchEddie,
			check: has5000Impressions,
		},
		// {
		// 	label: 'Receive your bonus',
		// 	content: "Your account is ready. Let's create your first ad!",
		// 	icon: BonusEddie,
		// 	check: false,
		// },
	],
})

export default function GettingStarted(props) {
	const classes = useStyles()
	const { side } = props

	const stepsData = useSelector(sectStepsData)

	const isGettingStartedHidden = useSelector(selectHideGettingStarted)
	// const emailProvider = useSelector(selectEmailProvider)
	const [expanded, setExpanded] = useState(true)
	const [steps, setSteps] = useState({ advertiser: [], publisher: [] })

	const indexOfFirstIncompleteStep = steps[side].findIndex(step => !step.check)
	const [activeStep, setActiveStep] = React.useState(0)

	const sideSteps = steps[side] || []
	const currentStep = sideSteps[activeStep] || {}

	const handleStep = step => () => {
		setActiveStep(step)
	}

	const handleNext = () => {
		setActiveStep(activeStep + 1)
	}
	const handleBack = () => {
		setActiveStep(activeStep - 1)
	}

	const handleDismiss = () => {
		setActiveStep(0)
		execute(hideGettingStarted())
	}

	useEffect(() => {
		setSteps(getSteps(stepsData))
	}, [stepsData])
	useEffect(() => {
		setActiveStep(
			indexOfFirstIncompleteStep !== -1
				? indexOfFirstIncompleteStep
				: steps[side].length - 1
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [indexOfFirstIncompleteStep])
	// TODO: wait for the data to be loaded before displaying the getting started
	return (
		!isGettingStartedHidden &&
		(steps[side] && (
			<Box mb={2}>
				<ExpansionPanel
					expanded={expanded}
					onChange={() => setExpanded(!expanded)}
					square={true}
				>
					<ExpansionPanelSummary
						expandIcon={<ExpandMore />}
						aria-controls='expand-getting-started'
						id='getting-started-header'
					>
						<Box
							width={1}
							display='flex'
							flexDirection='row'
							alignItems='center'
							justifyContent='space-between'
						>
							<Typography variant={'h6'}>
								{t('GETTING_STARTED_HEADING')}
							</Typography>

							<div>
								{steps[side].map(({ label, icon, check }, index) => {
									const Icon = check ? Star : StarBorder
									const color = check ? 'secondary' : 'inherit'

									return (
										<Tooltip title={label} key={index}>
											<Icon color={color} />
										</Tooltip>
									)
								})}
							</div>
						</Box>
					</ExpansionPanelSummary>

					<ExpansionPanelDetails>
						<Box width={1}>
							<Hidden mdUp>
								<Box p={2} justifyContent={'center'} display='flex'>
									<ColorlibStepIcon
										icon={currentStep.icon}
										completed={currentStep.check}
										size='35vw'
									/>
								</Box>
								<MobileStepper
									className={classes.root}
									steps={steps[side].length}
									position='static'
									variant='progress'
									activeStep={activeStep}
									nextButton={
										<Button
											size='small'
											onClick={handleNext}
											disabled={activeStep === steps[side].length - 1}
										>
											{t('NEXT')}
											<KeyboardArrowRight />
										</Button>
									}
									backButton={
										<Button
											size='small'
											onClick={handleBack}
											disabled={activeStep === 0}
										>
											<KeyboardArrowLeft />
											{t('BACK')}
										</Button>
									}
								/>
							</Hidden>
							<Hidden smDown>
								<Stepper
									nonLinear
									alternativeLabel
									activeStep={activeStep}
									connector={<ColorlibConnector />}
								>
									{sideSteps.map(({ label, icon, check }, index) => (
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
							</Hidden>
							<Box>
								{indexOfFirstIncompleteStep === -1 ? (
									<Box
										display='flex'
										justifyContent={'space-between'}
										flexWrap='wrap'
									>
										<Typography className={classes.instructions}>
											<strong>{t('GETTING_STARTED_FINISHED')}</strong>
										</Typography>
										<Button
											color='primary'
											onClick={handleDismiss}
											className={classes.button}
											startIcon={<Close />}
										>
											{t('DISMISS')}
										</Button>
									</Box>
								) : (
									<Box>
										<Typography
											variant={'body1'}
											className={classes.instructions}
										>
											<strong>
												{t('GETTING_STARTED_STEPS', {
													args: [activeStep + 1, currentStep.label || ''],
												})}{' '}
												{currentStep.check ? t('COMPLETED') : ''}
											</strong>
										</Typography>
										{currentStep.check ? (
											<Typography className={classes.instructions}>
												{currentStep.contentCompleted}
											</Typography>
										) : (
											<Typography className={classes.instructions}>
												{currentStep.content}{' '}
												{currentStep.tutorial &&
													t('GETTING_STARTED_NOT_SURE_SEE_TUTORIAL', {
														args: [
															<Link
																key='see-tutorial-link'
																href='#'
																onClick={e => {
																	e.preventDefault()
																	currentStep.tutorial()
																}}
																className={classes.instructions}
																color={'primary'}
																underline={'hover'}
															>
																{t('OUR_TUTORIAL')}
															</Link>,
														],
													})}
											</Typography>
										)}
									</Box>
								)}
							</Box>
						</Box>
					</ExpansionPanelDetails>
				</ExpansionPanel>
			</Box>
		))
	)
}
