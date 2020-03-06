import Loop from './loop'
import { getState } from 'store'
import { selectAuth } from 'selectors'
import { execute, updateAccountStats } from 'actions'

const LOOP_TIMEOUT = 10 * 1000

const accountStatsLoop = new Loop({
	timeout: LOOP_TIMEOUT,
	syncAction: async () =>
		selectAuth(getState()) && (await execute(updateAccountStats())),
	loopName: '_ACCOUNTS_STATS',
	stopOn: () => !selectAuth(getState()),
})

export default accountStatsLoop
