import Loop from './loop'
import { execute, updateAccountAnalytics } from 'actions'

const LOOP_TIMEOUT = 120 * 1000

const analyticsLoop = new Loop({
	timeout: LOOP_TIMEOUT,
	syncAction: () => execute(updateAccountAnalytics()),
	loopName: '_ANALYTICS',
})

export default analyticsLoop
