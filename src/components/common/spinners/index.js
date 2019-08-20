
import React from 'react'
import { LinearProgress} from '@material-ui/core'

export const InputLoading = ({ msg, className }) =>
	<div>
		<LinearProgress className={className}/>
		{ msg ? (<div> { msg } </div>) : null } 
	</div>
