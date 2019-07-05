import React, { Component } from 'react'
import PropTypes from 'prop-types'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListSubheader from '@material-ui/core/ListSubheader'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import WcIcon from '@material-ui/icons/Wc'
import ChildCareIcon from '@material-ui/icons/ChildCare'
import CompareArrows from '@material-ui/icons/CompareArrows'


const targetIcon = {
	'location': LocationOnIcon,
	'gender': WcIcon,
	'age': ChildCareIcon
}

const getTargetType = (tag) => {
	const type = tag.split('_')[0] || 'tags'
	return type
}

class UnitTargets extends Component {

	targetArrayValues = (target, type, t, index) => {
		const TargetIcon = targetIcon[type] || CompareArrows
		return (
			<span key={target.tag + target.score + index}>
				<ListItem
				>
					<ListItemIcon>
						<TargetIcon />
					</ListItemIcon>
					<ListItemText
						primary={t(target.tag, { isTarget: true })}
						secondary={target.score}
					/>
					<ListItemSecondaryAction>
						{target.score}
					</ListItemSecondaryAction>
				</ListItem>
				<Divider />
			</span>
		)
	}

	TargetsList = ({ targets = [], subHeader, t, ...rest }) =>
		<List
			dense
			subheader={
				subHeader
					? <ListSubheader caption={t(subHeader)} />
					: null}
		>
			{(targets.map((target) => {
				const type = getTargetType(target.tag)
				return this.targetArrayValues(target, type, t)
			}))}
		</List>

	render() {
		return (
			<this.TargetsList {...this.props} />
		)
	}
}

UnitTargets.propTypes = {
	targets: PropTypes.array.isRequired,
	subHeader: PropTypes.string,
	t: PropTypes.func.isRequired
}

export default UnitTargets
