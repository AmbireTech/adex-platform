import React, { useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import {
	Stepper as StepperMUI,
	MobileStepper,
	Step,
	StepLabel,
	Button,
	Paper,
	Box,
	CircularProgress,
	Typography,
} from '@material-ui/core'
import { styles } from './styles'
import { DirtyErrors } from 'components/common/dirtyErrors'
import { t, selectValidationsById, selectSpinnerById } from 'selectors'

const useStyles = makeStyles(styles)

// const MyStep = ({ page, active, index, children, theme, canAdvance, canFinish, canReverse, setPageIndex, canAdvanceToPage, currentPage, goToPage, ...other }) => {}
const StepperNav = ({ steps, currentPage, classes, ...other }) => {
	if (window.innerWidth <= 768) {
		return (
			<Box
				flex
				flexDirection='column'
				alignItems='center'
				justifyContent='center'
			>
				<Paper variant='outlined'>
					<Box p={1}>
						<Typography align='center'>
							{(steps[currentPage] || {}).title}
						</Typography>
					</Box>

					<MobileStepper
						activeStep={currentPage}
						steps={steps.length}
						position='static'
						variant='text'
						align='center'
						className={classes.mobileStepper}
					></MobileStepper>
				</Paper>
			</Box>
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
	const { initialPage = 0, steps = [], closeDialog, hideNav } = props
	const classes = useStyles()

	const [currentPage, setCurrentPage] = useState(+initialPage)
	const [isBack, setIsBack] = useState(false)
	const canReverse = steps.length > currentPage && currentPage > 0

	const page = steps[currentPage] || {}
	const pageProps = page.props || {}
	const { validateId, stepsProps } = pageProps
	const Comp = page.component || null
	const {
		validationFn,
		onValid,
		stepsId,
		completeFn,
		completeBtnTitle = '',
		nextBtnTitle = '',
	} = page

	const validations = useSelector(state =>
		selectValidationsById(state, validateId)
	)

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
			setIsBack(true)
		}
	}, [canReverse, currentPage, goToPage])

	const goToNextPage = useCallback(async () => {
		setIsBack(false)
		if (validationFn) {
			validationFn({
				stepsId,
				validateId,
				dirty: true,
				onValid: onValid || (() => goToPage(currentPage + 1)),
				stepsProps,
			})
		} else if (isValidPage()) {
			goToPage(currentPage + 1)
		}
	}, [
		validationFn,
		isValidPage,
		stepsId,
		validateId,
		onValid,
		stepsProps,
		goToPage,
		currentPage,
	])

	const handleComplete = useCallback(async () => {
		await completeFn({
			stepsId,
			validateId,
			onValid: () => typeof closeDialog === 'function' && closeDialog(),
		})
	}, [closeDialog, completeFn, stepsId, validateId])

	useEffect(() => {
		if (!isBack && validationFn) {
			validationFn({ stepsId, validateId, dirty: false, stepsProps })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, validationFn, stepsId, validateId, stepsProps])

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
			{!hideNav && (
				<Box mb={1} p={1}>
					<Paper classes={{ root: classes.stepperNavRoot }} elevation={0}>
						<StepperNav
							{...props}
							steps={steps}
							classes={classes}
							currentPage={currentPage}
							goToPage={goToPage}
						/>
					</Paper>
				</Box>
			)}
			<Paper
				classes={{
					root: classes.pagePaper,
				}}
				elevation={0}
			>
				{!!Comp && <Comp {...pageProps} />}
			</Paper>

			<DirtyErrors validations={validations} />

			<Box mt={1}>
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
								{t(nextBtnTitle || 'CONTINUE')}
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
