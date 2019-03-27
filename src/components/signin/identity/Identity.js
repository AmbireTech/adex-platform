import React from 'react'
import Button from '@material-ui/core/Button'
import IdentityHoc from './IdentityHoc'
import IdentityContractAddressEthDeploy from './IdentityContractAddressEthDeploy'
import IdentityContractAddressEthTransaction from './IdentityContractAddressEthTransaction'
import IdentityContractOwner from './IdentityContractOwner'
import WalletInit from './WalletInit'
import WalletCheck from './WalletCheck'
import UserInfo from './UserInfo'
import GrantInfo from './GrantInfo'
import GrantDeploy from './GrantDeploy'
import CouponCheck from './CouponCheck'
import SaveIcon from '@material-ui/icons/Save'
import IdentitySteps from './IdentitySteps'
// import Translate from 'components/translate/Translate'
// import { withStyles } from '@material-ui/core/styles'
// import { styles } from './styles'

const GoBtn = ({ ...props }) => {
	return (
		<Button
			color='primary'
			onClick={props.save}
		>
			{/*TODO: withStyles */}
			<SaveIcon style={{ marginRight: 8 }} />
			{props.t('')}
		</Button>
	)
}

const GoBtnWithIdentity = IdentityHoc(GoBtn)

const CancelBtn = ({ ...props }) => {
	return (
		<Button onClick={props.cancel} >
			{props.t('CANCEL')}
		</Button>
	)
}

const CancelBtnWithIdentity = IdentityHoc(CancelBtn)

const common = {
	GoBtn: GoBtnWithIdentity,
	CancelBtn: CancelBtnWithIdentity,
	validateIdBase: 'identity-'
}

export const QuickIdentity = (props) =>
	<IdentitySteps
		{...props}
		{...common}
		stepsPages={[
			// { title: 'GRANT_INFO', page: GrantInfo },
			{ title: 'GRANT_DEPLOY', page: GrantDeploy, final: true },
			// { title: 'COUPON_CHECK', page: CouponCheck },
			// { title: 'USER_INFO', page: UserInfo },            
			// { title: 'INIT_WALLET', page: WalletInit },
			// { title: 'CHECK_WALLET', page: WalletCheck },
			// { title: 'GENERATE_IDENTITY_CONTRACT_ADDRESS', page: IdentityContractAddressEthDeploy },
			// { title: 'DEPLOY_IDENTITY_CONTRACT_ADDRESS', page: IdentityContractAddressEthTransaction }
		]}
	/>

export const FullIdentity = (props) =>
	<IdentitySteps
		{...props}
		{...common}
		stepsPages={[
			{ title: 'SET_IDENTITY_OWNER_ADDRESS', page: IdentityContractOwner },
			{ title: 'GENERATE_IDENTITY_CONTRACT_ADDRESS', page: IdentityContractAddressEthDeploy },
			{ title: 'DEPLOY_IDENTITY_CONTRACT_ADDRESS', page: IdentityContractAddressEthTransaction }
		]}
	/>

export const DemoIdentity = (props) =>
	<IdentitySteps
		{...props}
		{...common}
		stepsPages={[
			{ title: 'SET_IDENTITY_OWNER_ADDRESS', page: IdentityContractOwner },
			{ title: 'GENERATE_IDENTITY_CONTRACT_ADDRESS', page: IdentityContractAddressEthDeploy },
			{ title: 'DEPLOY_IDENTITY_CONTRACT_ADDRESS', page: IdentityContractAddressEthTransaction }
		]}
	/>