import {
	createMuiTheme,
	responsiveFontSizes,
	alpha,
} from '@material-ui/core/styles'
import { lime, grey } from '@material-ui/core/colors'

const WHITE = '#fafafa'
const BLACK = '#0f0f0f'
const TRANSPARENT = 'transparent'

export const ERROR_COLOR = '#FF4269'
export const ERROR_LIGHT = '#ff7a97'
export const ERROR_DARK = '#c6003f'

export const WARNING = '#FEB006'
export const SUCCESS = '#14dc9c'
export const INFO = '#1b75bc'
export const ERROR = '#ff6969'

// Light theme
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
export const ALEX_GREY_LIGHTEST = '#ebebeb'

export const GANDALF_GREY = '#C4C4C4'

export const ACCENT_ONE = '#FF6942'
export const ACCENT_ONE_LIGHT = '#FF9B6F'
export const ACCENT_ONE_DARK = '#c53616'

export const ACCENT_TWO = '#FFAC00'
export const ACCENT_TWO_LIGHT = '#ffde4b'
export const ACCENT_TWO_DARK = '#c67d00'

export const PAPER = WHITE
export const BG_DEFAULT = '#efefef'

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

// Dark theme
export const DARK_PRIMARY = '#0ca597'
export const DARK_PRIMARY_LIGHT = '#59d7c8'
export const DARK_PRIMARY_LIGHTEST = '#90fffb'
export const DARK_PRIMARY_DARK = '#007569'
export const DARK_PRIMARY_DARKEST = '#00493f'

export const DARK_SECONDARY = '#d4ff00'
export const DARK_SECONDARY_LIGHT = '#ffff58'
export const DARK_SECONDARY_DARK = '#9ecc00'

export const DARK_PAPER = '#333'
export const DARK_BG_DEFAULT = '#0f1316'
export const DARK_APPBAR = '#1f1f1f'

export const DARK_ACCENT_ONE = '#ff7000'
export const DARK_ACCENT_ONE_LIGHT = '#ffa140'
export const DARK_ACCENT_ONE_DARK = '#c43f00'

export const DARK_ACCENT_TWO = '#0090dd'
export const DARK_ACCENT_TWO_LIGHT = '#60c0ff'
export const DARK_ACCENT_TWO_DARK = '#0063ab'

const darkPrimary = {
	main: DARK_PRIMARY,
	dark: DARK_PRIMARY_DARK,
	light: DARK_PRIMARY_LIGHT,
	lightest: DARK_PRIMARY_DARKEST,
	contrastText: WHITE,
}

const darkSecondary = {
	main: DARK_SECONDARY,
	dark: DARK_SECONDARY_DARK,
	light: DARK_SECONDARY_LIGHT,
	contrastText: BLACK,
}

const paletteCommon = {
	primary: { main: PRIMARY, contrastText: WHITE },
	secondary: { main: SECONDARY, contrastText: WHITE },
	grey: { main: ALEX_GREY, contrastText: WHITE },
	lightGrey: { main: ALEX_GREY_LIGHTEST, contrastText: BLACK },
	warning: {
		main: WARNING,
		contrastText: BLACK,
	},
	success: {
		main: SUCCESS,
		contrastText: BLACK,
	},
	info: {
		main: INFO,
		contrastText: WHITE,
	},
	error: {
		main: ERROR,
		contrastText: WHITE,
	},
	first: lime,
	common: {
		white: WHITE,
		black: BLACK,
	},
}

const paletteDark = {
	type: 'dark',
	...paletteCommon,
	primary: darkPrimary,
	secondary: darkSecondary,
	accentOne: { main: ACCENT_ONE, light: ACCENT_ONE_LIGHT, contrastText: WHITE },
	accentTwo: { main: ACCENT_TWO, light: ACCENT_TWO_LIGHT, contrastText: WHITE },
	// accentOne: {
	// 	main: DARK_ACCENT_ONE,
	// 	light: ACCENT_ONE_LIGHT,
	// 	contrastText: WHITE,
	// },
	// accentTwo: {
	// 	main: DARK_ACCENT_TWO,
	// 	light: ACCENT_TWO_LIGHT,
	// 	contrastText: BLACK,
	// },
	// special: { main: WARNING, contrastText: BLACK },
	// text: {
	// 	main: TEXT_MAIN,
	// 	primary: alpha(WHITE, 0.69),
	// 	secondary: alpha(WHITE, 0.42),
	// 	disabled: alpha(WHITE, 0.1948),
	// 	hint: alpha(WHITE, 0.13),
	// },
	divider: alpha(WHITE, 0.13),
	background: {
		paper: DARK_PAPER,
		default: DARK_BG_DEFAULT,
		stepperPaper: TRANSPARENT,
	},
	action: {
		action: alpha(WHITE, 0.46),
		hover: alpha(WHITE, 0.069),
		hoverOpacity: 0.069,
		selected: alpha(WHITE, 0.1914),
		selectedOpacity: 0.1914,
		disabled: alpha(WHITE, 0.1948),
		disabledOpacity: 0.48,
		focus: alpha(WHITE, 0.18),
		focusOpacity: 0.18,
		activatedOpacity: 0.18,
	},
	appBar: { main: DARK_APPBAR, contrastText: grey[200] },
	text: {
		icon: alpha(WHITE, 0.42),
		primary: alpha(WHITE, 0.9),
		secondary: alpha(WHITE, 0.42),
		disabled: alpha(WHITE, 0.1948),
		hint: alpha(WHITE, 0.13),
		solid: grey[200],
	},
}

const paletteLight = {
	type: 'light',
	...paletteCommon,
	primary,
	secondary,
	accentOne: { main: ACCENT_ONE, light: ACCENT_ONE_LIGHT, contrastText: WHITE },
	accentTwo: { main: ACCENT_TWO, light: ACCENT_TWO_LIGHT, contrastText: WHITE },
	grey: {
		main: ALEX_GREY,
		contrastText: WHITE,
		light: ALEX_GREY_LIGHT,
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
	background: {
		default: BG_DEFAULT,
		paper: WHITE,
	},
	info: primary,
	success: secondary,
	first: lime,
	contrastThreshold: 3,
	tonalOffset: 0.2,
	action: {
		disabledBackground: grey[200],
		disabled: grey[500],
	},
	tooltipBgColor: alpha(ALEX_GREY, 0.98),
	text: {
		icon: alpha(BLACK, 0.69),
		primary: alpha(BLACK, 0.9),
		secondary: alpha(BLACK, 0.69),
		disabled: alpha(BLACK, 0.42),
		hint: alpha(BLACK, 0.13),
		solid: grey[500],
	},
}

export const palette = {
	primary,
	secondary,
	accentOne: { main: ACCENT_ONE, light: ACCENT_ONE_LIGHT, contrastText: WHITE },
	accentTwo: { main: ACCENT_TWO, light: ACCENT_TWO_LIGHT, contrastText: WHITE },
	grey: {
		main: ALEX_GREY,
		contrastText: WHITE,
		light: ALEX_GREY_LIGHT,
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
	tooltipBgColor: alpha(ALEX_GREY, 0.98),
}

const typography = {
	fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
	fontSize: 13.42,
}

const borderRadius = 0

const defaultTheme = createMuiTheme({
	typography,
	palette: { ...paletteCommon },
	shape: {
		borderRadius,
	},
})

const darkShadows = [...defaultTheme.shadows, '3px 4px 15px 0px rgba(0,0,0,1)']

const lightShadows = [
	...defaultTheme.shadows,
	'2px 2px 13px 0px rgba(69,69,69,0.420)',
]

const props = {
	drawerWidth: 250,
}

const commonTheme = createMuiTheme({
	...defaultTheme,
	typography,
	props,
	overrides: {
		MuiButton: {
			root: {
				borderRadius,
			},
			outlined: {
				borderRadius,
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
				borderRadius,
			},
		},
		MuiTooltip: {
			tooltip: {
				borderRadius,
				fontSize: defaultTheme.typography.pxToRem(13),
				backgroundColor: palette.tooltipBgColor,
			},
			arrow: {
				color: palette.tooltipBgColor,
			},
		},
		MuiSelect: {
			outlined: {
				borderRadius,
			},
		},
		MuiInputLabel: {
			outlined: {
				borderRadius,
			},
		},
		MuiOutlinedInput: {
			root: {
				borderRadius,
			},
		},
		MuiAlert: {
			root: {
				borderRadius,
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
		MuiExpansionPanel: {
			root: {
				borderColor: 'threedface',
			},
		},
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

const defaultThemeWithOverrides = responsiveFontSizes(commonTheme, {
	breakpoints: ['xs', 'sm', 'md', 'lg', 'xl'],
	factor: 3,
})

export const darkTheme = createMuiTheme({
	...defaultThemeWithOverrides,
	palette: paletteDark,
	shadows: darkShadows,
	type: 'dark',
})

export const lightTheme = createMuiTheme({
	...defaultThemeWithOverrides,
	palette: paletteLight,
	shadows: lightShadows,
	type: 'light',
})
