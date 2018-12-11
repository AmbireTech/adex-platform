import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Button from '@material-ui/core/Button'
import IdentityContractAddress from './IdentityContractAddress'
import ValidItemHoc from 'components/common/stepper/ValidItemHoc'
import MaterialStepper from 'components/common/stepper/MaterialUiStepper'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const CancelBtn = ({ ...props }) => {
    return (
        <Button onClick={props.cancel} >
            {props.t('CANCEL')}
        </Button>
    )
}

class Identty extends Component {

    constructor(props) {
        super(props)

        this.state = {
            pages: [
                { title: 'GENERATE_IDENTITY_CONTRACT_ADDRESS', page: IdentityContractAddress }
            ].map(p => {
                return {
                    title: p.title,
                    component: ValidItemHoc(p.page),
                    props: { validateId: 'inentity-step-' + p.title },
                    CancelBtn: CancelBtn
                }
            })
        }
    }

    render = () =>
        <MaterialStepper pages={this.state.pages} />
}

Identty.propTypes = {
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
)(Translate(withStyles(styles)(Identty)))