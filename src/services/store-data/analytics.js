import { execute, updateAccountAnalytics } from 'actions'

const LOOP_TIMEOUT = 120 * 1000

let loopTimeout = null

const clearLoopTimeout = () => {
	if (loopTimeout) {
		clearTimeout(loopTimeout)
		loopTimeout = null
	}
}

const syncData = async opts => {
	await execute(updateAccountAnalytics(opts))
}

const startLoop = async opts => {
	try {
		await syncData(opts)
		checkLoop()
	} catch (err) {
		console.error('ERRO_SYNC_ANALYTICS', err)
		checkLoop()
	}
}

const checkLoop = () => {
	clearLoopTimeout()

	loopTimeout = setTimeout(startLoop, LOOP_TIMEOUT)
}

const start = () => {
	clearLoopTimeout()
	startLoop()
}

const stop = () => {
	clearLoopTimeout()
}

export default {
	start,
	stop,
}
