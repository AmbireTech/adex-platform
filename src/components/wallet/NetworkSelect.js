import React from 'react'
import { useSelector } from 'react-redux'
import { MenuItem, ListItemText } from '@material-ui/core'
import { ArrowDropDown } from '@material-ui/icons'

import ButtonMenu from 'components/common/button_menu/ButtonMenuMui'
import { execute, updateNetwork } from 'actions'

import { t, selectNetwork, selectRelayerConfig } from 'selectors'

function NetworkSelect() {
	const currentNetwork = useSelector(selectNetwork)
	const { networks } = useSelector(selectRelayerConfig)
	return (
		<ButtonMenu
			color='secondary'
			id='network-select'
			rightIcon={<ArrowDropDown />}
			label={t('NETWORK_SELECT_CURRENT', { args: [currentNetwork.name] })}
			variant='contained'
		>
			{Object.keys(networks).map(key => (
				<MenuItem
					value='logout'
					onClick={() => {
						execute(updateNetwork(key))
					}}
				>
					<ListItemText
						// classes={{ primary: classes.primary }}
						primary={key}
					/>
				</MenuItem>
			))}
		</ButtonMenu>
	)
}

export default NetworkSelect