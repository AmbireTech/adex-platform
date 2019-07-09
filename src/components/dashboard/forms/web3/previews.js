import React from 'react'
import ListItemText from '@material-ui/core/ListItemText'
import { PropRow } from 'components/common/dialog/content'

export const IdentityWithdrawPreview = ({ t, withdrawTo, classes, fees, withdrawAmount }) =>
	<div>
		<PropRow
			key='withdrawTo'
			left={t('withdrawTo', { isProp: true })}
			right={(withdrawTo || '').toString()}
		/>
		<PropRow
			key='withdrawAmount'
			left={t('withdrawAmount', { isProp: true })}
			right={
				<ListItemText
					className={classes.address}
					secondary={t('AMOUNT_WITHDRAW_INFO', { args: [fees.fees, 'DAI', fees.toGet, 'DAI'] })}
					primary={withdrawAmount + ' DAI'}
				/>
			}
		/>
	</div>

export const SetPrivilegePreview = ({ t, setAddr, classes, fees, privLevel }) =>
	<div>
		<PropRow
			key='setAddr'
			left={t('setAddr', { isProp: true })}
			right={(setAddr || '').toString()}
		/>
		<PropRow
			key='privLevel'
			left={t('privLevel', { isProp: true })}
			right={
				<ListItemText
					className={classes.address}
					secondary={t('PRIV_LEVEL_INFO_AND_FEES', { args: [fees.fees, 'DAI'] })}
					primary={privLevel}
				/>
			}
		/>
	</div>