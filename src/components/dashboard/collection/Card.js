import React, { Component } from 'react'
import { Card, CardMedia, CardTitle, CardActions } from 'react-toolbox/lib/card'
import { Button, IconButton } from 'react-toolbox/lib/button'
import theme from './theme.css'
import { withReactRouterLink } from './../../common/rr_hoc/RRHoc'
import Tooltip from 'react-toolbox/lib/tooltip'
import Img from './../../common/img/Img'
import { ItemTypesNames } from './../../../constants/itemsTypes'


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
            <Card style={{ width: '300px' }} raised={true} theme={theme}>
                <RRCardTitle
                    to={to}
                    title={meta.fullName}
                    theme={theme}
                />
                <RRCardMedia
                    to={to}
                    aspectRatio='wide'
                    theme={theme}
                >
                    <Img src={meta.img} alt={name} />
                </RRCardMedia>
                <CardTitle
                    title={name}
                />
                <CardActions theme={theme}>
                    <TooltipRRButton
                        to={to} label='view'
                        raised primary
                        tooltip='Click here to click'
                        tooltipDelay={1000}
                        tooltipPosition='top' />
                    <div>
                        {this.props.actionsRenderer}
                    </div>
                </CardActions>
            </Card>
        );
    }
}

export default MyCard;
