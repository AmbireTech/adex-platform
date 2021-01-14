import { createCachedSelector } from 're-reselect'

export const selectIdentity = state => state.memory.identity

export const selectEnsAddresses = state => state.persist.ensAddresses

export const selectEnsAddressByAddr = createCachedSelector(
	selectEnsAddresses,
	(_, address) => address,
	(ensAddresses, address) => ensAddresses[address] || ''
)((_state, address) => address)
