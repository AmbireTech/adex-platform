import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectConfirm } from 'selectors'

import {
	Dialog,
	Button,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@material-ui/core'

export function Confirm({ children }) {
	const [open, setOpen] = useState(false)

	const {
		onConfirm,
		onCancel,
		active,
		calledOn,
		noActionBtns,
		data: { title = '', text = '', confirmLabel, cancelLabel },
		keepOpenOnAction = false,
	} = useSelector(selectConfirm)

	useEffect(() => {
		setOpen(!!active)
	}, [active, calledOn])

	const confirm = () => {
		if (typeof onConfirm === 'function') {
			onConfirm()
		}
		if (!keepOpenOnAction) {
			setOpen(false)
		}
	}

	const cancel = () => {
		if (typeof onCancel === 'function') {
			onCancel()
		}

		if (!keepOpenOnAction) {
			setOpen(false)
		}
	}

	return (
		<Dialog open={open}>
			<DialogTitle id='alert-dialog-title'>{title}</DialogTitle>
			<DialogContent>
				<DialogContentText id='alert-dialog-description'>
					{text}
				</DialogContentText>
				{children}
			</DialogContent>
			{!noActionBtns && (
				<DialogActions>
					{cancelLabel && (
						<Button onClick={cancel} color='primary'>
							{cancelLabel}
						</Button>
					)}
					{confirmLabel && (
						<Button onClick={confirm} color='primary' autoFocus>
							{confirmLabel}
						</Button>
					)}
				</DialogActions>
			)}
		</Dialog>
	)
}

export default Confirm
