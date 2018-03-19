import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Chip from 'react-toolbox/lib/chip'
import theme from './theme.css'
import FontIcon from 'react-toolbox/lib/font_icon'
import Tooltip from 'react-toolbox/lib/tooltip'
import FloatingProgressButton from 'components/common/floating_btn_progress/FloatingProgressButton'
import classnames from 'classnames'
import Translate from 'components/translate/Translate'

const TooltipFontIcon = Tooltip(FontIcon)

// NOTE: Separate component to track the validations and spinner to avoid rerender of item top level components
class SaveBtn extends Component {

    render() {
        let t = this.props.t
        return (

            <div className={classnames(theme.top, theme.right)}>

                {!!this.props.spinner ?
                    null
                    : (
                        this.props.dirtyProps.length ?
                            (
                                <div className={theme.itemStatus}>
                                    <TooltipFontIcon value='info_outline' tooltip={t('UNSAVED_CHANGES')} />
                                    {this.props.dirtyProps.map((p) => {
                                        return (
                                            <Chip
                                                deletable
                                                key={p}
                                                onDeleteClick={this.props.returnPropToInitialState.bind(this, p)}
                                            >
                                                {t(p, { isProp: true })}
                                            </Chip>)
                                    })}
                                </div>
                            ) : ''
                    )}
                <FloatingProgressButton
                    inProgress={!!this.props.spinner}
                    theme={theme}
                    icon='save'
                    onClick={this.props.save}
                    floating
                    primary
                    disabled={!!Object.keys(this.props.validations[this.props.validationId] || {}).length}
                />
            </div>

        )
    }
}

SaveBtn.propTypes = {
    spinnerId: PropTypes.string,
    validationId: PropTypes.string,
    itemId: PropTypes.string,
    validations: PropTypes.object
}

function mapStateToProps(state, props) {
    // let persist = state.persist
    let memory = state.memory
    return {
        spinner: memory.spinners[props.spinnerId],
        validations: memory.validations
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

export default  connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(SaveBtn))
