import lightwallet from 'eth-lightwallet'

export const HD_PATH = "m/44'/60'/0'/0"

class KeyStore {
    constructor() {
        this._keystore = lightwallet.keystore
        this._ks = null
    }

    createVault = ({ password = '', seedPhrase = '', salt = '', hdPathString = HD_PATH }) => {
        return new Promise((resolve, reject) => {
            this._keystore.createVault({
                password: password,
                seedPhrase: seedPhrase,
                salt: salt,
                hdPathString: HD_PATH
            }, (err, ks) => {
                if (err) {
                    console.log('err', err)
                    throw err // TODO: make global error handler!!!
                }

                this._ks = ks
                return resolve(ks)
            })
        })
    }

    get ks() { return this._ks }
    get keystore() { return this._keystore }
}

export default new KeyStore()


