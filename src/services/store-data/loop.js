export default class Looper {
	constructor({ timeout, syncAction, loopName = '' }) {
		if (!timeout) {
			throw new Error('LOOPER timeout prop is required')
		}

		if (typeof syncAction !== 'function') {
			throw new Error('LOOPER syncAction prop is has to be a function')
		}

		this.loopTimeout = null
		this.timeout = timeout
		this.syncAction = syncAction
	}

	clearLoopTimeout = () => {
		if (this.loopTimeout) {
			clearTimeout(this.loopTimeout)
			this.loopTimeout = null
		}
	}

	syncData = async opts => {
		await this.syncAction()
	}

	startLoop = async opts => {
		try {
			await this.syncData(opts)
			this.checkLoop()
		} catch (err) {
			console.error(`ERR_LOOP${this.loopName}`, err)
			this.checkLoop()
		}
	}

	checkLoop = () => {
		this.clearLoopTimeout()

		this.loopTimeout = setTimeout(this.startLoop, this.timeout)
	}

	start = () => {
		this.clearLoopTimeout()
		this.startLoop()
	}

	stop = () => {
		this.clearLoopTimeout()
	}
}
