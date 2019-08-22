import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './components/App/App'
import { register } from './serviceWorker'

// Temp here?
Object.values = function* values(obj) {
	for (let prop of Object.keys(obj)) {
		yield obj[prop]
	}
}

ReactDOM.render(<App />, document.getElementById('root'))

register()
