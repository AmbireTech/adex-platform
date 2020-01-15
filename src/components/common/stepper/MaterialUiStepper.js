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
import Box from '@material-ui/core/Box'
import Chip from '@material-ui/core/Chip'
import ErrorIcon from '@material-ui/icons/Error'
import CircularProgress from '@material-ui/core/CircularProgress'
import { t, selectValidationsById, selectSpinnerById } from 'selectors'

const getDirtyValidationErrors = (validations = {}) => {
	const errors = Object.keys(validations).reduce((dirtyErrs, key) => {
		const err = validations[key]
		if (err.dirty) {
			dirtyErrs.push({ msg: err.errMsg, field: t(key, { isProp: true }) })
		}
		return dirtyErrs
	}, [])

	return errors
}

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

	const dirtyErrors = getDirtyValidationErrors(validations)

	const spinner = useSelector(state => selectSpinnerById(state, validateId))

	const isValidPage = useCallback(() => {
		return !Object.keys(validations || {}).length
	}, [validations])

	// const canAdvance = isValidPage() && !page.completeBtn

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

	const goToPreviousPage = useCallback(async () => {
		if (canReverse) {
			goToPage(currentPage - 1)
		}
	}, [canReverse, currentPage, goToPage])

	const goToNextPage = useCallback(async () => {
		if (pageValidation) {
			pageValidation({
				validateId,
				dirty: true,
				onValid: () => goToPage(currentPage + 1),
			})
		} else if (isValidPage()) {
			goToPage(currentPage + 1)
		}
	}, [currentPage, goToPage, isValidPage, pageValidation, validateId])

	useEffect(() => {
		if (pageValidation) {
			pageValidation({ validateId, dirty: false })
		}
	}, [currentPage, pageValidation, validateId])

	const onKeyPressed = useCallback(
		async ev => {
			if (ev.key === 'Enter') {
				ev.preventDefault()
				goToNextPage()
			}
		},
		[goToNextPage]
	)

	return (
		<div className={classes.stepperWrapper} onKeyPress={onKeyPressed}>
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
					{!!Comp && (
						<Box>
							<Comp {...pageProps} />{' '}
						</Box>
					)}

					{!!dirtyErrors && (
						<Box color='error.main'>
							{dirtyErrors.map(err => (
								<Chip
									key={err.field}
									classes={{ root: classes.errChip }}
									icon={<ErrorIcon />}
									variant='outlined'
									size='small'
									label={`${err.field}: ${err.msg}`}
									color='default'
								/>
							))}
						</Box>
					)}
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

						{typeof page.cancelFunction === 'function' &&
						!(page.disableBtnsIfValid && isValidPage()) ? (
							<Button onClick={page.cancelFunction}>{t('CANCEL')}</Button>
						) : null}
						{/* {ValidationBtn && <ValidationBtn {...page.props} />} */}

						{!page.completeBtn || !!pageValidation ? (
							<span className={classes.buttonProgressWrapper}>
								<Button
									disabled={spinner || (!isValidPage() && !pageValidation)}
									variant='contained'
									color='primary'
									onClick={goToNextPage}
								>
									{t('CONTINUE')}
								</Button>
								{spinner && (
									<CircularProgress
										size={24}
										className={classes.buttonProgress}
									/>
								)}
							</span>
						) : null}
						{page.completeBtn && !pageValidation && isValidPage() ? (
							<page.completeBtn />
						) : (
							''
						)}
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
