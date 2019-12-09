import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import StepperMUI from '@material-ui/core/Stepper'
import MobileStepper from '@material-ui/core/MobileStepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Button from '@material-ui/core/Button'
import { styles } from './styles'
import Paper from '@material-ui/core/Paper'
import { t, selectValidationsById } from 'selectors'

const useStyles = makeStyles(styles)

// const MyStep = ({ page, active, index, children, theme, canAdvance, canFinish, canReverse, setPageIndex, canAdvanceToPage, currentPage, goToPage, ...other }) => {}
const StepperNav = ({ pages, currentPage, classes, ...other }) => {
	if (window.innerWidth <= 768) {
		return (
			<div>
				<StepLabel className={classes.mobileStepLabel}>
					({currentPage + 1}/{pages.length}) {pages[currentPage].title}
				</StepLabel>
				<MobileStepper
					activeStep={currentPage}
					steps={pages.length}
					position={'static'}
					variant='progress'
					className={classes.mobileStepper}
				></MobileStepper>
			</div>
		)
	}
	return (
		<StepperMUI alternativeLabel activeStep={currentPage}>
			{pages.map((page, i) => {
				return (
					<Step key={page.title}>
						<StepLabel>{page.title}</StepLabel>
					</Step>
				)
			})}
		</StepperMUI>
	)
}

const MaterialStepper = props => {
	const {
		pages = [],
		// ...props
	} = props
	const classes = useStyles()

	const [currentPage, setCurrentPage] = useState(0)
	const [goingBack, setGoingBack] = useState(false)

	const page = pages[currentPage]
	const Comp = page.component
	const ValidationBtn = page.validationBtn || null

	const validations = useSelector(state =>
		selectValidationsById(state, page.props.validateId)
	)

	const canAdvanceNextToPage = () => {
		/* TODO: add check for optional steps that can be skipped
		 */
		if (!Object.keys(validations || {}).length) {
			return true
		} else {
			return false
		}
	}

	const goToPage = nextStep => {
		const canAdvance = nextStep > currentPage && canAdvanceNextToPage()
		const canGoBack = nextStep < currentPage

		if (canGoBack) {
			setGoingBack(true)
		}
		if (canAdvance) {
			setGoingBack(false)
		}
		if (canAdvance || canGoBack) {
			setCurrentPage(nextStep)
		}
	}

	const isValidPage = () => {
		return !Object.keys(validations || {}).length
	}

	useEffect(() => {
		if (
			!goingBack &&
			!!ValidationBtn &&
			canAdvanceNextToPage() &&
			page.goToNextPageIfValid
		) {
			goToPage(currentPage + 1)
		}
	})

	return (
		<div className={classes.stepperWrapper}>
			<Paper
				classes={{
					root: classes.stepperNav,
				}}
			>
				<StepperNav
					{...props}
					pages={pages}
					classes={classes}
					currentPage={currentPage}
					goToPage={goToPage}
				/>
			</Paper>
			<br />

			<Paper
				classes={{
					root: classes.pagePaper,
				}}
			>
				<div className={classes.pageContent}>{<Comp {...page.props} />}</div>

				<div className={classes.controls}>
					<div className={classes.left}>
						{props.canReverse && !(page.disableBtnsIfValid && isValidPage()) ? (
							<Button onClick={() => goToPage(currentPage - 1)}>
								{t('BACK')}
							</Button>
						) : (
							''
						)}
					</div>

					<div className={classes.right}>
						{/* <Button label='Cancel' onClick={this.cancel}/> */}
						{page.cancelBtn && !(page.disableBtnsIfValid && isValidPage()) ? (
							<page.cancelBtn />
						) : null}
						{ValidationBtn && <ValidationBtn {...page.props} />}

						{canAdvanceNextToPage() &&
						!page.completeBtn &&
						!page.goToNextPageIfValid ? (
							<Button
								variant='contained'
								color='primary'
								onClick={() => goToPage(currentPage + 1)}
							>
								{t('CONTINUE')}
							</Button>
						) : !page.completeBtn ? (
							<Button label='Continue' disabled>
								{t('CONTINUE')}
							</Button>
						) : null}
						{page.completeBtn && isValidPage() ? <page.completeBtn /> : ''}
					</div>
				</div>
			</Paper>
		</div>
	)
}

MaterialStepper.propTypes = {
	pages: PropTypes.array.isRequired,
}

export default MaterialStepper
