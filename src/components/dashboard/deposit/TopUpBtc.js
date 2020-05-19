import React from 'react'
import { useSelector } from 'react-redux'
import { Paper, Box } from '@material-ui/core'
import { selectAccountIdentityAddr } from 'selectors'

const getChangellyIframe = identityAddress =>
	`
<script src="https://widget.changelly.com/affiliate.js"></script> 
<iframe src="https://widget.changelly.com?from=btc&to=dai&amount=0.002&address=${identityAddress}&fromDefault=btc&toDefault=dai&theme=aqua&merchant_id=unl7fil0on3x48m1&payment_id=&v=2" 
width="100%" height="600" 
class="changelly" 
scrolling="no" 
onLoad="function at(t){var e=t.target,i=e.parentNode,n=e.contentWindow,r=function(){return n.postMessage({width:i.offsetWidth},it.url)};window.addEventListener('resize',r),r()};at.apply(this, arguments);" 
style="min-width: 100%; width: 100px; overflow-y: hidden; border: none">
Can't load widget
</iframe>
`

function TopUpBtc(props) {
	const identityAddr = useSelector(selectAccountIdentityAddr)
	const changellyIframe = getChangellyIframe(identityAddr)

	return (
		<Paper variant='outlined'>
			<Box p={2}>
				{!!identityAddr && (
					<div dangerouslySetInnerHTML={{ __html: changellyIframe }} />
				)}
			</Box>
		</Paper>
	)
}

export default TopUpBtc
