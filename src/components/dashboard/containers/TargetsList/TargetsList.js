import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListSubheader from '@material-ui/core/ListSubheader'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import WcIcon from '@material-ui/icons/Wc'
import ChildCareIcon from '@material-ui/icons/ChildCare'
import CompareArrows from '@material-ui/icons/CompareArrows'

import { t } from 'selectors'

const targetIcon = {
	location: LocationOnIcon,
	gender: WcIcon,
	age: ChildCareIcon,
}

const getTargetType = tag => {
	const type = tag.split('_')[0] || 'tags'
	return type
}

const TargetArrayValues = ({ target, addDivider, selected }) => {
	const type = getTargetType(target.tag)
	const TargetIcon = targetIcon[type] || CompareArrows

	return (
		<Fragment>
			<ListItem selected={selected}>
				<ListItemIcon>
					<TargetIcon />
				</ListItemIcon>
				<ListItemText primary={t(target.tag, { isTarget: true })} />
				<ListItemSecondaryAction>{target.score}</ListItemSecondaryAction>
			</ListItem>
		</Fragment>
	)
}

const TargetsList = ({ targets = [], subHeader }) => (
	<List
		dense
		subheader={subHeader ? <ListSubheader>{t(subHeader)}</ListSubheader> : null}
	>
		{targets.map((target, index) => {
			return (
				<TargetArrayValues
					selected={index % 2 === 0}
					target={target}
					key={target.tag + target.score + index}
					addDivider={targets.length - 1 > index}
				/>
			)
		})}
	</List>
)

TargetsList.propTypes = {
	targets: PropTypes.array,
	subHeader: PropTypes.string,
}

export default TargetsList
