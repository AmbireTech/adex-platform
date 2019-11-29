import { createSelectorCreator, defaultMemoize } from 'reselect'
import isEqual from 'lodash.isequal'

// deep equal memoization instad reference check
export const createDeepEqualSelector = createSelectorCreator(
	defaultMemoize,
	isEqual
)
