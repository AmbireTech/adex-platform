import Loop from './loop'
import { execute, updateAccountStats } from 'actions'

const LOOP_TIMEOUT = 60 * 1000

const accountStatsLoop = new Loop({
	timeout: LOOP_TIMEOUT,
	syncAction: async () => await execute(updateAccountStats()),
	loopName: '_ACCOUNTS_STATS',
})

export default accountStatsLoop
