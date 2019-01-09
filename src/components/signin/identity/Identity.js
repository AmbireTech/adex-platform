import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Button from '@material-ui/core/Button'
import IdentityHoc from './IdentityHoc'
import IdentityContractAddress from './IdentityContractAddress'
import IdentityContractOwner from './IdentityContractOwner'
import ValidItemHoc from 'components/common/stepper/ValidItemHoc'
import MaterialStepper from 'components/common/stepper/MaterialUiStepper'
import SaveIcon from '@material-ui/icons/Save'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const SaveBtn = ({ ...props }) => {
    return (
        <Button
            color='primary'
            onClick={props.save}
        >
            {/*TODO: withStyles */}
            <SaveIcon style={{ marginRight: 8 }} />
            {props.t('SAVE')}
        </Button>
    )
}

const SaveBtnWithIdentity = IdentityHoc(SaveBtn)

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

        const { t } = props

        this.state = {
            pages: [
                { title: 'SET_IDENTITY_OWNER_ADDRESS', page: IdentityContractOwner },
                { title: 'GENERATE_IDENTITY_CONTRACT_ADDRESS', page: IdentityContractAddress }
            ].map(p => {
                return {
                    title: p.title,
                    component: ValidItemHoc(p.page),
                    props: { validateId: 'inentity-step-' + p.title },
                    CancelBtn: CancelBtn,
                    completeBtn: () => <SaveBtnWithIdentity t={t} />
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