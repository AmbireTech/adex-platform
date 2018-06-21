import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import FloatingProgressButton from 'components/common/floating_btn_progress/FloatingProgressButton'
import Translate from 'components/translate/Translate'

// NOTE: Separate component to track the validations and spinner to avoid rerender of item top level components
class SaveBtn extends Component {

    render() {
        let t = this.props.t
        return (
            <FloatingProgressButton
                inProgress={!!this.props.spinner}
                theme={theme}
                icon='save'
                onClick={this.props.save}
                floating
                primary
                disabled={!!Object.keys(this.props.validations[this.props.validationId] || {}).length}
            />
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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(SaveBtn))
