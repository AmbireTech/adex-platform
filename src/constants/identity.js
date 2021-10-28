export const privileges = {
	yes: true,
	no: false,
}

//TODO: remove - legacy stuff

export const SignatureModes = {
	NO_SIG: 0,
	EIP712: 1,
	GETH: 2,
	TREZOR: 3,
	ADEX: 4,
}

export const SignaturePrefixes = {
	NO_SIG: '',
	EIP712: '',
	GETH: '\x19Ethereum Signed Message:\n32',
	TREZOR: '\x19Ethereum Signed Message:\n\x20',
	ADEX:
		'\x19Ethereum Signed Message:\n108By signing this message, you acknowledge signing an AdEx bid with the hash:\n',
}
