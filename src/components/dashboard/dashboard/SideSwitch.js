import React from 'react'
import Anchor from 'components/common/anchor/anchor'
import Switch from '@material-ui/core/Switch'
import List from '@material-ui/core/List'
import Icon from '@material-ui/core/Icon'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import AdexIconTxt from 'components/common/icons/AdexIconTxt'

const RRSwitch = withReactRouterLink((props) =>

    <List>
        <ListItem>
            <ListItemIcon>
                {/* <AdexIconTxt
                        className={props.classes}
                    /> */}
                <Icon>close</Icon>
            </ListItemIcon>
            <ListItemText primary={props.label} />
            <ListItemSecondaryAction>
                <Anchor {...props}>
                    <Switch {...props} />
                </Anchor>
            </ListItemSecondaryAction>
        </ListItem>
    </List>
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