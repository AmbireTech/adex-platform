import * as common from './common'
import * as itemActions from './itemActions'
import * as uiActions from './uiActions'
import * as accountActions from './accountActions'
import * as identityActions from './identityActions'
import * as bidActions from './bidActions'
import * as transactionActions from './transactionActions'
import * as validationActions from './validationActions'

// keep it for class components that use connect and actions prop
// without needing to change the code
export default {
	...common,
	...itemActions,
	...uiActions,
	...accountActions,
	...identityActions,
	...bidActions,
	...transactionActions,
	...validationActions,
}

// used for minimal deps in hook components
// import { execute, addTost } from 'actions'
// execute(addTost())
export * from './common'
export * from './itemActions'
export * from './uiActions'
export * from './accountActions'
export * from './identityActions'
export * from './bidActions'
export * from './transactionActions'
