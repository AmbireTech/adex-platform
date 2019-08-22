import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Stepper } from 'react-step/lib/stepper'
import { withStepper } from 'react-step/lib/with-stepper'
import StepperMUI from '@material-ui/core/Stepper'
import MobileStepper from '@material-ui/core/MobileStepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Translate from 'components/translate/Translate'
import { styles } from './styles'
import Paper from '@material-ui/core/Paper'

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

class MaterialStepper extends React.Component {
	// onComplete() {
	//     // console.log('currPage', this.currPage)
	//     let props = this.props
	//     let page = props.pages[props.currentPage]

	//     // console.log('props.pages[props.currentPage]', page.component)
	// }

	goToPage(nextStep) {
		let canAdvance =
			nextStep > this.props.currentPage && this.canAdvanceNextToPage()
		let canGoBack = nextStep < this.props.currentPage

		if (canAdvance || canGoBack) {
			this.props.setPageIndex(nextStep)
		}
	}

	canAdvanceNextToPage() {
		/* TODO: add check for optional steps that can be skipped
		 */
		let page = this.props.pages[this.props.currentPage]
		if (
			this.props.canAdvance &&
			!Object.keys(this.props.validations[page.props.validateId] || {}).length
		) {
			return true
		} else {
			return false
		}
	}

	isValidPage() {
		let page = this.props.pages[this.props.currentPage]
		return !Object.keys(this.props.validations[page.props.validateId] || {})
			.length
	}

	render() {
		let { pages, component, validations, currentPage, t, classes, ...props } = {
			...this.props,
		}
		let page = pages[currentPage]
		let Comp = page.component

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
						goToPage={this.goToPage.bind(this)}
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
							{props.canReverse ? (
								<Button onClick={() => props.setPageIndex(currentPage - 1)}>
									{t('BACK')}
								</Button>
							) : (
								''
							)}
						</div>

						<div className={classes.right}>
							{/* <Button label='Cancel' onClick={this.cancel}/> */}
							{page.cancelBtn ? <page.cancelBtn /> : null}
							{this.canAdvanceNextToPage() && !page.completeBtn ? (
								<Button
									variant='contained'
									color='primary'
									onClick={this.goToPage.bind(this, currentPage + 1)}
								>
									{t('CONTINUE')}
								</Button>
							) : !page.completeBtn ? (
								<Button label='Continue' disabled>
									{t('CONTINUE')}
								</Button>
							) : null}
							{page.completeBtn && this.isValidPage() ? (
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
}

const WithMaterialStepper = withStepper(
	withStyles(styles)(Translate(MaterialStepper))
)

class MyMaterialStepper extends React.Component {
	render() {
		return (
			<Stepper pages={this.props.pages} style={{ display: 'block' }}>
				<WithMaterialStepper
					itemType={this.props.itemType}
					validations={this.props.validations}
				/>
			</Stepper>
		)
	}
}

MyMaterialStepper.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
	pages: PropTypes.array.isRequired,
}

function mapStateToProps(state, props) {
	let persist = state.persist
	let memory = state.memory
	return {
		account: persist.account,
		validations: memory.validations,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MyMaterialStepper)
