export const addSig = ({ addr, sig, mode }) => {
    localStorage.setItem('addr-' + mode + '-' + addr, sig)
}

export const getSig = ({ addr, mode }) => {
    return localStorage.getItem('addr-' + mode + '-' + addr)
}