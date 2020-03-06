export default class Looper {
	constructor({ timeout, syncAction, loopName = '', stopOn }) {
		if (!timeout) {
			throw new Error('LOOPER timeout prop is required')
		}

		if (typeof syncAction !== 'function') {
			throw new Error('LOOPER syncAction prop is has to be a function')
		}

		this.loopTimeout = null
		this.timeout = timeout
		this.syncAction = syncAction
		this.loopName = loopName
		this.stopOn = stopOn
	}

	clearLoopTimeout = () => {
		if (this.loopTimeout) {
			clearTimeout(this.loopTimeout)
			this.loopTimeout = null
		}
	}

	syncData = async opts => {
		this.makeStopCheck()
		await this.syncAction()
		this.makeStopCheck()
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

	makeStopCheck = () => {
		if (typeof this.stopOn === 'function' && this.stopOn()) {
			this.stop()
		}
	}

	start = async () => {
		this.clearLoopTimeout()
		await this.startLoop()
		this.makeStopCheck()
	}

	stop = () => {
		this.clearLoopTimeout()
	}
}
