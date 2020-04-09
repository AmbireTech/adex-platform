import React, { Fragment, useState } from 'react'
import PropTypes from 'prop-types'
import { AdSlot } from 'adex-models'
import { Tab, Tabs, AppBar, Box } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { useItem, SaveBtn } from 'components/dashboard/containers/ItemCommon/'
import { SlotBasic } from './SlotBasic'
import { IntegrationCode } from './IntegrationCode'
import { validateAndUpdateSlot } from 'actions'
import { t } from 'selectors'

export const styles = theme => {
	return {
		appBar: {
			zIndex: theme.zIndex.appBar - 1,
			backgroundColor: theme.palette.accentTwo.main,
		},
	}
}

const useStyles = makeStyles(styles)

const StyledTabs = withStyles(theme => ({
	indicator: {
		backgroundColor: theme.palette.accentTwo.contrastText,
	},
}))(props => <Tabs {...props} />)

const StyledTab = withStyles(theme => ({
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

function Slot({ match }) {
	const classes = useStyles()
	const [tabIndex, setTabIndex] = useState(0)
	const { item, ...hookProps } = useItem({
		itemType: 'AdSlot',
		match,
		objModel: AdSlot,
		validateAndUpdateFn: validateAndUpdateSlot,
	})

	return (
		<Fragment>
			<SaveBtn {...hookProps} />
			<AppBar position='static' className={classes.appBar}>
				<StyledTabs
					value={tabIndex}
					onChange={(ev, index) => setTabIndex(index)}
					scrollButtons='auto'
					indicatorColor='primary'
					textColor='primary'
				>
					<StyledTab label={t('SLOT_MAIN')} />
					<StyledTab label={t('INTEGRATION')} />
					{/* There are no stats displayed currently so I will just comment this out */}
					{/* <Tab label={t('STATISTICS')} /> */}
				</StyledTabs>
			</AppBar>
			<Box my={2}>
				{tabIndex === 0 && <SlotBasic item={item} {...hookProps} />}
				{tabIndex === 1 && <IntegrationCode slot={item} />}
			</Box>
		</Fragment>
	)
}

Slot.propTypes = {
	match: PropTypes.object.isRequired,
}

export default Slot
