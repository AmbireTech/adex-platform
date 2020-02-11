import { createSelector } from 'reselect'

export const selectIdentity = state => state.memory.identity

export const selectEnsAddresses = state => state.persist.ensAddresses

export const selectEnsAddressByAddr = createSelector(
	[selectEnsAddresses, (_, address) => address],
	(ensAddresses, address) => ensAddresses[address] || ''
)
