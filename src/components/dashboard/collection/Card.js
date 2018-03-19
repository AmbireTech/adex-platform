import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Card, CardMedia, CardTitle, CardActions } from 'react-toolbox/lib/card'
import { Button } from 'react-toolbox/lib/button'
import theme from './theme.css'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import Tooltip from 'react-toolbox/lib/tooltip'
import Img from 'components/common/img/Img'
import { Item } from 'adex-models'
import Translate from 'components/translate/Translate'
import { items as ItemsConstants } from 'adex-constants'

const { ItemTypesNames } = ItemsConstants

const RRCardMedia = withReactRouterLink(CardMedia)
const TooltipRRButton = withReactRouterLink(Tooltip(Button))
// const TooltipFontIcon = Tooltip(FontIcon)

class MyCard extends Component {

    render() {
        let item = this.props.item
        let meta = item._meta || {}
        let name = meta.fullName
        let id = item._id
        let itemTypeName = ItemTypesNames[item._type]
        let to = '/dashboard/' + this.props.side + '/' + itemTypeName + '/' + id
        let imageSrc = Item.getImgUrl(meta.img, process.env.IPFS_GATEWAY) || ''
        return (
            <Card raised={false} theme={theme}>
                <RRCardMedia
                    to={to}
                    aspectRatio='wide'
                    theme={theme}
                >
                    <Img src={imageSrc} alt={name} />
                </RRCardMedia>
                <CardTitle
                    title={meta.fullName}
                    theme={theme}
                />
                <CardActions theme={theme}>
                    {/* TODO: fix the sync icon */}
                    <div>
                        {/* {!synced ?
                            <TooltipFontIcon
                                value='sync_problem'
                                tooltip={this.props.t('ITEM_NOT_SYNCED')}
                            /> : null} */}
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
