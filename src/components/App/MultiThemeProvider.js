import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { darkTheme, lightTheme } from './themeMUi'
import {
	darkTheme as darkThemeWallet,
	lightTheme as lightThemeWallet,
} from './themeWallet'
import {
	loadFromLocalStorage,
	saveToLocalStorage,
} from 'helpers/localStorageHelpers'
import { selectProject } from 'selectors'
import { PROJECTS } from 'constants/global'

const THEMES = {
	[PROJECTS.platform]: {
		light: lightTheme,
		dark: darkTheme,
	},
	[PROJECTS.wallet]: {
		light: lightThemeWallet,
		dark: darkThemeWallet,
	},
}

export const MultiThemeContext = React.createContext()

const MultiThemeProvider = ({ children }) => {
	const project = useSelector(selectProject)
	const [themeType, setThemeType] = useState('light')
	const [theme, setTheme] = useState(darkTheme)

	useEffect(() => {
		const lastTheme = loadFromLocalStorage('themeType') || 'light'
		setThemeType(lastTheme)
		setTheme(THEMES[project][lastTheme])
	}, [project])

	const switchTheme = () => {
		if (themeType === 'light') {
			saveToLocalStorage('dark', 'themeType')
			setThemeType('dark')
			setTheme(THEMES[project]['dark'])
		} else {
			saveToLocalStorage('light', 'themeType')
			setThemeType('light')
			setTheme(THEMES[project]['light'])
		}
	}

	const contextValue = {
		themeType,
		switchTheme,
	}

	return (
		<MultiThemeContext.Provider value={contextValue}>
			<MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
		</MultiThemeContext.Provider>
	)
}

export default MultiThemeProvider
