import React from 'react'
import { createMuiTheme } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import pink from '@material-ui/core/colors/pink'
import lime from '@material-ui/core/colors/lime'
import deepOrange from '@material-ui/core/colors/deepOrange'
import amber from '@material-ui/core/colors/amber'

const palette = {
	primary: blue,
	secondary: pink,
	error: deepOrange,
	warning: amber,
	first: lime,
	contrastThreshold: 3,
	tonalOffset: 0.2,
}

export const themeMUI = createMuiTheme({
	palette: { ...palette },
	overrides: {
		MuiButton: {
			root: {
				borderRadius: 0
			},
			outlined: {
				borderRadius: 0
			}
		},
		MuiTableCell: {
			head: {
				whiteSpace: 'nowrap'
			},
			root: {
				whiteSpace: 'nowrap'
			}
		},
		MuiPaper: {
			rounded: {
				borderRadius: 0
			}
		}
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
				fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
			},
			a: {
				textDecoration: 'none'
			}
		}
	}
}