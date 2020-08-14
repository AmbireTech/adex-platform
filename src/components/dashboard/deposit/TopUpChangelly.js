import React from 'react'
import { useSelector } from 'react-redux'
import { Paper, Box } from '@material-ui/core'
import { selectAccountIdentityAddr } from 'selectors'

const onloadFunction = `
function at(t) {
	var e = t.target,
		i = e.parentNode,
		n = e.contentWindow,
		r = function() {
			return n.postMessage({ width: i.offsetWidth }, 'https://widget.changelly.com');
		};
	window.addEventListener('resize', r), r();
};
at.apply(this, arguments);
`
const getChangellyIframe = identityAddress =>
	`
	<iframe 
	src="https://widget.changelly.com?from=btc,eth,xrp&to=dai&amount=0.007&address=${identityAddress}&fromDefault=btc&toDefault=dai&theme=aqua&merchant_id=unl7fil0on3x48m1&payment_id=&v=2" 
	width="100%" height="600" class="changelly" scrolling="no" 
	onLoad="${onloadFunction}" 
	style="min-width: 100%; width: 100px; overflow-y: hidden; border: none">Can't load widget</iframe>
`

function TopUpChangelly(props) {
	const identityAddr = useSelector(selectAccountIdentityAddr)
	const widgetIframeHtml = getChangellyIframe(identityAddr)

	return (
		<Paper variant='outlined'>
			<Box p={2}>
				{!!identityAddr && (
					<div dangerouslySetInnerHTML={{ __html: widgetIframeHtml }} />
				)}
			</Box>
		</Paper>
	)
}

export default TopUpChangelly
