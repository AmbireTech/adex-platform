import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Card, CardMedia, CardTitle, CardActions } from 'react-toolbox/lib/card'
import { Button } from 'react-toolbox/lib/button'
import theme from './theme.css'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import Tooltip from 'react-toolbox/lib/tooltip'
import Img from 'components/common/img/Img'
import { ItemTypesNames } from 'constants/itemsTypes'
import Item from 'models/Item'
import Translate from 'components/translate/Translate'

const RRCardMedia = withReactRouterLink(CardMedia)
const TooltipRRButton = withReactRouterLink(Tooltip(Button))

class MyCard extends Component {

    render() {
        let meta = this.props.item._meta
        let name = this.props.item._name
        let id = this.props.item._id
        let itemTypeName = ItemTypesNames[this.props.item._type]
        let to = '/dashboard/' + this.props.side + '/' + itemTypeName + '/' + id
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
                        tooltip={this.props.t('GO_' + itemTypeName, { args: [name] })}
                        tooltipDelay={1000}
                        tooltipPosition='top' />
                </CardActions>
            </Card>
        );
    }
}

MyCard.propTypes = {
    item: PropTypes.object.isRequired,
    props: PropTypes.string,
}

export default Translate(MyCard)
