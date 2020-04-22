import { AUTH_TYPES } from 'constants/misc'
import metamaskLogo from 'resources/metamask-logo.png'
import trezorLogo from 'resources/trezor-logo-h.png'
import demoLogo from 'resources/demo-logo.png'

export const getAuthLogo = authType => {
	switch (authType) {
		case AUTH_TYPES.METAMASK.name:
			return metamaskLogo
		case AUTH_TYPES.TREZOR.name:
			return trezorLogo
		case AUTH_TYPES.DEMO.name:
			return demoLogo
		default:
			return ''
	}
}
