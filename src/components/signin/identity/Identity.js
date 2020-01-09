import React from 'react'
import IdentityContractOwner from './IdentityContractOwner'
import QuickInfo from './QuickInfo'
import QuickDeploy from './QuickDeploy'
import QuickLogin from './QuickLogin'
import { ExternalConnect } from './ExternalWalletConnect'
import IdentitySteps from './IdentitySteps'
import { push } from 'connected-react-router'

import {
	execute,
	validateQuickLogin,
	validateStandardLogin,
	validateQuickInfo,
	validateQuickDeploy,
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
				pageValidation: ({ validateId, dirty, onValid, onInvalid }) =>
					execute(
						validateQuickDeploy({ validateId, dirty, onValid, onInvalid })
					),
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

export const DemoIdentity = props => (
	<IdentitySteps {...props} {...common} stepsPages={[]} />
)
