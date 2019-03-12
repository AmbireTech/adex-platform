import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Button from '@material-ui/core/Button'
import IdentityHoc from './IdentityHoc'
import IdentityContractAddressEthDeploy from './IdentityContractAddressEthDeploy'
import IdentityContractAddressEthTransaction from './IdentityContractAddressEthTransaction'
import IdentityContractOwner from './IdentityContractOwner'
import WalletInit from './WalletInit'
import WalletCheck from './WalletCheck'
import ValidItemHoc from 'components/common/stepper/ValidItemHoc'
import MaterialStepper from 'components/common/stepper/MaterialUiStepper'
import SaveIcon from '@material-ui/icons/Save'
import IdentitySteps from './IdentitySteps'
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

const CancelBtnWithIdentity = IdentityHoc(CancelBtn)

const common = {
    SaveBtn: SaveBtnWithIdentity,
    CancelBtn: CancelBtnWithIdentity,
    validateIdBase: 'identity-'
}

export const QuickIdentity = (props) =>
    <IdentitySteps
        {...props}
        {...common}
        stepsPages={[
            { title: 'INIT_WALLET', page: WalletInit },
            { title: 'CHECK_WALLET', page: WalletCheck },
            { title: 'GENERATE_IDENTITY_CONTRACT_ADDRESS', page: IdentityContractAddressEthDeploy },
            { title: 'DEPLOY_IDENTITY_CONTRACT_ADDRSS', page: IdentityContractAddressEthTransaction }
        ]}
    />

export const FullIdentity = (props) =>
    <IdentitySteps
        {...props}
        {...common}
        stepsPages={[
            { title: 'SET_IDENTITY_OWNER_ADDRESS', page: IdentityContractOwner },
            { title: 'GENERATE_IDENTITY_CONTRACT_ADDRESS', page: IdentityContractAddressEthDeploy },
            { title: 'DEPLOY_IDENTITY_CONTRACT_ADDRSS', page: IdentityContractAddressEthTransaction }
        ]}
    />

export const DemoIdentity = (props) =>
    <IdentitySteps
        {...props}
        {...common}
        stepsPages={[
            { title: 'SET_IDENTITY_OWNER_ADDRESS', page: IdentityContractOwner },
            { title: 'GENERATE_IDENTITY_CONTRACT_ADDRESS', page: IdentityContractAddressEthDeploy },
            { title: 'DEPLOY_IDENTITY_CONTRACT_ADDRSS', page: IdentityContractAddressEthTransaction }
        ]}
    />