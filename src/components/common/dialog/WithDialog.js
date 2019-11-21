import React, { Fragment, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Fab from '@material-ui/core/Fab'
import IconButton from '@material-ui/core/IconButton'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import classnames from 'classnames'
import Slide from '@material-ui/core/Slide'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import CancelIcon from '@material-ui/icons/Cancel'
import DialogActions from '@material-ui/core/DialogActions'
import Typography from '@material-ui/core/Typography'
import { t } from 'selectors'

const textBtn = ({ label, className, classes, style, onClick, ...rest }) => {
	return (
		<span
			className={classnames(classes.textBtn, className)}
			style={style}
			onClick={onClick}
		>
			{' '}
			{label}{' '}
		</span>
	)
}

const TextBtn = withStyles(styles)(textBtn)

const Transition = props => {
	return <Slide direction='up' {...props} />
}

const useStyles = makeStyles(styles)

export default function ItemHoc(Decorated) {
	function WithDialog(props) {
		const {
			iconButton,
			textButton,
			fabButton,
			variant,
			fabVariant,
			color,
			size,
			mini,
			btnLabelArgs,
			btnLabel,
			disabled,
			className,
			icon,
			title,
			dialogActions,
			onClick,
			fullWidth,
			...rest
		} = props

		const btnProps = {
			color,
			size,
			mini,
			variant,
			fullWidth,
		}

		const classes = useStyles()
		const [open, setOpen] = useState(false)

		const handleToggle = async () => {
			const { onBeforeOpen } = props
			if (typeof onBeforeOpen === 'function' && !open) {
				await onBeforeOpen()
			}

			setOpen(!open)
		}

		const closeDialog = () => {
			setOpen(false)
		}

		let ButtonComponent = Button

		if (iconButton) {
			ButtonComponent = IconButton
		} else if (textButton) {
			ButtonComponent = TextBtn
		} else if (fabButton) {
			ButtonComponent = Fab
		}

		const btnLabelTranslated = t(btnLabel, { args: btnLabelArgs || [''] })

		return (
			<Fragment>
				<ButtonComponent
					disabled={disabled}
					aria-label={btnLabelTranslated}
					label={btnLabelTranslated}
					onClick={() => {
						handleToggle()
						if (onClick) onClick()
					}}
					{...btnProps}
					className={classnames(
						className,
						{ [classes.floating]: !!fabButton },
						{ [classes.first]: color === 'first' },
						{ [classes.second]: color === 'second' }
					)}
				>
					{icon}
					{!iconButton && btnLabelTranslated}
				</ButtonComponent>
				<Dialog
					// disableBackdropClick
					// disableEscapeKeyDown
					// maxWidth="xs"
					// fullScreen
					open={open}
					onClose={handleToggle}
					TransitionComponent={Transition}
					classes={{ paper: classes.dialog }}
					// onEscKeyDown={handleToggle}
					// onOverlayClick={handleToggle}
				>
					<DialogTitle disableTypography>
						<Typography
							variant='subtitle1'
							classes={{
								root: classnames(classes.dialogTitle, classes.breakLong),
							}}
						>
							{t(title)}
							<IconButton onClick={handleToggle}>
								<CancelIcon />
							</IconButton>
						</Typography>
					</DialogTitle>
					<DialogContent classes={{ root: classes.content }}>
						<Decorated {...rest} closeDialog={closeDialog} />
					</DialogContent>
					{dialogActions && <DialogActions>{dialogActions}</DialogActions>}
				</Dialog>
			</Fragment>
		)
	}

	WithDialog.propTypes = {
		btnLabel: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		floating: PropTypes.bool,
		onBeforeOpen: PropTypes.func,
	}

	return WithDialog
}
