import {
	createMuiTheme,
	responsiveFontSizes,
	fade,
} from '@material-ui/core/styles'
import { lime, grey } from '@material-ui/core/colors'

const WHITE = '#fff'
export const PRIMARY = '#1B75BC'
export const PRIMARY_LIGHT = '#5fa3ef'
export const PRIMARY_LIGHTEST = '#96d4ff'
export const PRIMARY_DARK = '#004a8b'
export const PRIMARY_DARKEST = '#00235d'

export const SECONDARY = '#1BC69F'
export const SECONDARY_LIGHT = '#65fad0'
export const SECONDARY_DARK = '#009471'

export const ALEX_GREY = '#3C3C3C'
export const ALEX_GREY_LIGHT = '#666'
export const ALEX_GREY_DARK = '#161616'

export const GANDALF_GREY = '#C4C4C4'

export const ACCENT_ONE = '#FF6942'
export const ACCENT_ONE_LIGHT = '#FF9B6F'
export const ACCENT_ONE_DARK = '#c53616'

export const ACCENT_TWO = '#FFAC00'
export const ACCENT_TWO_LIGHT = '#ffde4b'
export const ACCENT_TWO_DARK = '#c67d00'

export const ERROR_COLOR = '#FF4269'
export const ERROR_LIGHT = '#ff7a97'
export const ERROR_DARK = '#c6003f'

const primary = {
	main: PRIMARY,
	dark: PRIMARY_DARK,
	light: PRIMARY_LIGHT,
	lightest: PRIMARY_LIGHTEST,
	contrastText: WHITE,
}

const secondary = {
	main: SECONDARY,
	dark: SECONDARY_DARK,
	light: SECONDARY_LIGHT,
	contrastText: WHITE,
}

export const palette = {
	primary,
	secondary,
	accentOne: { main: ACCENT_ONE, light: ACCENT_ONE_LIGHT, contrastText: WHITE },
	accentTwo: { main: ACCENT_TWO, light: ACCENT_TWO_LIGHT, contrastText: WHITE },
	grey: {
		main: ALEX_GREY,
		contrastText: WHITE,
		light: ACCENT_ONE_LIGHT,
		dark: ALEX_GREY_DARK,
	},
	appBar: { main: grey[200], contrastText: grey[900] },
	error: {
		main: ERROR_COLOR,
		light: ACCENT_TWO_LIGHT,
		dark: ACCENT_TWO_DARK,
		contrastText: WHITE,
	},
	warning: {
		main: ACCENT_TWO,
		light: ERROR_LIGHT,
		dark: ERROR_DARK,
		contrastText: WHITE,
	},
	info: primary,
	success: secondary,
	first: lime,
	contrastThreshold: 3,
	tonalOffset: 0.2,
	text: grey,
	action: {
		disabledBackground: grey[200],
		disabled: grey[500],
	},
	tooltipBgColor: fade(ALEX_GREY, 0.98),
}

const typography = {
	fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
	fontSize: 13.42,
}

const defaultTheme = createMuiTheme({ typography, palette })

export const theme = createMuiTheme({
	typography: { ...typography },
	palette: { ...palette },
	overrides: {
		MuiButton: {
			root: {
				borderRadius: 0,
			},
			outlined: {
				borderRadius: 0,
				borderColor: ALEX_GREY,
			},
			contained: {
				backgroundColor: ALEX_GREY,
				color: WHITE,
				boxShadow: 0,
				'&:hover': {
					backgroundColor: ALEX_GREY_LIGHT,
					boxShadow: 0,
					'@media (hover: none)': {
						boxShadow: 0,
					},
				},
				'&$focusVisible': {
					boxShadow: 0,
					backgroundColor: ALEX_GREY_LIGHT,
				},
				'&:active': {
					backgroundColor: ALEX_GREY_LIGHT,

					boxShadow: 0,
				},
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
			tooltip: {
				borderRadius: 0,
				fontSize: defaultTheme.typography.pxToRem(13),
				backgroundColor: palette.tooltipBgColor,
			},
			arrow: {
				color: palette.tooltipBgColor,
			},
		},
		MuiSelect: {
			outlined: {
				borderRadius: 0,
			},
		},
		MuiInputLabel: {
			outlined: {
				borderRadius: 0,
			},
		},
		MuiOutlinedInput: {
			root: {
				borderRadius: 0,
			},
		},
		MuiAlert: {
			root: {
				borderRadius: 0,
			},
			outlinedSuccess: {
				backgroundColor: WHITE,
			},
			outlinedInfo: {
				backgroundColor: WHITE,
			},
			outlinedWarning: {
				backgroundColor: WHITE,
			},
			outlinedError: {
				backgroundColor: WHITE,
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
		// },
		MuiTableFooter: {
			root: {
				display: 'flex',
				flex: 0,
				padding: 0,
			},
		},
		MuiAppBar: {
			colorDefault: {
				backgroundColor: palette.appBar.main,
				color: palette.appBar.contrastText,
			},
		},
		MUIDataTablePagination: {
			toolbar: {
				padding: 0,
			},
		},
		MUIDataTableFilter: {
			root: {
				maxWidth: '400px',
			},
		},
		// Think of accessing an element not a class
		MuiGridListTile: {
			root: {
				width: '100% !important',
			},
		},
		MUIDataTableBodyCell: {
			stackedCommon: {
				[defaultTheme.breakpoints.down('sm')]: {
					display: 'inline-flex',
					height: 'auto',
					borderBottom: 'none',
				},
			},
		},
		MUIDataTable: {
			root: {
				border: '1px solid black',
			},
		},
		MUIDataTableBody: {
			emptyTitle: {
				padding: defaultTheme.spacing(2),
				width: '100%',
			},
		},
	},
})

export const themeMUI = responsiveFontSizes(theme, {
	options: ['xs', 'sm', 'md', 'lg', 'xl'],
	factor: 3,
})
