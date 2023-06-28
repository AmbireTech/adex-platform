import React, { Fragment, useState, forwardRef } from 'react'
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
import { selectLocation } from 'selectors'
import { useSelector } from 'react-redux'
// import ReactGA from 'react-ga'

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

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction='up' ref={ref} {...props} />
})

const eventMap = location => ({
	NEW_UNIT: {
		action: 'advertiser',
		category: 'add_unit',
		label: `units${location}`,
	},
	NEW_CAMPAIGN: {
		action: 'advertiser',
		category: 'add_campaign',
		label: `campaigns${location}`,
	},
	NEW_AUDIENCE: {
		action: 'advertiser',
		category: 'save_audience',
		label: `audiences${location}`,
	},
	NEW_CAMPAIGN_FROM_AUDIENCE: {
		action: 'advertiser',
		category: 'add_campaign',
		label: `audiences${location}`,
	},
	NEW_SLOT: {
		action: 'publisher',
		category: 'add_slot',
		label: `slots${location}`,
	},
	NEW_WEBSITE: {
		action: 'publisher',
		category: 'add_website',
		label: `websites${location}`,
	},
	ACCOUNT_WITHDRAW_FROM_IDENTITY_BTN: {
		action: 'account',
		category: 'withdraw',
		label: `account`,
	},
})

const useStyles = makeStyles(styles)

export default function WithDialogHoc(Decorated) {
	function WithDialog(props) {
		const {
			disableBackdropClick = false,
			forwardedRef,
			iconButton,
			textButton,
			fabButton,
			variant,
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
			onBeforeOpen,
			...rest
		} = props

		const btnProps = {
			color,
			size,
			variant,
		}

		const classes = useStyles()
		const [open, setOpen] = useState(false)
		const location = useSelector(selectLocation)

		const handleToggle = async () => {
			if (typeof onBeforeOpen === 'function' && !open) {
				await onBeforeOpen()
			}

			setOpen(!open)
		}

		const handleClick = async ev => {
			const locationWithDash = location.pathname.split('/').join('-')
			const eventMapFound = eventMap(locationWithDash)[btnLabel]
			if (eventMapFound) {
				// ReactGA.event(eventMapFound)
			}
			ev && ev.stopPropagation && ev.stopPropagation()
			ev && ev.preventDefault && ev.preventDefault()
			await handleToggle()
			if (onClick) await onClick()
		}

		const closeDialog = () => {
			setOpen(false)
		}

		let ButtonComponent = null

		if (iconButton) {
			ButtonComponent = IconButton
		} else if (textButton) {
			ButtonComponent = TextBtn
		} else if (fabButton) {
			ButtonComponent = Fab
		} else {
			ButtonComponent = Button
			btnProps.fullWidth = fullWidth
		}

		const btnLabelTranslated = btnLabel
			? t(btnLabel, { args: btnLabelArgs || [''] })
			: ''

		return (
			<Fragment>
				<ButtonComponent
					disabled={disabled}
					aria-label={btnLabelTranslated}
					label={btnLabelTranslated}
					onClick={ev => handleClick(ev)}
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
					disableAutoFocus
					disableEnforceFocus // must use both of those to prevent from autofocus away from canva iframe
					disableBackdropClick={disableBackdropClick}
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
					<DialogTitle
						disableTypography
						classes={{
							root: classnames(classes.dialogTitle, classes.breakLong),
						}}
					>
						<Typography variant='subtitle1'>{t(title)}</Typography>
						<IconButton onClick={handleToggle} size='small'>
							<CancelIcon />
						</IconButton>
					</DialogTitle>
					<DialogContent classes={{ root: classes.content }}>
						<Decorated ref={forwardedRef} {...rest} closeDialog={closeDialog} />
					</DialogContent>
					{dialogActions && <DialogActions>{dialogActions}</DialogActions>}
				</Dialog>
			</Fragment>
		)
	}

	WithDialog.propTypes = {
		btnLabel: PropTypes.string,
		title: PropTypes.string.isRequired,
		floating: PropTypes.bool,
		onBeforeOpen: PropTypes.func,
	}

	return forwardRef((props, ref) => (
		<WithDialog {...props} forwardedRef={ref} />
	))
}
