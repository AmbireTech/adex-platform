import React from 'react'
import WithdrawFromIdentity from './WithdrawFromIdentity'
import WithdrawAnyTokenFromIdentityPage from './WithdrawAnyTokenFromIdentity'
import SeAddressPrivilege from './SeAddressPrivilege'
import SetAccountENSPage from './SetAccountENSPage'
import TransactionPreview from './TransactionPreview'
import FormSteps from 'components/common/stepper/FormSteps'
import WithDialog from 'components/common/dialog/WithDialog'
import {
	addIdentityENS,
	withdrawOtherTokensFromIdentity,
} from 'services/smart-contracts/actions/identity'
import {
	identityWithdraw,
	setIdentityENS,
	validatePrivilegesChange,
	identityWithdrawAny,
	validateIdentityWithdraw,
	completeTx,
	execute,
	resetNewTransaction,
	updateIdentityPrivilege,
} from 'actions'

const FormStepsWithDialog = WithDialog(FormSteps)

const cancelFunction = stepsId => {
	execute(resetNewTransaction({ tx: stepsId }))
}

const txCommon = {
	cancelFunction,
	darkerBackground: true,
}

export const WithdrawTokenFromIdentity = props => (
	<FormStepsWithDialog
		{...props}
		btnLabel='ACCOUNT_WITHDRAW_FROM_IDENTITY_BTN'
		saveBtnLabel='ACCOUNT_WITHDRAW_FROM_IDENTITY_SAVE_BTN'
		title='ACCOUNT_WITHDRAW_FROM_IDENTITY_TITLE'
		stepsId='withdrawFromIdentity'
		{...txCommon}
		steps={[
			{
				title: 'ACCOUNT_WITHDRAW_FROM_IDENTITY_STEP',
				component: WithdrawFromIdentity,
				validationFn: ({ stepsId, validateId, dirty, onValid, onInvalid }) =>
					execute(
						validateIdentityWithdraw({
							stepsId,
							validateId,
							dirty,
							onValid,
							onInvalid,
						})
					),
			},
			{
				title: 'PREVIEW_AND_MAKE_TR',
				component: TransactionPreview,
				completeFn: ({ stepsId, validateId, onValid, onInvalid }) =>
					execute(
						completeTx({
							stepsId,
							validateId,
							competeAction: identityWithdraw,
							onValid,
							onInvalid,
						})
					),
			},
		]}
	/>
)

export const SetIdentityPrivilege = ({ SaveBtn, ...props }) => {
	return (
		<FormStepsWithDialog
			{...props}
			btnLabel='ACCOUNT_SET_IDENTITY_PRIVILEGE_BTN'
			saveBtnLabel='ACCOUNT_SET_IDENTITY_PRIVILEGE_SAVE_BTN'
			title='ACCOUNT_SET_IDENTITY_PRIVILEGE_TITLE'
			stepsId='setIdentityPrivilege'
			{...txCommon}
			steps={[
				{
					title: 'ACCOUNT_SET_IDENTITY_PRIVILEGE_STEP',
					component: SeAddressPrivilege,
					validationFn: ({ stepsId, validateId, dirty, onValid, onInvalid }) =>
						execute(
							validatePrivilegesChange({
								stepsId,
								validateId,
								dirty,
								onValid,
								onInvalid,
							})
						),
				},
				{
					title: 'PREVIEW_AND_MAKE_TR',
					component: TransactionPreview,
					completeBtnTitle: 'SIGN_TX',
					completeFn: ({ stepsId, validateId, onValid, onInvalid }) =>
						execute(
							completeTx({
								stepsId,
								validateId,
								competeAction: updateIdentityPrivilege,
								onValid,
								onInvalid,
							})
						),
				},
			]}
		/>
	)
}

export const WithdrawAnyTokenFromIdentity = props => (
	<FormStepsWithDialog
		{...props}
		btnLabel='ACCOUNT_WITHDRAW_ANY_FROM_IDENTITY_BTN'
		saveBtnLabel='ACCOUNT_WITHDRAW_FROM_IDENTITY_SAVE_BTN'
		title='ACCOUNT_WITHDRAW_FROM_IDENTITY_TITLE'
		stepsId='withdrawAnyFromIdentity'
		{...txCommon}
		steps={[
			{
				title: 'ACCOUNT_WITHDRAW_FROM_IDENTITY_STEP',
				component: WithdrawAnyTokenFromIdentityPage,
			},
		]}
		stepsPreviewPage={{
			title: 'PREVIEW_AND_MAKE_TX',
			component: TransactionPreview,
		}}
		saveFn={({ transaction } = {}) => {
			return execute(identityWithdrawAny(transaction))
		}}
		getFeesFn={({ transaction = {}, account } = {}) => {
			return withdrawOtherTokensFromIdentity({
				...transaction,
				getFeesOnly: true,
				account,
			})
		}}
	/>
)

export const SetAccountENS = props => (
	<FormStepsWithDialog
		{...props}
		btnLabel='ACCOUNT_SET_ENS_BTN'
		saveBtnLabel='ACCOUNT_SET_ENS_SAVE_BTN'
		title='ACCOUNT_SET_ENS_TITLE'
		stepsId='setENS'
		{...txCommon}
		steps={[
			{
				title: 'ACCOUNT_SET_ENS_STEP',
				component: SetAccountENSPage,
			},
		]}
		stepsPreviewPage={{
			title: 'PREVIEW_AND_MAKE_TR',
			component: TransactionPreview,
		}}
		saveFn={({ transaction } = {}) => {
			return execute(
				setIdentityENS({
					username: transaction.setEns,
				})
			)
		}}
		getFeesFn={({ account } = {}) => {
			return addIdentityENS({
				account,
				getFeesOnly: true,
			})
		}}
	/>
)
