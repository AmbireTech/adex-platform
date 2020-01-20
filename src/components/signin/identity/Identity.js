import React from 'react'
import AuthMethod from './ownerAuth/AuthMethod'
import QuickInfo from './QuickInfo'
import FullInfo from './FullInfo'
import QuickDeploy from './QuickDeploy'
import QuickLogin from './QuickLogin'
import FullLogin from './FullLogin'
import FullDeploy from './FullDeploy'
import IdentitySteps from './IdentitySteps'
import { push } from 'connected-react-router'

import {
	execute,
	validateQuickLogin,
	validateStandardLogin,
	validateQuickInfo,
	validateFullInfo,
	validateQuickDeploy,
	validateFullDeploy,
	validateContractOwner,
	resetIdentity,
} from 'actions'

const cancelFunction = () => {
	execute(resetIdentity())
	execute(push('/'))
}

const finalValidationQuick = ({ validateId, dirty, onValid, onInvalid }) =>
	execute(validateQuickLogin({ validateId, dirty, onValid, onInvalid }))

const finalValidationStandard = ({ validateId, dirty, onValid, onInvalid }) =>
	execute(validateStandardLogin({ validateId, dirty, onValid, onInvalid }))

const validateOwner = ({ validateId, dirty, onValid, onInvalid }) =>
	execute(validateContractOwner({ validateId, dirty, onValid, onInvalid }))

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
				{
					title: 'SET_IDENTITY_OWNER_ADDRESS',
					page: AuthMethod,
					pageValidation: validateOwner,
				},
				{
					title: 'CONNECT_STANDARD_IDENTITY',
					page: FullLogin,
					pageValidation: finalValidationStandard,
					final: true,
				},
			]}
		/>
	)
}

export const CreateStandardIdentity = props => {
	return (
		<IdentitySteps
			{...props}
			{...common}
			stepsId='full-identity-create'
			stepsPages={[
				{
					title: 'SET_IDENTITY_OWNER_ADDRESS',
					page: AuthMethod,
					pageValidation: validateOwner,
				},
				{
					title: 'FULL_INFO',
					page: FullInfo,
					pageValidation: ({ validateId, dirty, onValid, onInvalid }) =>
						execute(
							validateFullInfo({ validateId, dirty, onValid, onInvalid })
						),
				},
				{
					title: 'DEPLOY_STANDARD_IDENTITY',
					page: FullDeploy,
					pageValidation: ({ validateId, dirty, onValid, onInvalid }) =>
						execute(validateFullDeploy({ validateId, dirty })),
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
