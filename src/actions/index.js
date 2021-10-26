import * as common from './common'
import * as projectActions from './projectActions'
import * as uiActions from './uiActions'
import * as validationActions from './validationActions'
import * as accountActions from './accountActions'
import * as identityActions from './identityActions'
import * as transactionActions from './transactionActions'
import * as walletActions from './wallet/walletActions'
import * as walletValidationsActions from './wallet/walletActions'

// keep it for class components that use connect and actions prop
// without needing to change the code
export default {
	...common,
	...projectActions,
	...uiActions,
	...validationActions,
	...accountActions,
	...identityActions,
	...transactionActions,
	...walletActions,
	...walletValidationsActions,
}

// used for minimal deps in hook components
// import { execute, addTost } from 'actions'
// execute(addTost())
export * from './common'
export * from './projectActions'
export * from './uiActions'
export * from './validationActions'
export * from './accountActions'
export * from './identityActions'
export * from './transactionActions'
export * from './wallet/walletActions'
export * from './walletValidationsActions'
