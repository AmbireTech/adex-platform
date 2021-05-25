import dateUtils from 'helpers/dateUtils'
import { createSelector } from 'reselect'
import { createDeepEqualSelector } from 'selectors'
import { utils } from 'ethers'

export const selectAccountRaw = state => state.persist.account || {}
export const selectChannels = state => state.memory.channels

export const selectMemoryUi = state => state.memory.uiMemory

export const selectDebugIdentity = createSelector(
	selectMemoryUi,
	({ debugIdentityAddr, debuggerAddr }) => ({
		debugIdentityAddr,
		debuggerAddr,
	})
)

export const selectDebugAccount = createSelector(
	selectDebugIdentity,
	({ debugIdentityAddr, debuggerAddr }) => {
		// TODO: utils.address
		if (debugIdentityAddr) {
			const address = utils.getAddress(debugIdentityAddr)
			const debuggerPrivAddr = utils.getAddress(
				debuggerAddr || debugIdentityAddr
			)
			return {
				address,
				currentPrivileges: {
					[debuggerPrivAddr]: 2,
					[debuggerPrivAddr.toLowerCase()]: 2,
				},
			}
		} else {
			return null
		}
	}
)

export const selectAccount = createSelector(
	[selectAccountRaw, selectDebugAccount],
	(account, debugData) => {
		if (debugData) {
			const debugAccount = {
				...account,
				identity: {
					...(account.identity || {}),
					...debugData,
					relayerData: {
						...((account.identity || {}).relayerData || {}),
						currentPrivileges: debugData.currentPrivileges,
					},
				},
			}

			return debugAccount
		}

		return account
	}
)

export const selectAuth = createSelector(
	selectAccount,
	({ wallet, identity }) =>
		!!wallet &&
		!!wallet.address &&
		!!wallet.authSig &&
		!!wallet.authType &&
		!!identity.address
)

export const selectWallet = createDeepEqualSelector(
	selectAccount,
	({ wallet }) => wallet || {}
)

export const selectEmail = createSelector(selectAccount, ({ email }) => email)

export const selectEmailProvider = createSelector(selectEmail, email =>
	!!email ? email.split('@')[1] : null
)

export const selectAuthSig = createSelector(
	selectWallet,
	({ authSig }) => authSig
)

export const selectWalletAddress = createSelector(
	selectWallet,
	({ address }) => address
)

export const selectAuthType = createSelector(
	selectWallet,
	({ authType }) => authType
)

export const selectAccountIdentity = createSelector(
	selectAccount,
	({ identity }) => identity || {}
	// ({ identity }) => ({
	// 	...(identity || {}),
	// 	address: '0x3cB8E4Bf87a5E06F6b6B722FB3535020d5fd63f1',
	// 	currentPrivileges: {
	// 		'0x2aecF52ABe359820c48986046959B4136AfDfbe2': 2,
	// 		['0x2aecF52ABe359820c48986046959B4136AfDfbe2'.toLowerCase()]: 2,
	// 	},
	// 	relayerData: {
	// 		...((identity || {}).relayerData || {}),
	// 		currentPrivileges: {
	// 			'0x2aecF52ABe359820c48986046959B4136AfDfbe2': 2,
	// 			['0x2aecF52ABe359820c48986046959B4136AfDfbe2'.toLowerCase()]: 2,
	// 		},
	// 	},
	// })
)

export const selectAccountIdentityAddr = createSelector(
	selectAccountIdentity,
	({ address }) => address
)

export const selectAccountStats = createSelector(
	selectAccount,
	({ stats }) => stats || {}
)

export const selectAccountSettings = createSelector(
	selectAccount,
	({ settings }) => settings || {}
)

export const selectAccountStatsRaw = createSelector(
	selectAccountStats,
	({ raw }) => raw || {}
)

export const selectAccountStatsFormatted = createSelector(
	selectAccountStats,
	({ formatted }) => formatted || {}
)

export const selectAccountIdentityRoutineAuthTuple = createSelector(
	selectAccountIdentity,
	({ relayerData }) =>
		relayerData &&
		relayerData.routineAuthorizationsData &&
		relayerData.routineAuthorizationsData[0]
			? relayerData.routineAuthorizationsData[0]
			: null
)

export const selectAccountIdentityDeployData = createSelector(
	selectAccountIdentity,
	({ relayerData = {} }) => relayerData.deployData || {}
)

export const selectChannelsWithUserBalancesEligible = createSelector(
	selectChannels,
	({ withOutstandingBalance }) => [...(withOutstandingBalance || [])]
)

export const selectChannelsWithUserBalancesAll = createSelector(
	selectChannels,
	({ withBalanceAll }) => ({ ...(withBalanceAll || {}) })
)

export const selectAccountIdentityCurrentPrivileges = createSelector(
	selectAccountIdentity,
	({ relayerData: { currentPrivileges } = {} }) => currentPrivileges || {}
)

export const selectWalletPrivileges = createSelector(
	[selectAccountIdentityCurrentPrivileges, selectWalletAddress],
	(privileges = {}, address) => privileges[address] || 0
)

export const selectAccountIdentityCreatedDate = createSelector(
	selectAccountIdentityDeployData,
	({ created }) => dateUtils.date(created || '2018-10-01')
)
