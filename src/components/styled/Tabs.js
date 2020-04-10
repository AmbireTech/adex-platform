import React from 'react'
import { Tab, Tabs, AppBar } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

export const PublisherTabs = withStyles(theme => ({
	indicator: {
		backgroundColor: theme.palette.accentTwo.contrastText,
	},
}))(props => <Tabs {...props} />)

export const PublisherTab = withStyles(theme => ({
	root: {
		color: theme.palette.accentTwo.contrastText,
		opacity: 0.69,
		'&:hover': {
			color: theme.palette.accentTwo.contrastText,
			opacity: 1,
		},
		'&$selected': {
			color: theme.palette.accentTwo.contrastText,
			opacity: 1,
		},
		'&:focus': {
			color: theme.palette.accentTwo.contrastText,
			opacity: 1,
		},
	},
	selected: {},
}))(props => <Tab {...props} />)

export const PublisherAppBar = withStyles(theme => ({
	root: {
		zIndex: theme.zIndex.appBar - 1,
		backgroundColor: theme.palette.accentTwo.main,
	},
}))(props => <AppBar {...props} />)
