import { selectIdentityUi } from 'reselect'
import { createSelector } from 'reselect'

export const selectBtcToMainTokenSwapTxns = createSelector(
	selectIdentityUi,
	({ btcToMainTokenSwapTxns }) => btcToMainTokenSwapTxns | {}
)
