import React, { Fragment, useEffect } from 'react'
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
	Collapse,
	Link,
} from '@material-ui/core'
import {
	KeyboardArrowLeft,
	KeyboardArrowRight,
	Close,
} from '@material-ui/icons'
import EmailEddie from 'resources/getting-started/GS-email-ic.png'
import FundEddie from 'resources/getting-started/GS-fund-ic.png'
import CreateEddie from 'resources/getting-started/GS-create-ic.png'
import LaunchEddie from 'resources/getting-started/GS-launch-ic.png'
import PlaceEddie from 'resources/getting-started/GS-place-ic.png'
import BonusEddie from 'resources/getting-started/GS-bonus-ic.png'
import {
	t,
	selectHasCreatedAdUnit,
	selectHasCreatedCampaign,
	selectHasConfirmedEmail,
	selectHasFundedAccount,
	selectHasAdSlotImpressions,
	selectHas5000Impressions,
	selectHasCreatedAdSlot,
	selectHideGettingStarted,
	selectEmailProvider,
} from 'selectors'
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
import { ExternalAnchor } from 'components/common/anchor/'

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

	const hasCreatedAdUnit = useSelector(selectHasCreatedAdUnit)
	const hasCreatedCampaign = useSelector(selectHasCreatedCampaign)
	const hasCreatedAdSlot = useSelector(selectHasCreatedAdSlot)
	const hasConfirmedEmail = useSelector(selectHasConfirmedEmail)
	const hasFundedAccount = useSelector(selectHasFundedAccount)
	const hasImpressions = useSelector(selectHasAdSlotImpressions)
	const has5000Impressions = useSelector(selectHas5000Impressions)
	const isGettingStartedHidden = useSelector(selectHideGettingStarted)
	const emailProvider = useSelector(selectEmailProvider)

	const steps = {
		advertiser: [
			{
				label: t('TUTORIAL_CONFIRM_EMAIL_LABEL'),
				content: t('TUTORIAL_CONFIRM_EMAIL_CONTENT', {
					args: [emailProvider],
					components: [<ExternalAnchor href={`https://${emailProvider}`} />],
				}),
				icon: EmailEddie,
				check: hasConfirmedEmail,
			},
			{
				label: t('TUTORIAL_ADD_UNIT_LABEL'),
				content: t('TUTORIAL_ADD_UNIT_CONTENT'),
				icon: CreateEddie,
				check: hasCreatedAdUnit,
				tutorial: createAdUnitTutorial,
			},
			{
				label: t('TUTORIAL_FUND_ACCOUNT_LABEL'),
				content: t('TUTORIAL_FUND_ACCOUNT_CONTENT'),
				icon: FundEddie,
				check: hasFundedAccount,
				tutorial: fundAccountTutorial,
			},
			{
				label: t('TUTORIAL_FIRST_CAMPAIGN_LABEL'),
				content: t('TUTORIAL_FIRST_CAMPAIGN_CONTENT'),
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
				content: t('TUTORIAL_CONFIRM_EMAIL_CONTENT'),
				icon: EmailEddie,
				check: hasConfirmedEmail,
			},
			{
				label: t('TUTORIAL_ADD_SLOT_LABEL'),
				content: t('TUTORIAL_ADD_SLOT_CONTENT'),
				icon: CreateEddie,
				check: hasCreatedAdSlot,
				tutorial: createAdSlot,
			},
			{
				label: t('TUTORIAL_PLACE_SLOT_LABEL'),
				content: t('TUTORIAL_ADD_SLOT_CONTENT'),
				icon: PlaceEddie,
				check: hasImpressions,
				tutorial: placeAdSlot,
			},
			{
				label: t('TUTORIAL_REACH_5000_LABEL'),
				content: t('TUTORIAL_REACH_5000_CONTENT'),
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
	}
	const indexOfFirstIncompleteStep = steps[side].findIndex(step => !step.check)
	const [activeStep, setActiveStep] = React.useState(0)

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
		setActiveStep(
			indexOfFirstIncompleteStep !== -1
				? indexOfFirstIncompleteStep
				: steps[side].length - 1
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [indexOfFirstIncompleteStep])
	// TODO: wait for the data to be loaded before displaying the getting started
	return (
		!isGettingStartedHidden && (
			<Collapse in>
				{steps[side] && (
					<Box className={classes.root} m={1} p={2}>
						<Typography variant={'h6'}>
							{t('GETTING_STARTED_HEADING')}
						</Typography>
						<Hidden mdUp>
							<Box p={2} justifyContent={'center'} display='flex'>
								<ColorlibStepIcon
									icon={steps[side][activeStep].icon}
									completed={steps[side][activeStep].check}
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
												args: [
													activeStep + 1,
													steps[side][activeStep].label || '',
												],
											})}{' '}
											{steps[side][activeStep].check ? t('COMPLETED') : ''}
										</strong>
									</Typography>
									<Typography className={classes.instructions}>
										{steps[side][activeStep].content}{' '}
										{steps[side][activeStep].tutorial &&
											t('GETTING_STARTED_NOT_SURE_SEE_TUTORIAL', {
												components: [
													<Link
														href='#'
														onClick={e => {
															e.preventDefault()
															steps[side][activeStep].tutorial()
														}}
														className={classes.instructions}
														color={'primary'}
														underline={'hover'}
													/>,
												],
											})}
									</Typography>
								</Box>
							)}
						</Box>
					</Box>
				)}
			</Collapse>
		)
	)
}
