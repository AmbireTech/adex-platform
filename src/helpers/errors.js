export const getErrorMsg = err => {
	if (!err) {
		return ''
	} else if (typeof err === 'object') {
		return err.msg || err.message || err.errMsg || err.error
	} else if (Array.isArray(err)) {
		return err.join(', ')
	} else {
		return err
	}
}
