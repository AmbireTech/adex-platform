import { createMuiTheme } from '@material-ui/core/styles'
import lime from '@material-ui/core/colors/lime'
import deepOrange from '@material-ui/core/colors/deepOrange'
import amber from '@material-ui/core/colors/amber'
import grey from '@material-ui/core/colors/grey'

const ADEX_BLUE = '#1B75BC'
const ADEX_GREEN = '#14DC9C'
const ADEX_GREY = '#3c3c3c'
const EDDIE_PINK = '#ff9fa8'
const EDDIE_BLUE = '#00baff'
const EDDIE_GREEN = '#61ffb2'
const WHITE = '#fff'

const palette = {
	primary: { main: ADEX_BLUE, contrastText: WHITE },
	secondary: { main: ADEX_GREEN, contrastText: WHITE },
	eddiePink: { main: EDDIE_PINK, contrastText: WHITE },
	eddieBlue: { main: EDDIE_BLUE, contrastText: WHITE },
	eddieGreen: { main: EDDIE_GREEN, contrastText: WHITE },
	adexGrey: { main: ADEX_GREY, contrastText: WHITE },
	error: deepOrange,
	warning: amber,
	first: lime,
	contrastThreshold: 3,
	tonalOffset: 0.2,
	text: grey,
}

export const themeMUI = createMuiTheme({
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
		fontSize: 13,
	},
	palette: { ...palette },
	overrides: {
		MuiButton: {
			root: {
				borderRadius: 0,
			},
			outlined: {
				borderRadius: 0,
			},
		},
		MuiTableCell: {
			head: {
				whiteSpace: 'nowrap',
			},
			root: {
				whiteSpace: 'nowrap',
			},
		},
		MuiPaper: {
			rounded: {
				borderRadius: 0,
			},
		},
		MuiTooltip: {
			tooltip: { borderRadius: 0 },
		},
		// MuiStepIcon: {
		//     root: {
		//         color: 'yellow',
		//         '&$active': {
		//             color: 'orange'
		//         }
		//     },
		//     active: {
		//         color: 'yellow'
		//     }
		// }
	},
})
