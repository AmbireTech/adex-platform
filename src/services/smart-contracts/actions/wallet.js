import { assets } from 'services/adex-wallet/assets'
import { paths } from 'services/adex-wallet/paths'

export async function walletTradeTransaction({
	account,
	formAsset,
	formAssetAmount,
	toAsset,
	toAssetAmount,
}) {
	const { path, router } = paths[formAsset][toAsset]

	const trade = {
		formAsset,
		formAssetAmount,
		toAsset,
		toAssetAmount,
		path,
		router,
	}

	// TODO: ..
}
