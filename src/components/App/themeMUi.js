import { createMuiTheme } from '@material-ui/core/styles'
import lime from '@material-ui/core/colors/lime'
import deepOrange from '@material-ui/core/colors/deepOrange'
import amber from '@material-ui/core/colors/amber'
import grey from '@material-ui/core/colors/grey'

const ADEX_BLUE = '#1B75BC'
const ADEX_GREEN = '#14DC9C'

const palette = {
	primary: { main: ADEX_BLUE, contrastText: '#fff' },
	secondary: { main: ADEX_GREEN, contrastText: '#fff' },
	error: deepOrange,
	warning: amber,
	first: lime,
	contrastThreshold: 3,
	tonalOffset: 0.2,
	text: grey,
}

export const themeMUI = createMuiTheme({
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

export const globalStyles = theme => {
	return {
		'@global': {
			html: {
				fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
			},
			a: {
				textDecoration: 'none',
			},
		},
	}
}
