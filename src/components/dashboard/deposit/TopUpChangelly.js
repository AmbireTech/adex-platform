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
const getChangellyIframe = (identityAddress, symbol = '') =>
	`
	<iframe 
	src="https://widget.changelly.com?from=btc,eth,xrp&to=${`${symbol.toLowerCase()}`}&amount=0.007&address=${identityAddress}&fromDefault=btc&toDefault=${`${symbol.toLowerCase()}`}&theme=aqua&merchant_id=unl7fil0on3x48m1&payment_id=&v=3" 
	width="100%" height="600" class="changelly" scrolling="no" 
	onLoad="${onloadFunction}" 
	style="min-width: 100%; width: 100px; overflow-y: hidden; border: none">Can't load widget</iframe>
`

function TopUpChangelly(props) {
	const symbol = props.symbol === 'USDT' ? props.symbol + '20' : props.symbol
	const identityAddr = useSelector(selectAccountIdentityAddr)
	const widgetIframeHtml = getChangellyIframe(identityAddr, symbol)

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
