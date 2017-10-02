import React from 'react'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../actions/itemActions'
import { Stepper } from 'react-step/lib/stepper'
import { withStepper } from 'react-step/lib/with-stepper'
import stepperTheme from './stepperTheme.css'
import FontIcon from 'react-toolbox/lib/font_icon'
import classnames from 'classnames'
import Ripple from 'react-toolbox/lib/ripple'

const Step = ({ page, active, i, children, theme, ...other }) => {
    let warning = page.status === 'warning'
    let done = page.status === 'done'
    theme = stepperTheme
    return (
        <div
            {...other}
            className={classnames(theme.step, page.optional ? theme.optional : '', warning ? theme.warning : '', active ? theme.active : '', done ? theme.done : '')}
        >
            {children}

            <div className={classnames(theme.circle)}>
                {warning ?
                    <FontIcon value='warning' />
                    : (
                        done ?
                            <FontIcon value='done' style={{fontSize: '20px', lineHeight: '24px'}} />
                            :
                            <span>{i + 1}</span>

                    )
                }
            </div>
            <div className={theme.barLeft}></div>
            <div className={theme.barRight}></div>
            <div className={theme.label}> {page.title} </div>
            <div className={theme.sublabel}> {page.optional === true ? 'hij' : ''} </div>
        </div>
    )
}

const RippleStep = Ripple({ spread: 3 })(Step)

class MyStepper extends React.Component {

    renderStep({ page, active, i }) {
        let theme = stepperTheme
        let warning = page.status === 'warning'
        return (
            <div
                key={i}
                className={classnames(theme.step, page.optional ? theme.optional : '', warning ? theme.warning : '', active ? theme.active : '')}
            >

                <div className={classnames(theme.circle)}>
                    {warning ?
                        <FontIcon value='warning' />
                        : <span>{i}</span>
                    }
                </div>
                <div className={theme.barLeft}></div>
                <div className={theme.barRight}></div>
                <div className={theme.label}> {page.title} </div>
                <div className={theme.sublabel}> {page.optional === true ? 'hij' : ''} </div>
            </div>
        )
    }

    renderStepperNav() {
        return (
            <div className={stepperTheme.stepperNav}>
                {this.props.pages.map((page, i) =>
                    <RippleStep key={i} page={page} active={i === this.props.currentPage} i={i} />)}
            </div>
        )

    }

    render() {
        return (
            <div>
                {this.renderStepperNav()}

                {this.props.pages.map((page, i) =>
                    <div
                        key={i}
                        onClick={() => this.props.setPageIndex(i)}
                        style={i === this.props.currentPage
                            ? {}
                            : {}
                        }
                    >
                        {page.render ? page.render() : <page.component />}
                    </div>
                )}
            </div>
        )
    }
}

const MyWithStepper = withStepper(MyStepper)

class StepperTest extends React.Component {
    render() {
        return (
            <Stepper pages={[
                {
                    title: 'Step one',
                    component: () => <div> HOI 1 </div>,
                },
                {
                    title: 'Step two',
                    component: () => <div> HOI 2 </div>,
                    status: 'warning',
                    subTitle: 'optional'
                },
                {
                    title: 'Step three',
                    component: () => <div> HOI 3 </div>,
                    optional: true,
                    status: 'done'
                },
            ]}>
                <MyWithStepper />
            </Stepper>
        )
    }
}

StepperTest.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    return {
        account: state.account
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
)(StepperTest)
