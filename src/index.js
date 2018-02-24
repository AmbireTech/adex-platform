import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App/App';
import registerServiceWorker from './registerServiceWorker';

// Temp here?
Object.values = function* values(obj) {
    for (let prop of Object.keys(obj)) {
        yield obj[prop]
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
