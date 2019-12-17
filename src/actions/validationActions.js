import { updateSpinner } from './uiActions'
import { validEthAddress } from '../helpers/validators'
import { translate } from 'services/translations/translations'
import { addToast } from './uiActions'
import { getERC20Balance } from 'services/smart-contracts/actions/erc20'
import { formatUnits, bigNumberify } from 'ethers/utils'

export function validateAddress({ addr, dirty, validate, name, setBalance }) {
	return async function(dispatch, getState) {
		const { wallet, identity } = getState().persist.account
		const { authType } = wallet
		try {
			if (validate) validate(name, { isValid: false })
			updateSpinner(name, dirty)(dispatch)
			const { msg } = await validEthAddress({
				addr,
				nonZeroAddr: true,
				nonERC20: !setBalance,
				authType,
			})
			const isValid = !msg

			if (typeof setBalance === 'function') {
				const balance =
					(await getERC20Balance({
						addr,
						authType,
						balanceFor: identity.address,
					})) || bigNumberify('0')
				setBalance(formatUnits(balance, 18))
			}
			if (validate)
				validate(name, { isValid: isValid, err: { msg: msg }, dirty: dirty })
		} catch (error) {
			console.error('ERR_VALIDATING_ETH_ADDRESS', error)
			addToast({
				type: 'cancel',
				label: translate('ERR_VALIDATING_ETH_ADDRESS', { args: [error] }),
				timeout: 20000,
			})(dispatch)
		}
		updateSpinner(name, false)(dispatch)
	}
}
