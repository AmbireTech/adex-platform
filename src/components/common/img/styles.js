export const styles = theme => ({
	imgLoading: {
		top: 0,
		left: 0,
		width: 'auto',
		height: '100%',
		position: 'relative',
		display: 'inline-block',
	},
	circular: {
		position: 'relative',
		top: 'calc(50% - 20px)', //UGLY but works best - DEFAULT circular size is 40px
		left: 'calc(50% - 20px)',
		display: 'inline-block',
	},
	fullscreenIcon: {
		position: 'absolute',
		top: theme.spacing(1),
		right: theme.spacing(1),
		cursor: 'pointer',
		width: '30px',
		height: '30px',
		minHeight: '24px',
	},
	dialog: {
		'@media(max-width:744px)': {
			minWidth: `calc(100vw - ${theme.spacing(2)}px)`,
		},
		'@media(max-height:823px)': {
			minHeight: 'auto',
		},
	},
	dialogImageParent: {
		'@media(max-width:1080px)': {
			maxWidth: '80vw',
			maxHeight: '100vw',
			display: 'block',
			margin: 'auto',
		},
		'@media(max-width:744px)': {
			paddingLeft: 0,
			paddingRight: 0,
		},
	},
	dialogImage: {
		height: 'auto',
		maxWidth: '80vw',
	},
	img: {
		width: '100%',
		height: '100%',
		objectFit: 'contain',
	},
	wrapper: {
		height: '100%',
		width: '100%',
	},
	cellImg: {
		// Fixed width to avoid col resizing while loading
		height: 46,
		width: 69,
		cursor: 'pointer',
		display: 'flex',
	},
})
