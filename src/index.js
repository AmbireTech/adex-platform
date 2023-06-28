import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './components/App/App'
import { unregister } from './serviceWorker'
import TagManager from 'react-gtm-module'

TagManager.initialize({
	gtmId: process.env.GA_CODE,
})

ReactDOM.render(<App />, document.getElementById('root'))

unregister()
