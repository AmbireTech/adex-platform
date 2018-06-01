import React from 'react'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Stepper } from 'react-step/lib/stepper'
import { withStepper } from 'react-step/lib/with-stepper'
import stepperTheme from './stepperTheme.css'
import FontIcon from 'react-toolbox/lib/font_icon'
import classnames from 'classnames'
import Ripple from 'react-toolbox/lib/ripple'
// import { Button } from 'react-toolbox/lib/button'
import { items as ItemsConstants } from 'adex-constants'
import StepperMUI from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepIcon from '@material-ui/core/StepIcon'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Translate from 'components/translate/Translate'
import { styles } from './stepperThemeMUI'

// const MyStep = ({ page, active, index, children, theme, canAdvance, canFinish, canReverse, setPageIndex, canAdvanceToPage, currentPage, goToPage, ...other }) => {}

const StepperNav = ({ pages, currentPage, classes, ...other }) => {

    console.log('classes', classes)


    return (
        <StepperMUI
            alternativeLabel
            // className={stepperTheme.stepperNav}
            activeStep={currentPage}
        >
            {pages.map((page, i) => {
                // return (<MyStep key={page.title} page={page} active={i === currentPage} index={i} {...other} currentPage={currentPage} />)
                return (
                    <Step key={page.title} >
                        <StepLabel
                            StepIconProps={
                                {
                                    classes: {
                                        root: classes.root,
                                        active: classes.active,
                                    }
                                }
                            }
                        >
                            {page.title}
                        </StepLabel>

                    </Step>
                )
            })}
        </StepperMUI>
    )
}

class MaterialStepper extends React.Component {

    onComplete() {
        // console.log('currPage', this.currPage)
        let props = this.props
        let page = props.pages[props.currentPage]

        // console.log('props.pages[props.currentPage]', page.component)
    }

    goToPage(nexStep) {
        let canAdvance = (nexStep > this.props.currentPage) && this.canAdvanceNextToPage()
        let canGoBack = nexStep < this.props.currentPage

        if (canAdvance || canGoBack) {
            this.props.setPageIndex(nexStep)
        }
    }

    canAdvanceNextToPage() {
        /* TODO: add check for optional steps that can be skipped
        */
        let page = this.props.pages[this.props.currentPage]
        if (this.props.canAdvance && !Object.keys(this.props.validations[page.props.validateId] || {}).length) {
            return true
        } else {
            return false
        }
    }

    isValidPage() {
        let page = this.props.pages[this.props.currentPage]
        return !Object.keys(this.props.validations[page.props.validateId] || {}).length
    }

    render() {
        let { pages, component, validations, currentPage, t, ...props } = { ...this.props }
        let page = pages[currentPage]
        let Comp = page.component

        return (
            <div className={stepperTheme.stepper}>
                <StepperNav  {...props} pages={pages} currentPage={currentPage} goToPage={this.goToPage.bind(this)} />

                <div className={stepperTheme.page}>
                    <div className={stepperTheme.pageContent}>
                        {<Comp {...page.props} />}
                    </div>

                    <div className={stepperTheme.controls}>
                        <div className={stepperTheme.left}>
                            {props.canReverse ?
                                <Button onClick={() => props.setPageIndex(currentPage - 1)} >
                                    {t('BACK')}
                                </Button>
                                : ''}
                        </div>

                        <div className={stepperTheme.right} >
                            {/* <Button label='Cancel' onClick={this.cancel}/> */}
                            {page.cancelBtn ?
                                <page.cancelBtn />
                                : null}
                            {this.canAdvanceNextToPage() && !page.completeBtn ?
                                <Button onClick={this.goToPage.bind(this, currentPage + 1)} >
                                    {t('CONTINUE')}
                                </Button>
                                :
                                !page.completeBtn ?
                                    <Button label='Continue' disabled >
                                        {t('CONTINUE')}
                                    </Button >
                                    : null}
                            {page.completeBtn && this.isValidPage() ?
                                <page.completeBtn />
                                : ''}
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}

const WithMaterialStepper = withStepper(withStyles(styles)(Translate(MaterialStepper)))

class MyMaterialStepper extends React.Component {

    render() {
        return (
            <Stepper pages={this.props.pages} style={{ display: 'block' }}>
                <WithMaterialStepper itemType={this.props.itemType} validations={this.props.validations} />
            </Stepper>
        )
    }
}

MyMaterialStepper.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    pages: PropTypes.array.isRequired
}

function mapStateToProps(state, props) {
    let persist = state.persist
    let memory = state.memory
    return {
        account: persist.account,
        validations: memory.validations
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)((MyMaterialStepper))
