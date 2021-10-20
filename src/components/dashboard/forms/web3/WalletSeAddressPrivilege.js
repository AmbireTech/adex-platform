import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import {
	Box,
	TextField,
	FormControlLabel,
	FormControl,
	Checkbox,
	Typography,
} from '@material-ui/core'
import Dropdown from 'components/common/dropdown'
import {
	ContentBox,
	ContentBody,
	FullContentMessage,
} from 'components/common/dialog/content'
import { constants } from 'adex-models'
import {
	t,
	selectValidationsById,
	selectNewTransactionById,
	selectWeb3SyncSpinnerByValidateId,
	selectFeeTokensBalance,
} from 'selectors'
import { execute, updateNewTransaction } from 'actions'
import { Alert } from '@material-ui/lab'

const { IdentityPrivilegeLevel } = constants

const PRIV_LEVELS_SRC = Object.values(IdentityPrivilegeLevel).map(value => {
	return {
		value,
		label: t(`PRIV_${value}_LABEL`),
		info: t(`PRIV_${value}_INFO`),
	}
})

function WalletSeAddressPrivilege({ stepsId, validateId } = {}) {
	const {
		setAddr,
		privLevel,
		warningAccepted,
		warningMsg,
	} = useSelector(state => selectNewTransactionById(state, stepsId))

	const {
		setAddr: errAddr,
		setAddrWarning: warning,
		privLevel: errPrivLvl,
		fees: errFees,
	} = useSelector(state => selectValidationsById(state, validateId) || {})

	const syncSpinner = useSelector(state =>
		selectWeb3SyncSpinnerByValidateId(state, validateId)
	)

	const feeTokensNew = useSelector(selectFeeTokensBalance)

	return (
		<ContentBox>
			{syncSpinner ? (
				<FullContentMessage
					msgs={[{ message: 'SYNC_DATA_MSG' }]}
					spinner={true}
				></FullContentMessage>
			) : (
				<ContentBody>
					<Box mb={2}>
						<Typography variant='subtitle1' display='block'>
							{t('SET_IDENTITY_PRIVILEGE_MAIN_INFO') + 'TEST'}:
						</Typography>
					</Box>
					<Box mb={2}>
						<TextField
							type='text'
							variant='outlined'
							required
							fullWidth
							label={t('ADDR_TO_SET_PRIV_LEVEL')}
							name='setAddr'
							value={setAddr || ''}
							onChange={ev =>
								execute(
									updateNewTransaction({
										tx: stepsId,
										key: 'setAddr',
										value: (ev.target.value || '').trim(),
									})
								)
							}
							error={errAddr && !!errAddr.dirty}
							helperText={errAddr && !!errAddr.dirty ? errAddr.errMsg : ''}
						/>
					</Box>
					<Box mb={2}>
						<Dropdown
							required
							variant='outlined'
							label={t('SELECT_PRIV_LEVEL')}
							// helperText={t('SELECT_PRIV_LEVEL_HELPER_TXT')}
							onChange={val =>
								execute(
									updateNewTransaction({
										tx: stepsId,
										key: 'privLevel',
										value: val,
									})
								)
							}
							source={PRIV_LEVELS_SRC}
							value={typeof privLevel === 'number' ? privLevel : ''}
							htmlId='label-privLevel'
							fullWidth
							error={errPrivLvl && !!errPrivLvl.dirty}
							helperText={
								errPrivLvl && !!errPrivLvl.dirty
									? errPrivLvl.errMsg
									: t('SELECT_PRIV_LEVEL_HELPER_TXT')
							}
						/>
					</Box>
					<Box mb={2}>
						<Dropdown
							required
							variant='outlined'
							// TODO: Add missing translations
							label={t('SELECT_FEE_TOKEN_LABEL')}
							// helperText={t('SELECT_PRIV_LEVEL_HELPER_TXT')}
							onChange={val =>
								execute(
									updateNewTransaction({
										tx: stepsId,
										key: 'feeTokenAddr',
										value: val,
									})
								)
							}
							source={feeTokensNew}
							value={feeTokensNew[0]}
							htmlId='label-privLevel'
							fullWidth
							error={errPrivLvl && !!errPrivLvl.dirty}
							helperText={
								errPrivLvl && !!errPrivLvl.dirty
									? errPrivLvl.errMsg
									: t('SELECT_PRIV_LEVEL_HELPER_TXT')
							}
						/>
					</Box>
					<Box mb={2}>
						<Typography variant='caption' display='block' gutterBottom>
							{t('PRIV_LEVEL_INFO_LABEL')}:
						</Typography>
						{PRIV_LEVELS_SRC.map(x => (
							<Typography
								key={x.value}
								variant='caption'
								display='block'
								gutterBottom
							>
								<strong>{x.label}:</strong> {x.info}
							</Typography>
						))}
						<Typography variant='caption' display='block' gutterBottom>
							* {t('PRIV_LEVEL_INFO')}
						</Typography>
					</Box>
					{(warning || warningAccepted || warningMsg) && (
						<Box mb={2}>
							<FormControl
								error={warning && warning.dirty}
								component='fieldset'
							>
								<FormControlLabel
									control={
										<Checkbox
											checked={!!warningAccepted}
											onChange={ev =>
												execute(
													updateNewTransaction({
														tx: stepsId,
														key: 'warningAccepted',
														value: ev.target.checked,
													})
												)
											}
											value='warningAccepted'
											color='primary'
										/>
									}
									label={t((warning || {}).errMsg || warningMsg)}
								/>
							</FormControl>
						</Box>
					)}
					{errFees && errFees.dirty && errFees.errMsg && (
						<Alert variant='filled' severity='error'>
							{errFees.errMsg}
						</Alert>
					)}
				</ContentBody>
			)}
		</ContentBox>
	)
}

WalletSeAddressPrivilege.propTypes = {
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	validateId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
		.isRequired,
}

export default WalletSeAddressPrivilege
