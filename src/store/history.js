import { createHashHistory } from 'history'

const history = createHashHistory()

history.listen(location => {
	window.gtag &&
		window.gtag('config', process.env.GA_CODE, {
			page_path: location.pathname + location.search,
		})
})

export default history
