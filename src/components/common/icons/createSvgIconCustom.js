import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'
import pure from 'recompose/pure'

export default (path, displayName, viewBox = '') => {
	let Icon = props => (
		<SvgIcon viewBox={viewBox} {...props}>
			{path}
		</SvgIcon>
	)

	Icon.displayName = displayName
	Icon = pure(Icon)
	Icon.muiName = 'SvgIcon'

	return Icon
}
