import { updateSpinner } from './uiActions'
import { validEthAddress } from '../helpers/validators'
import { translate } from 'services/translations/translations'
import { addToast } from './uiActions'

export function validateAddress({ addr, dirty, validate, name }) {
	return async function(dispatch, getState) {
		const { authType } = getState().persist.account.wallet
		try {
			if (validate) validate(name, { isValid: false })
			updateSpinner(name, dirty)(dispatch)
			const { msg } = await validEthAddress({
				addr,
				nonZeroAddr: true,
				nonERC20: true,
				authType,
			})
			const isValid = !msg
			updateSpinner(name, false)(dispatch)
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
	}
}
