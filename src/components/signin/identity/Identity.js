import React from 'react'
import IdentityContractAddressEthDeploy from './IdentityContractAddressEthDeploy'
import IdentityContractOwner from './IdentityContractOwner'
import QuickInfo from './QuickInfo'
import QuickDeploy from './QuickDeploy'
import QuickLogin from './QuickLogin'
import QuickRecover from './QuickRecover'
import { ExternalConnect } from './ExternalWalletConnect'
import IdentitySteps from './IdentitySteps'
import { push } from 'connected-react-router'

import {
	execute,
	validateQuickRecovery,
	validateQuickLogin,
	validateStandardLogin,
	validateQuickInfo,
	resetIdentity,
} from 'actions'

const cancelFunction = () => {
	execute(resetIdentity())
	execute(push('/'))
}

const finalValidationQuick = ({ validateId, dirty, onValid, onInvalid }) =>
	execute(validateQuickLogin({ validateId, dirty }))

const finalValidationStandard = ({ validateId, dirty, onValid, onInvalid }) =>
	execute(validateStandardLogin({ validateId, dirty }))

const common = {
	cancelFunction,
	validateIdBase: 'identity-',
}

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
				pageValidation: finalValidationStandard,
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
					pageValidation: finalValidationStandard,
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
			{
				title: 'QUICK_INFO',
				page: QuickInfo,
				pageValidation: ({ validateId, dirty, onValid, onInvalid }) =>
					execute(validateQuickInfo({ validateId, dirty, onValid, onInvalid })),
			},
			{
				title: 'QUICK_DEPLOY',
				page: QuickDeploy,
				pageValidation: finalValidationQuick,
				final: true,
			},
		]}
	/>
)

export const LoginQuickIdentity = props => (
	<IdentitySteps
		{...props}
		{...common}
		stepsId='quick-identity-login'
		stepsPages={[
			{
				title: 'QUICK_LOGIN',
				page: QuickLogin,
				pageValidation: finalValidationQuick,
				final: true,
			},
		]}
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
			{
				title: 'QUICK_LOGIN',
				page: QuickLogin,
				pageValidation: finalValidationQuick,
				final: true,
			},
		]}
	/>
)

export const DemoIdentity = props => (
	<IdentitySteps {...props} {...common} stepsPages={[]} />
)
