import { createHashHistory } from 'history'
import ReactGA from 'react-ga'

const history = createHashHistory()

ReactGA.initialize('UA-100388362-3')
history.listen(location => {
	ReactGA.pageview(
		location.pathname + location.search
		// { debug: true }
	)
})

export default history
