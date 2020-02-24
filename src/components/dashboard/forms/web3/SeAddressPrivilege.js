import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Dropdown from 'components/common/dropdown'
import Typography from '@material-ui/core/Typography'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import Checkbox from '@material-ui/core/Checkbox'
import { constants } from 'adex-models'
import { t, selectValidationsById, selectNewTransactionById } from 'selectors'
import { execute, updateNewTransaction } from 'actions'

const { IdentityPrivilegeLevel } = constants

const PRIV_LEVELS_SRC = Object.values(IdentityPrivilegeLevel).map(value => {
	return {
		value,
		label: t(`PRIV_${value}_LABEL`),
		info: t(`PRIV_${value}_INFO`),
	}
})

function SeAddressPrivilege({ stepsId, validateId } = {}) {
	const { setAddr, privLevel, warningAccepted, warningMsg } = useSelector(
		state => selectNewTransactionById(state, stepsId)
	)

	const {
		setAddr: errAddr,
		setAddrWarning: warning,
		privLevel: errPrivLvl,
	} = useSelector(state => selectValidationsById(state, validateId) || {})

	return (
		<div>
			<div> {t('SET_IDENTITY_PRIVILEGE_MAIN_INFO')}</div>
			<TextField
				type='text'
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
							value: ev.target.value,
						})
					)
				}
				error={errAddr && !!errAddr.dirty}
				helperText={errAddr && !!errAddr.dirty ? errAddr.errMsg : ''}
			/>
			<Dropdown
				required
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
			<Box marginTop={2}>
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
				<FormControl error={warning && warning.dirty} component='fieldset'>
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
			)}
		</div>
	)
}

SeAddressPrivilege.propTypes = {
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	validateId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
		.isRequired,
}

export default SeAddressPrivilege
