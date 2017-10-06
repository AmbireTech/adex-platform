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
import { Button } from 'react-toolbox/lib/button'

const Step = ({ page, active, index, children, theme, canAdvance, canFinish, canReverse, setPageIndex, ...other }) => {
    let warning = page.status === 'warning'
    let done = page.status === 'done'
    theme = stepperTheme
    return (
        <div
            className={classnames(theme.step,
                { [page.optional]: theme.optional },
                { [theme.warning]: warning },
                { [theme.active]: active },
                { [theme.done]: done }
            )}
            {...other}
            onClick={() => setPageIndex(index)}
        >
            {children}

            <div className={classnames(theme.circle)}>
                {warning ?
                    <FontIcon value='warning' />
                    : (
                        done ?
                            <FontIcon value='done' style={{ fontSize: '20px', lineHeight: '24px' }} />
                            :
                            <span>{index + 1}</span>
                    )
                }
            </div>
            <div className={theme.barLeft}></div>
            <div className={theme.barRight}></div>
            <div className={theme.label}> {page.title} </div>
            <div className={theme.subLabel}> {page.optional === true ? 'hij' : ''} </div>
        </div>
    )
}

const RippleStep = Ripple({ spread: 3 })(Step)

const StepperNav = ({ pages, currentPage, ...other }) => {
    return (
        <div className={stepperTheme.stepperNav}>
            {pages.map((page, i) =>
                <RippleStep key={i} page={page} active={i === currentPage} index={i} {...other} />)}
        </div>
    )
}

const MaterialStepper = ({ ...props }) => {

    let page = props.pages[props.currentPage]

    return (
        <div>
            <StepperNav  {...props} />

            <div>
                {page.render ? page.render() : <page.component />}
            </div>
            <div>
                {props.canAdvance ?
                    <Button label='Continue' primary flat raised onClick={() =>
                        props.setPageIndex(props.currentPage + 1)
                    } />
                    : ''}
                <Button label='Cancel' accent />
            </div>
        </div>
    )
}

const WithMaterialStepper = withStepper(MaterialStepper)

class MyMaterialStepper extends React.Component {

    render() {
        return (
            <Stepper pages={this.props.pages}>
                <WithMaterialStepper />
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
)(MyMaterialStepper)
