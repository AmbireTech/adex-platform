export const styles = {
	root: {
		color: 'purple',
		'&$active': {
			color: 'green'
		}
	},
	active: {
		color: 'yellow'
	},
	stepperWrapper: {
		// display: 'flex',
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		top: 0,
	},
	pagePaper: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		top: 115,
	},
	pageContent: {
		position: 'absolute',
		top: 20,
		left: 20,
		right: 20,
		bottom: 50,
		padding: 20,
		overflowY: 'auto',
		overflowX: 'hidden',
		WebkitOverflowScrolling: 'touch',
		'@media(max-width:500px)': {
			paddingLeft: 0,
			paddingRight: 0
		}
	},
	controls: {
		position: 'absolute',
		bottom: 5,
		left: 20,
		right: 20,
	},
	right: {
		textAlign: 'right',
		display: 'inline-block',
		width: '50%',
		'@media(max-width:475px)': {
			width: '86%'
		}
	},
	left: {
		display: 'inline-block',
		textAlign: 'left',
		width: '50%',
		'@media(max-width:475px)': {
			width: '14%'
		}
	},
	mobileStepper: {
		width: '100%',
		'& div': {
			width: '100%',
			height: '10px'
		}
	},
	mobileStepLabel: {
		'& span': {
			fontSize: '24px',
			margin: '14px auto'
		},
		textAlign: 'center',
		width: 'auto'
	}
}