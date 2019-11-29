import Loop from './loop'
import { execute, updateAccountStats } from 'actions'

const LOOP_TIMEOUT = 30 * 1000

const accountStatsLoop = new Loop({
	timeout: LOOP_TIMEOUT,
	syncAction: () => execute(updateAccountStats()),
	loopName: '_ACCOUNTS_STATS',
})

export default accountStatsLoop
