import * as common from './common'
import * as itemActions from './itemActions'
import * as uiActions from './uiActions'
import * as accountActions from './accountActions'
import * as identityActions from './identityActions'
import * as bidActions from './bidActions'
import * as transactionActions from './transactionActions'

export default {
	...common,
	...itemActions,
	...uiActions,
	...accountActions,
	...identityActions,
	...bidActions,
	...transactionActions,
}
