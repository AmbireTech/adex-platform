import React, { useEffect, useState } from 'react'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { darkTheme, lightTheme } from './themeMUi'
import {
	loadFromLocalStorage,
	saveToLocalStorage,
} from 'helpers/localStorageHelpers'

const THEMES = {
	light: lightTheme,
	dark: darkTheme,
}

export const MultiThemeContext = React.createContext()

const MultiThemeProvider = ({ children }) => {
	const [themeType, setThemeType] = useState('light')
	const [theme, setTheme] = useState(darkTheme)

	useEffect(() => {
		const lastTheme = loadFromLocalStorage('themeType') || 'light'
		setThemeType(lastTheme)
		setTheme(THEMES[lastTheme])
	}, [])

	const switchTheme = () => {
		if (themeType === 'light') {
			saveToLocalStorage('dark', 'themeType')
			setThemeType('dark')
			setTheme(THEMES['dark'])
		} else {
			saveToLocalStorage('light', 'themeType')
			setThemeType('light')
			setTheme(THEMES['light'])
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
