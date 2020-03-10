import { createHashHistory } from 'history'
import ReactGA from 'react-ga'

const history = createHashHistory()

ReactGA.initialize(process.env.GA_CODE)
history.listen(location => {
	ReactGA.pageview(
		location.pathname + location.search
		//{ debug: true }
	)
})

export default history
