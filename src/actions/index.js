import * as common from './common'
import * as projectActions from './projectActions'
import * as uiActions from './uiActions'
import * as validationActions from './validationActions'
import * as mediaValidations from './mediaValidations'
import * as itemActions from './itemActions'
import * as accountActions from './accountActions'
import * as identityActions from './identityActions'
import * as bidActions from './bidActions'
import * as transactionActions from './transactionActions'
import * as analyticsActions from './analyticsActions'
import * as newItemsActions from './newItemsActions'
import * as audienceActions from './audienceActions'
import * as campaignActions from './campaignActions'
import * as slotActions from './slotActions'
import * as unitActions from './unitActions'
import * as walletActions from './wallet/walletActions'

// keep it for class components that use connect and actions prop
// without needing to change the code
export default {
	...common,
	...projectActions,
	...uiActions,
	...validationActions,
	...mediaValidations,
	...itemActions,
	...accountActions,
	...identityActions,
	...bidActions,
	...transactionActions,
	...analyticsActions,
	...newItemsActions,
	...audienceActions,
	...campaignActions,
	...slotActions,
	...unitActions,
	...walletActions,
}

// used for minimal deps in hook components
// import { execute, addTost } from 'actions'
// execute(addTost())
export * from './common'
export * from './projectActions'
export * from './validationActions'
export * from './mediaValidations'
export * from './uiActions'
export * from './itemActions'
export * from './accountActions'
export * from './identityActions'
export * from './bidActions'
export * from './transactionActions'
export * from './analyticsActions'
export * from './newItemsActions'
export * from './audienceActions'
export * from './campaignActions'
export * from './slotActions'
export * from './unitActions'
export * from './wallet/walletActions'
