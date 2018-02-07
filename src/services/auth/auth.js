export const addSig = ({ addr, sig, mode }) => {
    if (!addr || !sig || !mode) {
        throw new Error('addSig - all args are required')
    }

    localStorage.setItem('addr-' + mode + '-' + addr, sig)
}

export const getSig = ({ addr, mode }) => {
    return localStorage.getItem('addr-' + mode + '-' + addr)
}