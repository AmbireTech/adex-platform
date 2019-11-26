import React from 'react'
import ListItemText from '@material-ui/core/ListItemText'
import { PropRow } from 'components/common/dialog/content'
import { constants } from 'adex-models'

const privilegesNames = constants.valueToKey(constants.IdentityPrivilegeLevel)

export const IdentityWithdrawPreview = ({
	t,
	withdrawTo,
	classes,
	fees,
	withdrawAmount,
}) => (
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
					secondary={t('AMOUNT_WITHDRAW_INFO', {
						args: [fees.fees, 'SAI', fees.toGet, 'SAI'],
					})}
					primary={withdrawAmount + ' SAI'}
				/>
			}
		/>
	</div>
)

export const SetPrivilegePreview = ({
	t,
	setAddr,
	classes,
	fees,
	privLevel,
}) => (
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
					secondary={t('PRIV_LEVEL_INFO_AND_FEES', {
						args: [fees.fees, 'SAI'],
					})}
					primary={privilegesNames[privLevel]}
				/>
			}
		/>
	</div>
)
