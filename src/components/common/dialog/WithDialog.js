import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Fab from '@material-ui/core/Fab'
import IconButton from '@material-ui/core/IconButton'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import classnames from 'classnames'
import Translate from 'components/translate/Translate'
import Slide from '@material-ui/core/Slide'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import Icon from '@material-ui/core/Icon'
import CancelIcon from '@material-ui/icons/Cancel'
import DialogActions from '@material-ui/core/DialogActions'
import Typography from '@material-ui/core/Typography'
import { ContentBox, ContentBody, ContentStickyTop } from 'components/common/dialog/content'
import { logOut, isDemoMode } from 'services/store-data/auth'
import DEMO_IMAGE from 'resources/rekt-eddie.png'
import Img from 'components/common/img/Img'

const textBtn = ({ label, className, classes, style, onClick, ...rest }) => {
	return <span className={classnames(classes.textBtn, className)} style={style} onClick={onClick}> {label} </span>
}

const TextBtn = withStyles(styles)(textBtn)

const Transition = (props) => {
	return <Slide direction="up" {...props} />;
}

export default function ItemHoc(Decorated) {
	class WithDialog extends Component {
		constructor(props) {
			super(props)
			this.state = {
				open: false
			}
		}

		shouldComponentUpdate(nextProps, nextState) {
			const shouldUpdate = (this.state.open !== nextState.open)
				|| (JSON.stringify(this.props) !== JSON.stringify(nextProps))

			return shouldUpdate
		}

		handleToggle = () => {
			this.setState({ open: !this.state.open })
		}

		closeDialog = () => {
			this.setState({ open: false })
		}

		renderDemoModeAction = () => {
			const { classes, t } = this.props
			return (
				<ContentBox>
					<ContentStickyTop>
						<Typography paragraph variant='subheading'>
							{t('DEMO_MODE_ACTION_DESCRIPTION')}
						</Typography>
					</ContentStickyTop>
					<ContentBody>
						<div>
							<Button
								onClick={logOut}
								variant='contained'
								color='primary'
							>
								{t('DEMO_GO_AUTH_BTN')}
							</Button>
						</div>
						<div>
							<Img
								className={classes.demoImg}
								allowFullscreen={false}
								src={DEMO_IMAGE}
								alt={'Demo image'}
							/>
						</div>
					</ContentBody>
				</ContentBox>
			)
		}

		render() {
			const {
				iconButton,
				textButton,
				fabButton,
				variant,
				fabVariant,
				color,
				size,
				mini,
				classes,
				t,
				btnLabelArgs,
				disabled,
				className,
				icon,
				title,
				dialogActions,
				...rest
			} = this.props

			let ButtonComponent = Button

			const btnProps = {
				color,
				size,
				mini,
				variant
			}

			if (iconButton) {
				ButtonComponent = IconButton
			} else if (textButton) {
				ButtonComponent = TextBtn
			} else if (fabButton) {
				ButtonComponent = Fab
			}

			const btnLabel = t(this.props.btnLabel, { args: btnLabelArgs || [''] })
			const isDemo = isDemoMode()

			const { open } = this.state

			return (
				<Fragment >
					<ButtonComponent
						disabled={disabled}
						aria-label={btnLabel}
						label={btnLabel}
						onClick={this.handleToggle}
						{...btnProps}
						// style={this.props.style}
						className={classnames(
							className,
							{ [classes.floating]: !!fabButton },
							{ [classes.first]: color === 'first' },
							{ [classes.second]: color === 'second' }
						)}
					>
						{icon && <Icon className={classnames({ [classes.btnIconLeft]: !iconButton })} > {icon}</Icon>}
						{!iconButton && btnLabel}
					</ButtonComponent>
					<Dialog
						// disableBackdropClick
						// disableEscapeKeyDown
						// maxWidth="xs"
						// fullScreen
						open={open}
						onClose={this.handleToggle}
						TransitionComponent={Transition}
						classes={{ paper: classes.dialog }}
					// onEscKeyDown={this.handleToggle}
					// onOverlayClick={this.handleToggle}
					>
						{/* <AppBar className={classes.appBar}>
                            <Toolbar> */}
						<DialogTitle
							disableTypography

						>
							<Typography
								variant='title'
								classes={
									{ title: classnames(classes.dialogTitle, classes.breakLong) }
								}
							>
								{t(title)}
								<IconButton
									onClick={this.handleToggle}
								>
									<CancelIcon />
								</IconButton>
							</Typography>
						</DialogTitle>
						{/* </Toolbar>
                        </AppBar> */}
						<DialogContent
							classes={{ root: classes.content }}
						>
							{
								isDemo ?
									// NOTE: ugly but it's temp and saves a lot of work!
									this.renderDemoModeAction()
									:
									<Decorated
										{...rest}
										closeDialog={this.closeDialog}
									/>
							}

						</DialogContent>
						{dialogActions &&
							<DialogActions>
								{dialogActions}
							</DialogActions>
						}
					</Dialog>
				</Fragment >
			)
		}
	}

	WithDialog.propTypes = {
		btnLabel: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		floating: PropTypes.bool
	}

	return Translate(withStyles(styles)(WithDialog))
}

