import { updateSpinner } from './uiActions'
import { validEthAddress } from '../helpers/validators'

export function validateAddress({ addr, dirty, txId, validate, name }) {
	return async function (dispatch) {
		try {
			// TODO: make the updateSpinner use some string and not txId
			if(validate) validate(name, { isValid: false})
			updateSpinner(txId, dirty)(dispatch)
			const { msg } = await validEthAddress({ addr, nonZeroAddr: true, nonERC20: true })
			const isValid = !msg
			updateSpinner(txId, false)(dispatch)
			if(validate) validate(name, { isValid: isValid, err: { msg: msg }, dirty: dirty})
		} catch (error) {
			console.log(error);
			// TODO: add toast for the error
		}
	}
}
