import React from 'react'
import { AUTH_TYPES } from 'constants/misc'
import { TopLoading } from 'components/common/dialog/content'

export const WalletAction = ({ t, authType }) => {
    let msg = ''

    switch (authType) {
        case AUTH_TYPES.METAMASK.name:
            msg = 'METAMASK_WAITING_ACTION'
            break
        case AUTH_TYPES.TREZOR.name:
            msg = 'TREZOR_WAITING_ACTION'
            break
        case AUTH_TYPES.LEDGER.name:
            msg = 'LEDGER_WAITING_ACTION'
            break
        default:
            msg = 'WAITING_FOR_USER_ACTION'
            break
    }

    return (
        <TopLoading msg={t(msg)} />
    )
}