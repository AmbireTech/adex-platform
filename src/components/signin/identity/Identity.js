import React from 'react'
import Button from '@material-ui/core/Button'
import IdentityHoc from './IdentityHoc'
import IdentityContractAddressEthDeploy from './IdentityContractAddressEthDeploy'
import IdentityContractAddressEthTransaction from './IdentityContractAddressEthTransaction'
import IdentityContractOwner from './IdentityContractOwner'
import AllInOneTest from './OneStepToTestThemAll'
import CircularProgress from '@material-ui/core/CircularProgress'
import WalletInit from './WalletInit'
import WalletCheck from './WalletCheck'
import UserInfo from './UserInfo'
import GrantInfo from './GrantInfo'
import GrantDeploy from './GrantDeploy'
import GrantLogin from './GrantLogin'
import SaveIcon from '@material-ui/icons/Save'
import IdentitySteps from './IdentitySteps'
// import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const GoBtn = ({ waiting, save, t, classes, ...rest }) => {
	return (
		<span className={classes.buttonProgressWrapper}>
			<Button
				color='primary'
				onClick={save}
				disabled={waiting}
			>
				{t('LEST_GO')}
			</Button>
			{waiting && <CircularProgress size={24} className={classes.buttonProgress} />}
		</span >
	)
}

const GoBtnWithIdentity = withStyles(styles)(IdentityHoc(GoBtn))

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

export const CreateGrantIdentity = (props) =>
	<IdentitySteps
		{...props}
		{...common}
		stepsId='grant-identity'
		stepsPages={[
			{ title: 'GRANT_INFO', page: GrantInfo },
			{ title: 'GRANT_DEPLOY', page: GrantDeploy, final: true }
		]}
	/>

export const LoginGrantIdentity = (props) =>
	<IdentitySteps
		{...props}
		{...common}
		stepsId='grant-identity'
		stepsPages={[
			{ title: 'GRANT_LOGIN', page: GrantLogin,  final: true  }
		]}
	/>

export const CreteFullIdentity = (props) =>
	<IdentitySteps
		{...props}
		{...common}
		stepsId='full-identity'
		stepsPages={[
			{ title: 'SET_IDENTITY_OWNER_ADDRESS', page: IdentityContractOwner },
			{ title: 'GENERATE_IDENTITY_CONTRACT_ADDRESS', page: IdentityContractAddressEthDeploy },
			{ title: 'DEPLOY_IDENTITY_CONTRACT_ADDRESS', page: IdentityContractAddressEthTransaction, final: true }
		]}
	/>


export const DemoIdentity = (props) =>
	<IdentitySteps
		{...props}
		{...common}
		stepsPages={[
			{ title: 'TEST_THIS_DEMO_IF_YOU_WANT_TEST', page: AllInOneTest }
		]}
	/>