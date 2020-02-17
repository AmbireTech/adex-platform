import React from 'react'
import Img from 'components/common/img/Img'
import { makeStyles } from '@material-ui/core/styles'
import classnames from 'classnames'

const useStyles = makeStyles(theme => ({
	img: {
		height: '50px',
		width: '50px',
		cursor: 'pointer',
		border: '5px solid',
		borderRadius: '50%',
	},
}))

function GettingStartedImg(props) {
	const classes = useStyles()
	return (
		<Img
			src={props.src}
			className={classnames(classes.img)}
			alt={props.alt}
			style={{ cursor: 'pointer' }}
		></Img>
	)
}

export default GettingStartedImg
