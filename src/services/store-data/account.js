import { execute, updateAccountStats } from 'actions'

const LOOP_TIMEOUT = 30 * 1000

let statsCheckTimeout = null

const clearAccountStatsTimeout = () => {
	if (statsCheckTimeout) {
		clearTimeout(statsCheckTimeout)
		statsCheckTimeout = null
	}
}

const syncStats = async () => {
	execute(updateAccountStats())
}

const checkStats = () => {
	syncStats()
		.then(() => {
			checkStatsLoop()
		})
		.catch(() => {
			checkStatsLoop()
		})
}

const checkStatsLoop = () => {
	clearAccountStatsTimeout()

	statsCheckTimeout = setTimeout(checkStats, LOOP_TIMEOUT)
}

const start = () => {
	clearAccountStatsTimeout()
	checkStats()
}

const stop = () => {
	clearAccountStatsTimeout()
}

export default {
	start,
	stop,
}
