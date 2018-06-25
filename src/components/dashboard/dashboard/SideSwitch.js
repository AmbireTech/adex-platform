import React from 'react'
import Anchor from 'components/common/anchor/anchor'
import Switch from '@material-ui/core/Switch'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'

const RRSwitch = withReactRouterLink((props) =>
    <ListItem>
        <ListItemText primary={props.label} />
        <ListItemSecondaryAction>
            <Anchor {...props}>
                <Switch {...props} />
            </Anchor>
        </ListItemSecondaryAction>
    </ListItem>
)

export const SideSwitch = ({ side, t }) => {
    return (
        <div>
            {/* Keep both if there is no valid side and force react to rerender at the same time */}
            {side !== 'advertiser' ?
                <RRSwitch
                    checked={true}
                    value='account'
                    to={{ pathname: '/dashboard/advertiser' }}
                    label={t('PUBLISHER')}
                /> : null}
            {side !== 'publisher' ?
                <RRSwitch
                    checked={false}
                    to={{ pathname: '/dashboard/publisher' }}
                    label={t('ADVERTISER')}
                /> : null}
        </div>
    )
}