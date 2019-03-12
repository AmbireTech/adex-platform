import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ValidItemHoc from 'components/common/stepper/ValidItemHoc'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class IdentitySteps extends Component {

    render() {
        let pages = []
        const { SaveBtn, CancelBtn, t, onSave, stepsId, stepsPages, stepsPreviewPage, validateIdBase, ...rest } = this.props
        const cancelButton = () => <CancelBtn  {...rest} stepsId={stepsId} onSave={onSave} t={t} />
        const validateId = (validateIdBase || '') + '-' + stepsId

        stepsPages.map((page, index) => {
            pages.push({
                title: t(page.title),
                cancelBtn: cancelButton,
                component: ValidItemHoc(page.page),
                props: { ...this.props, validateId: validateId + '-' + index }
            })
        })

        return (
            <MaterialStepper pages={pages} />
        )
    }
}

IdentitySteps.propTypes = {
    actions: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
    const persist = state.persist
    // const memory = state.memory
    return {
        account: persist.account
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
)(Translate(withStyles(styles)(IdentitySteps)))