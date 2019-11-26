import Loop from './loop'
import { execute, updateAccountAnalytics } from 'actions'

const LOOP_TIMEOUT = 30 * 1000

const analyticsLoop = new Loop({
	timeout: LOOP_TIMEOUT,
	syncAction: () => execute(updateAccountAnalytics()),
})

export default analyticsLoop
