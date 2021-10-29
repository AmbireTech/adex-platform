import * as common from './common'
import * as uiActions from './uiActions'
import * as validationActions from './validationActions'
import * as accountActions from './accountActions'
import * as identityActions from './identityActions'
import * as transactionActions from './transactionActions'
import * as tradeActions from './tradeActions'
import * as diversifyActions from './diversifyActions'
import * as withdrawActions from './withdrawActions'
import * as privilegesActions from './privilegesActions'

// keep it for class components that use connect and actions prop
// without needing to change the code
export default {
	...common,
	...uiActions,
	...validationActions,
	...accountActions,
	...identityActions,
	...transactionActions,
	...tradeActions,
	...diversifyActions,
	...withdrawActions,
	...privilegesActions,
}

// used for minimal deps in hook components
// import { execute, addTost } from 'actions'
// execute(addTost())
export * from './common'
export * from './uiActions'
export * from './validationActions'
export * from './accountActions'
export * from './identityActions'
export * from './transactionActions'
export * from './tradeActions'
export * from './diversifyActions'
export * from './withdrawActions'
export * from './privilegesActions'
