import HDKey from 'hdkey'
import wallet  from 'ethereumjs-wallet'

export const getAddrs = (publicKey, chainCode) => {
	var hdk = new HDKey()
	hdk.publicKey = new Buffer(publicKey, 'hex')
	hdk.chainCode = new Buffer(chainCode, 'hex')

	var all = []
	for (var i = 0; i != 20; i++) {
		var wlt = wallet.fromExtendedPublicKey(hdk.derive('m/' + i).publicExtendedKey)
		all.push('0x' + wlt.getAddress().toString('hex'))
	}

	return all
}