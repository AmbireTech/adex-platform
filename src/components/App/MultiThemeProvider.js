import React, { useEffect, useState } from 'react'
import { MuiThemeProvider } from '@material-ui/core/styles'
import {
	darkTheme as darkThemeWallet,
	lightTheme as lightThemeWallet,
} from './themeWallet'
import { saveToLocalStorage } from 'helpers/localStorageHelpers'

const THEMES = {
	light: lightThemeWallet,
	dark: darkThemeWallet,
}

export const MultiThemeContext = React.createContext()

const MultiThemeProvider = ({ children }) => {
	const [themeType, setThemeType] = useState('dark')
	const [theme, setTheme] = useState(darkThemeWallet)

	useEffect(() => {
		setTheme(darkThemeWallet)
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
