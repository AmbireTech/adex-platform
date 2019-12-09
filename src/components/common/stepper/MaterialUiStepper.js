import React, { useEffect, useState, useCallback } from 'react'
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
	const canReverse = pages.length > currentPage && currentPage > 0

	const page = pages[currentPage] || {}
	const pageProps = page.props || {}
	const { validateId } = pageProps
	const Comp = page.component || null
	const pageValidation = page.pageValidation || null

	const validations = useSelector(state =>
		selectValidationsById(state, validateId)
	)

	const isValidPage = useCallback(() => {
		return !Object.keys(validations || {}).length
	}, [validations])

	const canAdvance = isValidPage() && !page.completeBtn

	const goToPage = useCallback(
		async nextStep => {
			const canAdvance = nextStep > currentPage
			const canGoBack = nextStep < currentPage

			if (canAdvance || canGoBack) {
				setCurrentPage(nextStep)
			}
		},
		[currentPage]
	)

	const goToPreviousPage = useCallback(() => {
		if (canReverse) {
			goToPage(currentPage - 1)
		}
	})

	const goToNextPage = useCallback(async () => {
		if (pageValidation) {
			pageValidation({
				validateId,
				dirty: true,
				onValid: () => goToPage(currentPage + 1),
			})
		}
	})

	useEffect(() => {
		if (pageValidation) {
			pageValidation({ validateId, dirty: false })
		}
	}, [currentPage, pageValidation, validateId])

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
				<div className={classes.pageContent}>
					{!!Comp && <Comp {...pageProps} />}
				</div>

				<div className={classes.controls}>
					<div className={classes.left}>
						{canReverse && !(page.disableBtnsIfValid && isValidPage()) ? (
							<Button onClick={goToPreviousPage}>{t('BACK')}</Button>
						) : (
							''
						)}
					</div>

					<div className={classes.right}>
						{/* <Button label='Cancel' onClick={this.cancel}/> */}
						{page.cancelBtn && !(page.disableBtnsIfValid && isValidPage()) ? (
							<page.cancelBtn />
						) : null}
						{/* {ValidationBtn && <ValidationBtn {...page.props} />} */}

						{!page.completeBtn ? (
							<Button
								disabled={!isValidPage() && !pageValidation}
								variant='contained'
								color='primary'
								onClick={goToNextPage}
							>
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
