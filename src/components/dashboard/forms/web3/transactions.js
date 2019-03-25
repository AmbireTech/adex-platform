import React from 'react'
import WithdrawStep from './WithdrawStep'
import DepositToExchange from './DepositToExchange'
import WithdrawFromExchangePage from './WithdrawFromExchange'
import AcceptBidStep from './AcceptBid'
import CancelBidStep from './CancelBid'
import VerifyBidStep from './VerifyBid'
import TransactionPreview from './TransactionPreview'
import scActions from 'services/smart-contracts/actions'
import { sendBidState } from 'services/adex-node/actions'
import Button from '@material-ui/core/Button'
import TransactionHoc from './TransactionHoc'
import FormSteps from 'components/dashboard/forms/FormSteps'
import WithDialog from 'components/common/dialog/WithDialog'
// import SaveIcon from '@material-ui/icons/Save'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'

const {
	withdrawEth,
	withdrawToken,
	acceptBid,
	cancelBid,
	verifyBid,
	giveupBid,
	refundBid,
	depositEthToIdentity,
	depositToIdentity,
	depositToIdentityEG,
	withdrawEthFromIdentity,
	withdrawTokensFromIdentity
} = scActions

const FormStepsWithDialog = WithDialog(FormSteps)

const SaveBtn = ({ save, saveBtnLabel, saveBtnIcon, t, transaction, waitingForWalletAction, spinner, ...other }) => {
	return (
		<Button
			color='primary'
			onClick={save}
			disabled={(transaction.errors && transaction.errors.length) || transaction.waitingForWalletAction || spinner}
		>
			{transaction.waitingForWalletAction ? <HourglassEmptyIcon /> : (saveBtnIcon || '')}
			{t(saveBtnLabel || 'DO_IT')}
		</Button>
	)
}

const CancelBtn = ({ cancel, cancelBtnLabel, t, ...other }) => {
	return (
		<Button
			onClick={cancel}
		>
			{t(cancelBtnLabel || 'CANCEL')}
		</Button>
	)
}

const SaveBtnWithTransaction = TransactionHoc(SaveBtn)
const CancelBtnWithTransaction = TransactionHoc(CancelBtn)

const txCommon = {
	SaveBtn: SaveBtnWithTransaction,
	CancelBtn: CancelBtnWithTransaction,
	stepsPreviewPage: { title: 'PREVIEW_AND_MAKE_TR', page: TransactionPreview },
	validateIdBase: 'tx-',
	darkerBackground: true
}

export const WithdrawEth = (props) =>
	<FormStepsWithDialog
		{...props}
		btnLabel="ACCOUNT_WITHDRAW_ETH_BTN"
		saveBtnLabel='ACC_WITHDRAW_ETH_SAVE_BTN'
		title="ACCOUNT_WITHDRAW_ETH_TITLE"
		stepsId='withdrawEth'
		{...txCommon}
		stepsPages={[{ title: 'ACCOUNT_WITHDRAW_ETH_STEP', page: WithdrawStep }]}
		saveFn={({ acc, transaction } = {}) => {
			return withdrawEth(
				{
					user: acc,
					_addr: acc._addr,
					withdrawTo: transaction.withdrawTo,
					amountToWithdraw: transaction.amountToWithdraw,
					gas: transaction.gas
				})
		}}
		estimateGasFn={({ acc, transaction } = {}) => {
			return withdrawEth(
				{
					user: acc,
					_addr: acc._addr,
					withdrawTo: transaction.withdrawTo,
					amountToWithdraw: transaction.amountToWithdraw,
					gas: transaction.gas,
					estimateGasOnly: true
				})
		}}
	/>

export const WithdrawTokens = (props) =>
	<FormStepsWithDialog
		{...props}
		btnLabel="ACCOUNT_WITHDRAW_TOKEN_BTN"
		saveBtnLabel='ACC_WITHDRAW_TOKEN_SAVE_BTN'
		title="ACCOUNT_WITHDRAW_TOKEN_TITLE"
		stepsId='withdrawToken'
		{...txCommon}
		stepsPages={[{ title: 'ACCOUNT_WITHDRAW_TOKEN_STEP', page: WithdrawStep }]}
		saveFn={({ acc, transaction } = {}) => {
			return withdrawToken(
				{
					user: acc,
					_addr: acc._addr,
					withdrawTo: transaction.withdrawTo,
					amountToWithdraw: transaction.amountToWithdraw,
					gas: transaction.gas
				})
		}}
		estimateGasFn={({ acc, transaction } = {}) => {
			return withdrawToken(
				{
					user: acc,
					_addr: acc._addr,
					withdrawTo: transaction.withdrawTo,
					amountToWithdraw: transaction.amountToWithdraw,
					gas: transaction.gas,
					estimateGasOnly: true
				})
		}}
	/>

export const AcceptBid = (props) =>
	< FormStepsWithDialog
		{...props}
		btnLabel="ACCEPT_BID"
		saveBtnLabel='ACCEPT_BID_SAVE_BTN'
		title="ACCEPT_BID_TITLE"
		stepsId={'accept_bid_slot_' + props.slotId + '_bid_' + props.bidId}
		{...txCommon}
		stepsPages={[{ title: 'ACCEPT_BID_STEP', page: AcceptBidStep }]}
		saveFn={({ acc, transaction } = {}) => {
			return acceptBid(
				{
					user: acc,
					placedBid: transaction.placedBid,
					_adSlot: transaction.slot._ipfs,
					_addr: transaction.account._addr,
					gas: transaction.gas
				})
				.then((res) => {
					sendBidState({ bidId: res.bidId, state: res.state, trHash: res.trHash, authSig: acc._authSig })
					return res
				})
		}}
		estimateGasFn={({ acc, transaction } = {}) => {
			return acceptBid(
				{
					user: acc,
					placedBid: transaction.placedBid,
					_adSlot: transaction.slot._ipfs,
					_addr: transaction.account._addr,
					gas: transaction.gas,
					estimateGasOnly: true
				})
		}}
	/>

export const CancelBid = (props) =>
	< FormStepsWithDialog
		{...props}
		btnLabel="CANCEL_BID"
		saveBtnLabel='CANCEL_BID_SAVE_BTN'
		title="CANCEL_BID_TITLE"
		stepsId={'cancel_bid_adunit_' + props.unitId + '_bid_' + props.bidId}
		{...txCommon}
		stepsPages={[{ title: 'CANCEL_BID_STEP', page: CancelBidStep }]}
		saveFn={({ acc, transaction } = {}) => {
			return cancelBid(
				{
					user: acc,
					placedBid: transaction.placedBid,
					_adUnit: transaction.unit._ipfs,
					_addr: transaction.account._addr,
					gas: transaction.gas
				})
				.then((res) => {
					sendBidState({ bidId: res.bidId, state: res.state, trHash: res.trHash, authSig: acc._authSig })
					return res
				})
		}}
		estimateGasFn={({ acc, transaction } = {}) => {
			return cancelBid(
				{
					user: acc,
					placedBid: transaction.placedBid,
					_adUnit: transaction.unit._ipfs,
					_addr: transaction.account._addr,
					gas: transaction.gas,
					estimateGasOnly: true
				})
		}}
	/>

export const VerifyBid = (props) =>
	< FormStepsWithDialog
		{...props}
		btnLabel="VERIFY_BID"
		btnLabelArgs={[props.questionableVerify ? ' ?' : '']}
		saveBtnLabel='VERIFY_BID_SAVE_BTN'
		title="VERIFY_BID_TITLE"
		stepsId={'verify_bid_item_' + props.itemId + '_bid_' + props.bidId}
		{...txCommon}
		stepsPages={[{ title: 'VERIFY_BID_STEP', page: VerifyBidStep }]}
		verifyType='verify'
		saveFn={({ acc, transaction } = {}) => {
			return verifyBid(
				{
					user: acc,
					placedBid: transaction.placedBid,
					_report: transaction.report.ipfs,
					_addr: acc._addr,
					gas: transaction.gas,
					side: transaction.side
				})
				.then((res) => {
					sendBidState({ bidId: res.bidId, state: res.state, trHash: res.trHash, authSig: acc._authSig })
					return res
				})
		}}
		estimateGasFn={({ acc, transaction } = {}) => {
			return verifyBid(
				{
					user: acc,
					placedBid: transaction.placedBid,
					_report: transaction.report.ipfs,
					_addr: acc._addr,
					gas: transaction.gas,
					side: transaction.side,
					estimateGasOnly: true
				})
		}}
	/>

export const GiveupBid = (props) =>
	< FormStepsWithDialog
		{...props}
		btnLabel="GIVEUP_BID"
		btnLabelArgs={[props.questionableVerify ? ' ?' : '']}
		saveBtnLabel='GIVEUP_BID_SAVE_BTN'
		title="GIVEUP_BID_TITLE"
		stepsId={'giveup_bid_slot_' + props.slotId + '_bid_' + props.bidId}
		{...txCommon}
		stepsPages={[{ title: 'GIVEUP_BID_STEP', page: VerifyBidStep }]}
		verifyType='giveup'
		saveFn={({ acc, transaction } = {}) => {
			return giveupBid(
				{
					user: acc,
					placedBid: transaction.placedBid,
					_addr: acc._addr,
					gas: transaction.gas,
				})
				.then((res) => {
					sendBidState({ bidId: res.bidId, state: res.state, trHash: res.trHash, authSig: acc._authSig })
					return res
				})
		}}
		estimateGasFn={({ acc, transaction } = {}) => {
			return giveupBid(
				{
					user: acc,
					placedBid: transaction.placedBid,
					_addr: acc._addr,
					gas: transaction.gas,
					estimateGasOnly: true
				})
		}}
	/>


export const RefundBid = (props) =>
	< FormStepsWithDialog
		{...props}
		btnLabel="REFUND_BID"
		btnLabelArgs={[props.questionableVerify ? ' ?' : '']}
		saveBtnLabel='REFUND_BID_SAVE_BTN'
		title="REFUND_BID_TITLE"
		stepsId={'refund_bid_unit_' + props.unitId + '_bid_' + props.bidId}
		{...txCommon}
		stepsPages={[{ title: 'REFUND_BID_STEP', page: VerifyBidStep }]}
		verifyType='refund'
		saveFn={({ acc, transaction } = {}) => {
			return refundBid(
				{
					user: acc,
					placedBid: transaction.placedBid,
					_addr: acc._addr,
					gas: transaction.gas,
				})
				.then((res) => {
					sendBidState({ bidId: res.bidId, state: res.state, trHash: res.trHash, authSig: acc._authSig })
					return res
				})
		}}
		estimateGasFn={({ acc, transaction } = {}) => {
			return refundBid(
				{
					user: acc,
					placedBid: transaction.placedBid,
					_addr: acc._addr,
					gas: transaction.gas,
					estimateGasOnly: true
				})
		}}
	/>

export const DepositEth = (props) =>
	<FormStepsWithDialog
		{...props}
		btnLabel="WALLET_DEPOSIT_ETH_TO_IDENTITY_BTN"
		saveBtnLabel='WALLET_DEPOSIT_ETH_TO_IDENTITY_SAVE_BTN'
		title="WALLET_DEPOSIT_ETH_TO_IDENTITY_TITLE"
		stepsId='depositToExchange'
		{...txCommon}
		stepsPages={[{ title: 'WALLET_DEPOSIT_ETH_TO_IDENTITY_STEP', page: DepositToExchange }]}
		saveFn={({ acc, transaction } = {}) => {
			return depositEthToIdentity({ user: acc, _addr: acc._addr, amountToDeposit: transaction.depositAmount, gas: transaction.gas })
		}}
		estimateGasFn={({ acc, transaction } = {}) => {
			return depositEthToIdentity({ user: acc, _addr: acc._addr, amountToDeposit: transaction.depositAmount, gas: transaction.gas })
		}}
	/>

export const DepositToken = (props) =>
	<FormStepsWithDialog
		{...props}
		btnLabel="WALLET_DEPOSIT_TO_IDENTITY_BTN"
		saveBtnLabel='WALLET_DEPOSIT_TO_IDENTITY_SAVE_BTN'
		title="WALLET_DEPOSIT_TO_IDENTITY_TITLE"
		stepsId='depositToIdentity'
		{...txCommon}
		stepsPages={[{ title: 'WALLET_DEPOSIT_TO_IDENTITY_STEP', page: DepositToExchange }]}
		previewWarnMsgs={[{ msg: 'WALLET_DEPOSIT_TO_IDENTITY_MULTIPLE_SIGNS_MSG' }]}
		saveFn={({ acc, transaction } = {}) => {
			return depositToIdentity({ user: acc, _addr: acc._addr, amountToDeposit: transaction.depositAmount, gas: transaction.gas })
		}}
		estimateGasFn={({ acc, transaction } = {}) => {
			return depositToIdentityEG({ user: acc, _addr: acc._addr, amountToDeposit: transaction.depositAmount, gas: transaction.gas })
		}}
	/>

export const WithdrawEthFromIdentity = (props) =>
	<FormStepsWithDialog
		{...props}
		btnLabel="ACCOUNT_WITHDRAW_FROM_EXCHANGE_BTN"
		saveBtnLabel='ACCOUNT_WITHDRAW_FROM_EXCHANGE_SAVE_BTN'
		title="ACCOUNT_WITHDRAW_FROM_EXCHANGE_TITLE"
		stepsId='withdrawFromExchange'
		{...txCommon}
		stepsPages={[{ title: 'ACCOUNT_WITHDRAW_FROM_EXCHANGE_STEP', page: WithdrawFromExchangePage }]}
		saveFn={({ acc, transaction } = {}) => {
			return withdrawEthFromIdentity({ _addr: acc._addr, amountToWithdraw: transaction.withdrawAmount, gas: transaction.gas, user: acc, })
		}}
		estimateGasFn={({ acc, transaction } = {}) => {
			return withdrawEthFromIdentity({ _addr: acc._addr, amountToWithdraw: transaction.withdrawAmount, gas: transaction.gas, user: acc, estimateGasOnly: true })
		}}
	/>

export const WithdrawTokenFromIdentity = (props) =>
	<FormStepsWithDialog
		{...props}
		btnLabel="ACCOUNT_WITHDRAW_FROM_EXCHANGE_BTN"
		saveBtnLabel='ACCOUNT_WITHDRAW_FROM_EXCHANGE_SAVE_BTN'
		title="ACCOUNT_WITHDRAW_FROM_EXCHANGE_TITLE"
		stepsId='withdrawFromExchange'
		{...txCommon}
		stepsPages={[{ title: 'ACCOUNT_WITHDRAW_FROM_EXCHANGE_STEP', page: WithdrawFromExchangePage }]}
		saveFn={({ acc, transaction } = {}) => {
			return withdrawTokensFromIdentity({ _addr: acc._addr, amountToWithdraw: transaction.withdrawAmount, gas: transaction.gas, user: acc, })
		}}
		estimateGasFn={({ acc, transaction } = {}) => {
			return withdrawTokensFromIdentity({ _addr: acc._addr, amountToWithdraw: transaction.withdrawAmount, gas: transaction.gas, user: acc, estimateGasOnly: true })
		}}
	/>