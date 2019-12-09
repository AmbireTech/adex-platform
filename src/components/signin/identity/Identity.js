import React from 'react'
import Button from '@material-ui/core/Button'
import IdentityHoc from './IdentityHoc'
import IdentityContractAddressEthDeploy from './IdentityContractAddressEthDeploy'
// import IdentityContractAddressEthTransaction from './IdentityContractAddressEthTransaction'
import IdentityContractOwner from './IdentityContractOwner'
import CircularProgress from '@material-ui/core/CircularProgress'
import GrantInfo from './GrantInfo'
import GrantDeploy from './GrantDeploy'
import GrantLogin from './GrantLogin'
import QuickInfo from './QuickInfo'
import QuickDeploy from './QuickDeploy'
import QuickLogin from './QuickLogin'
import QuickRecover from './QuickRecover'
// import FullLogin from './FullLogin'
import { ExternalConnect } from './ExternalWalletConnect'
import IdentitySteps from './IdentitySteps'
// import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { execute, validateQuickRecovery } from 'actions'

const GoBtn = ({ waiting, save, t, classes, ...rest }) => {
	return (
		<span className={classes.buttonProgressWrapper}>
			<Button color='primary' onClick={save} disabled={waiting}>
				{t('LETS_GO')}
			</Button>
			{waiting && (
				<CircularProgress size={24} className={classes.buttonProgress} />
			)}
		</span>
	)
}

const GoBtnWithIdentity = withStyles(styles)(IdentityHoc(GoBtn))

const CancelBtn = ({ ...props }) => {
	return <Button onClick={props.cancel}>{props.t('CANCEL')}</Button>
}

const CancelBtnWithIdentity = IdentityHoc(CancelBtn)

const common = {
	GoBtn: GoBtnWithIdentity,
	CancelBtn: CancelBtnWithIdentity,
	validateIdBase: 'identity-',
}

export const CreateGrantIdentity = props => (
	<IdentitySteps
		{...props}
		{...common}
		stepsId='grant-identity-create'
		stepsPages={[
			{ title: 'GRANT_INFO', page: GrantInfo },
			{
				title: 'GRANT_DEPLOY',
				page: GrantDeploy,
				final: true,
				disableBtnsIfValid: true,
			},
		]}
	/>
)

export const LoginGrantIdentity = props => (
	<IdentitySteps
		{...props}
		{...common}
		stepsId='grant-identity-login'
		stepsPages={[{ title: 'GRANT_LOGIN', page: GrantLogin, final: true }]}
	/>
)

export const CreteFullIdentity = props => (
	<IdentitySteps
		{...props}
		{...common}
		stepsId='full-identity-create'
		stepsPages={[
			{ title: 'SET_IDENTITY_OWNER_ADDRESS', page: IdentityContractOwner },
			{
				title: 'GENERATE_IDENTITY_CONTRACT_ADDRESS',
				page: IdentityContractAddressEthDeploy,
				final: true,
			},
			// { title: 'DEPLOY_IDENTITY_CONTRACT_ADDRESS', page: IdentityContractAddressEthTransaction, final: true }
		]}
	/>
)

export const LoginStandardIdentity = props => {
	return (
		<IdentitySteps
			{...props}
			{...common}
			stepsId='full-identity-login'
			stepsPages={[
				{ title: 'SET_IDENTITY_OWNER_ADDRESS', page: IdentityContractOwner },
				{
					title: 'CONNECT_STANDARD_IDENTITY',
					page: ExternalConnect,
					final: true,
				},
			]}
		/>
	)
}

export const CreateQuickIdentity = props => (
	<IdentitySteps
		{...props}
		{...common}
		stepsId='quick-identity-create'
		stepsPages={[
			{ title: 'QUICK_INFO', page: QuickInfo },
			{ title: 'QUICK_DEPLOY', page: QuickDeploy, final: true },
		]}
	/>
)

export const LoginQuickIdentity = props => (
	<IdentitySteps
		{...props}
		{...common}
		stepsId='quick-identity-login'
		stepsPages={[{ title: 'QUICK_LOGIN', page: QuickLogin, final: true }]}
	/>
)

export const RecoverQuickIdentity = props => (
	<IdentitySteps
		{...props}
		{...common}
		stepsId='quick-identity-recover'
		stepsPages={[
			{
				title: 'QUICK_RECOVER_DATA',
				page: QuickRecover,
				pageValidation: ({ validateId, dirty, onValid, onInvalid }) =>
					execute(
						validateQuickRecovery({ validateId, dirty, onValid, onInvalid })
					),
				goToNextPageIfValid: true,
			},
			{ title: 'QUICK_LOGIN', page: QuickLogin, final: true },
		]}
	/>
)

export const DemoIdentity = props => (
	<IdentitySteps {...props} {...common} stepsPages={[]} />
)
