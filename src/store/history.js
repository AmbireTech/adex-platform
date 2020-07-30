import { createHashHistory } from 'history'

const history = createHashHistory()

history.listen(location => {
	window.gtag &&
		window.gtag('event', 'page_view', {
			page_path: location.pathname + location.search,
		})
})

export default history
