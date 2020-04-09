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
const StepperNav = ({ steps, currentPage, classes, ...other }) => {
	if (window.innerWidth <= 768) {
		return (
			<div>
				<StepLabel className={classes.mobileStepLabel}>
					({currentPage + 1}/{steps.length || 1}){' '}
					{(steps[currentPage] || {}).title}
				</StepLabel>
				<MobileStepper
					activeStep={currentPage}
					steps={steps.length}
					position='static'
					variant='progress'
					className={classes.mobileStepper}
				></MobileStepper>
			</div>
		)
	}
	return (
		<StepperMUI alternativeLabel activeStep={currentPage}>
			{steps.map((page, i) => {
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
		initialPage = 0,
		steps = [],
		closeDialog,
		// ...rest
	} = props
	const classes = useStyles()

	const [currentPage, setCurrentPage] = useState(+initialPage)
	const canReverse = steps.length > currentPage && currentPage > 0

	const page = steps[currentPage] || {}
	const pageProps = page.props || {}
	const { validateId } = pageProps
	const Comp = page.component || null
	const {
		validationFn,
		onValid,
		stepsId,
		completeFn,
		completeBtnTitle = '',
	} = page

	const validations = useSelector(state =>
		selectValidationsById(state, validateId)
	)

	const dirtyErrors = getDirtyValidationErrors(validations)

	const validationSpinner = useSelector(state =>
		selectSpinnerById(state, validateId)
	)

	const stepsSpinner = useSelector(state => selectSpinnerById(state, stepsId))

	const spinner = validationSpinner || stepsSpinner

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
		if (validationFn) {
			validationFn({
				stepsId,
				validateId,
				dirty: true,
				onValid: onValid || (() => goToPage(currentPage + 1)),
			})
		} else if (isValidPage()) {
			goToPage(currentPage + 1)
		}
	}, [
		currentPage,
		goToPage,
		isValidPage,
		onValid,
		validationFn,
		stepsId,
		validateId,
	])

	const handleComplete = useCallback(async () => {
		await completeFn({
			stepsId,
			validateId,
			onValid: () => typeof closeDialog === 'function' && closeDialog(),
		})
	}, [closeDialog, completeFn, stepsId, validateId])

	useEffect(() => {
		if (validationFn) {
			validationFn({ stepsId, validateId, dirty: false })
		}
	}, [currentPage, validationFn, stepsId, validateId])

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
		<Box
			className={classes.stepperWrapper}
			onKeyPress={onKeyPressed}
			display='flex'
			flexDirection='column'
			alignItems='space-between'
		>
			<Box mb={2}>
				<Paper
					classes={{
						root: classes.stepperNav,
					}}
					elevation={0}
				>
					<StepperNav
						{...props}
						steps={steps}
						classes={classes}
						currentPage={currentPage}
						goToPage={goToPage}
					/>
				</Paper>
			</Box>

			<Paper
				classes={{
					root: classes.pagePaper,
				}}
				elevation={0}
			>
				{!!Comp && <Comp {...pageProps} />}
			</Paper>

			{!!dirtyErrors.length && (
				<Box color='error.main' mt={2}>
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

			<Box mt={2}>
				<div className={classes.left}>
					{canReverse && (
						<Button onClick={goToPreviousPage}>{t('BACK')}</Button>
					)}
				</div>

				<div className={classes.right}>
					{typeof page.cancelFunction === 'function' && (
						<Button
							onClick={() => {
								typeof closeDialog === 'function' && closeDialog()
								page.cancelFunction(stepsId)
							}}
						>
							{t('CANCEL')}
						</Button>
					)}

					<span className={classes.buttonProgressWrapper}>
						{typeof completeFn === 'function' ? (
							<Button
								disabled={spinner}
								variant='contained'
								color='primary'
								onClick={handleComplete}
							>
								{t(completeBtnTitle || 'DO_IT_NOW')}
							</Button>
						) : (
							<Button
								disabled={spinner}
								variant='contained'
								color='primary'
								onClick={goToNextPage}
							>
								{t('CONTINUE')}
							</Button>
						)}
						{spinner && (
							<CircularProgress size={24} className={classes.buttonProgress} />
						)}
					</span>
				</div>
			</Box>
		</Box>
	)
}

MaterialStepper.propTypes = {
	steps: PropTypes.array.isRequired,
}

export default MaterialStepper
