import { createHashHistory } from 'history'
import ReactGA from 'react-ga'

const trackPageView = location => {
	ReactGA.set({ page: location.pathname + location.search })
	ReactGA.pageview(location.pathname + location.search)
}

const initGa = history => {
	ReactGA.initialize(process.env.GA_CODE, {
		// debug: true,
	})
	trackPageView(history.location)
	history.listen(trackPageView)
}
const history = createHashHistory()
initGa(history)

export default history
