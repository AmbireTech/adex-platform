import React, { useEffect, useState } from 'react'
import { ACCENT_TWO } from 'components/App/themeMUi'
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
	CheckCircleOutline,
	CheckCircle,
} from '@material-ui/icons'
import EmailEddie from 'resources/getting-started/GS-email-ic_80x80.png'
import FundEddie from 'resources/getting-started/GS-fund-ic_80x80.png'
import CreateEddie from 'resources/getting-started/GS-create-ic_80x80.png'
import LaunchEddie from 'resources/getting-started/GS-launch-ic_80x80.png'
import PlaceEddie from 'resources/getting-started/GS-place-ic_80x80.png'
// import BonusEddie from 'resources/getting-started/GS-bonus-ic_80x80.png'
import {
	t,
	selectStepsData,
	selectHideGettingStarted,
	selectGettingStartedExpanded,
} from 'selectors'
import { useSelector } from 'react-redux'
import { ColorlibStepIcon, ColorlibConnector } from './Colorlib'
import { hideGettingStarted, setGettingStartedExpanded, execute } from 'actions'
import {
	createAdUnitTutorial,
	fundAccountTutorial,
	launchFirstCampaign,
	// createAdSlot,
	verifyWebsite,
	placeAdSlot,
} from './Tutorials'
// import { useEffectDebugger } from 'hooks/useEffectDebugger'
import ReactGA from 'react-ga'

const useStyles = makeStyles(theme => {
	const stepperBackgroundColor = ({ side }) =>
		side === 'advertiser'
			? theme.palette.background.paper
			: theme.palette.background.paper

	return {
		mobile: {
			backgroundColor: 'transparent',
			flex: 1,
		},
		stepper: {
			backgroundColor: 'transparent',
		},
		button: {
			marginRight: theme.spacing(1),
		},
		instructions: {
			marginTop: theme.spacing(1),
			marginBottom: theme.spacing(1),
		},
		expansionPanel: {
			color: theme.palette.primary.main,
			backgroundColor: stepperBackgroundColor,
			'& .MuiExpansionPanelSummary-expandIcon': {
				color: theme.palette.primary.main,
			},
		},
		checkmark: {
			color: theme.palette.accentTwo.main,
		},
	}
})

const getSteps = ({
	hasCreatedAdUnit,
	hasCreatedCampaign,
	hasCreatedAdSlot,
	hasConfirmedEmail,
	hasFundedAccount,
	hasImpressions,
	// has5000Impressions,
	hasVerifiedSites,
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
		// {
		// 	label: t('TUTORIAL_ADD_SLOT_LABEL'),
		// 	content: t('TUTORIAL_ADD_SLOT_CONTENT'),
		// 	contentCompleted: t('TUTORIAL_CREATE_AD_SLOT_COMPLETE'),
		// 	icon: CreateEddie,
		// 	check: hasCreatedAdSlot,
		// 	tutorial: createAdSlot,
		// },
		{
			label: t('TUTORIAL_VERIFY_WEBSITE_LABEL'),
			content: t('TUTORIAL_VERIFY_WEBSITE_CONTENT'),
			contentCompleted: t('TUTORIAL_VERIFY_WEBSITE_COMPLETE'),
			icon: CreateEddie,
			check: hasVerifiedSites,
			tutorial: verifyWebsite,
		},
		{
			label: t('TUTORIAL_PLACE_SLOT_LABEL'),
			content: t('TUTORIAL_PLACE_AD_SLOT_CONTENT'),
			contentCompleted: t('TUTORIAL_PLACE_AD_SLOT_COMPLETE'),
			icon: PlaceEddie,
			check: hasCreatedAdSlot && hasImpressions,
			tutorial: placeAdSlot,
		},
		{
			label: t('TUTORIAL_REACH_5000_LABEL'),
			content: t('TUTORIAL_REACH_5000_CONTENT'),
			contentCompleted: t('TUTORIAL_5000_IMPRESSIONS_COMPLETE'),
			icon: LaunchEddie,
			check: hasImpressions,
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
	const { side } = props
	const classes = useStyles({ side })
	const stepsData = useSelector(selectStepsData)
	const isGettingStartedHidden = useSelector(selectHideGettingStarted)
	const expanded = useSelector(selectGettingStartedExpanded)
	const [steps, setSteps] = useState({})

	const [activeStep, setActiveStep] = React.useState(0)

	const sideSteps = steps[side] || []
	const currentStep = sideSteps[activeStep] || {}

	const indexOfFirstIncompleteStep = sideSteps.findIndex(step => !step.check)

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
		execute(hideGettingStarted(side))
	}

	useEffect(() => {
		setSteps(getSteps(stepsData))
	}, [stepsData])

	useEffect(() => {
		const advertiserStep = getSteps(stepsData).advertiser.findIndex(
			step => !step.check
		)
		const publisherStep = getSteps(stepsData).publisher.findIndex(
			step => !step.check
		)
		ReactGA.set({
			dimension1:
				advertiserStep === -1 ? 'completed' : `step${advertiserStep + 1}`,
			dimension2:
				publisherStep === -1 ? 'completed' : `step${publisherStep + 1}`,
		})
	}, [stepsData])

	useEffect(() => {
		setActiveStep(
			indexOfFirstIncompleteStep !== -1
				? indexOfFirstIncompleteStep
				: sideSteps.length - 1
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [steps, indexOfFirstIncompleteStep])
	// TODO: wait for the data to be loaded before displaying the getting started
	return (
		!isGettingStartedHidden &&
		!!sideSteps.length && (
			<Box mb={1}>
				<ExpansionPanel
					expanded={expanded}
					onChange={() => execute(setGettingStartedExpanded(!expanded))}
					square={true}
					variant='outlined'
				>
					<ExpansionPanelSummary
						expandIcon={<ExpandMore />}
						classes={{ root: classes.expansionPanel }}
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
								{`${t('GETTING_STARTED_HEADING')} (${
									side === 'publisher' ? t('PUBLISHER') : t('ADVERTISER')
								})`}
							</Typography>

							<Box display='flex' flexDirection='row' alignItems='center'>
								{sideSteps.map(({ label, icon, check }, index) => {
									const Icon = check ? CheckCircle : CheckCircleOutline
									const color = ACCENT_TWO

									return (
										<Tooltip arrow title={label} key={index}>
											<Icon className={classes.checkmark} />
										</Tooltip>
									)
								})}
							</Box>
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
									className={classes.mobile}
									steps={sideSteps.length}
									position='static'
									variant='progress'
									activeStep={activeStep}
									nextButton={
										<Button
											size='small'
											onClick={handleNext}
											disabled={activeStep === sideSteps.length - 1}
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
									classes={{ root: classes.stepper }}
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
		)
	)
}
