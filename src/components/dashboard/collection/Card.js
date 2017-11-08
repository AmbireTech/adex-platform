import React, { Component } from 'react'
import { Card, CardMedia, CardTitle, CardActions } from 'react-toolbox/lib/card'
import { Button, IconButton } from 'react-toolbox/lib/button'
import theme from './theme.css'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import Tooltip from 'react-toolbox/lib/tooltip'
import Img from 'components/common/img/Img'
import { ItemTypesNames } from 'constants/itemsTypes'
import Item from 'models/Item'

// const RRButton = withReactRouterLink(Button)
const RRCardTitle = withReactRouterLink(CardTitle)
const RRCardMedia = withReactRouterLink(CardMedia)

const TooltipRRButton = withReactRouterLink(Tooltip(Button))
const TooltipIconButton = Tooltip(IconButton)

class MyCard extends Component {

    render() {
        let meta = this.props.item._meta
        let name = this.props.item._name
        let id = this.props.item._id
        let to = '/dashboard/' + this.props.side + '/' + ItemTypesNames[this.props.item._type] + '/' + id
        return (
            <Card raised={false} theme={theme}>
                <RRCardMedia
                    to={to}
                    aspectRatio='wide'
                    theme={theme}
                >
                    <Img src={Item.getImgUrl(meta.img)} alt={name} />
                </RRCardMedia>
                <CardTitle
                    title={meta.fullName}
                    theme={theme}
                />
                <CardActions theme={theme}>
                    <div>
                        {this.props.actionsRenderer}
                    </div>
                    <TooltipRRButton
                        to={to} label='view'
                        primary
                        tooltip='Click here to click'
                        tooltipDelay={1000}
                        tooltipPosition='top' />
                </CardActions>
            </Card>
        );
    }
}

export default MyCard;
