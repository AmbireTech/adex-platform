import React, { Fragment, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Snackbar, IconButton } from '@material-ui/core'
import { Close } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'
import { selectToasts, selectWindowReloading } from 'selectors'
import { execute, removeToast } from 'actions'

const typeToSeverity = {
	accept: 'success',
	success: 'success',
	warning: 'warning',
	info: 'info',
	cancel: 'error',
	error: 'error',
}

export const Toast = props => {
	const [active, setActive] = useState(false)
	const [toast, setToast] = useState({})

	const toasts = useSelector(selectToasts)
	const isReloading = useSelector(selectWindowReloading)

	useEffect(() => {
		const nextToast = toasts[0]

		if (!nextToast || isReloading) {
			setActive(false)
			setToast({})
		} else if (nextToast.id !== toast.id) {
			setActive(true)
			setToast(nextToast)
		}
	}, [isReloading, toast.id, toasts])

	const anchorOrigin = toast.anchorOrigin || {
		vertical: 'bottom',
		horizontal: 'center',
	}

	if (toast.top) {
		anchorOrigin.horizontal = 'center'
		anchorOrigin.vertical = 'top'
	}

	const close = id => {
		setActive(false)
		setTimeout(() => execute(removeToast(id)), 100)
	}

	return toast ? (
		<Snackbar
			open={active}
			autoHideDuration={toast.timeout || 0}
			onClose={() => !toast.unclosable && close(toast.id)}
			anchorOrigin={anchorOrigin}
		>
			<Alert
				severity={typeToSeverity[toast.type]}
				variant='filled'
				action={
					<Fragment>
						{toast.action && toast.action}
						{!toast.unclosable && (
							<IconButton
								key={`close-${toast.id}`}
								aria-label='Close'
								color='inherit'
								size='small'
								onClick={() => !toast.unclosable && close(toast.id)}
							>
								<Close />
							</IconButton>
						)}
					</Fragment>
				}
			>
				{(toast.label || '').toString()}
			</Alert>
		</Snackbar>
	) : null
}

export default Toast
