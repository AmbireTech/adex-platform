export const addSig = ({ addr, sig, mode, expiryTime }) => {
    if (!addr || !sig || !expiryTime || mode === undefined) {
        throw new Error('addSig - all args are required')
    }

    localStorage.setItem('addr-' + mode + '-' + addr, sig + '-' + expiryTime)
}

export const getSig = ({ addr, mode }) => {
    let sigAndTIme = localStorage.getItem('addr-' + mode + '-' + addr)

    if (!sigAndTIme) {
        return null
    }

    sigAndTIme = sigAndTIme.split('-')
    let sig = sigAndTIme[0]
    let time = sigAndTIme[1]

    if (!time || (parseInt(time, 10) <= Date.now())) {
        return null
    } else {
        return sig
    }
}