import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import Img from 'components/common/img/Img'
import { Item } from 'adex-models'
import Translate from 'components/translate/Translate'
import { items as ItemsConstants } from 'adex-constants'
import { styles } from './styles'
import Tooltip from '@material-ui/core/Tooltip'
import { itemAdTypeLabel, itemAdSizeLabel } from 'helpers/itemsHelpers'
import NO_IMAGE from 'resources/no-image-box-eddie.jpg'

const { ItemTypesNames } = ItemsConstants

const RRCardMedia = withReactRouterLink(CardMedia)
const RRButton = withReactRouterLink(Button)

class ItemCard extends Component {

    render() {
        let item = this.props.item
        let meta = item._meta || {}
        let name = meta.fullName
        let id = item._id
        let itemTypeName = ItemTypesNames[item._type]
        let to = '/dashboard/' + this.props.side + '/' + itemTypeName + '/' + id
        let imageSrc = Item.getImgUrl(meta.img, process.env.IPFS_GATEWAY) || ''

        const { classes, t } = this.props
        return (
            <Card
                raised={false}
                className={classes.card}
            >
                <RRCardMedia
                    to={to}
                    classes={{ root: classes.mediaRoot }}
                    image={NO_IMAGE}
                >
                    <Img
                        className={classes.img}
                        src={imageSrc} alt={name}
                    />
                </RRCardMedia>

                <CardContent>
                    <Typography
                        variant="headline"
                        component="h2"
                        noWrap
                    >
                        {meta.fullName}
                    </Typography>
                    <Typography component="p">
                        {itemAdTypeLabel({ adType: item._meta.adType })}  {itemAdSizeLabel({ size: item._meta.size, t: t })}
                    </Typography>
                </CardContent>

                <CardActions
                    classes={
                        { root: classes.actionsRoot }
                    }
                >
                    <Tooltip
                        enterDelay={300}
                        id={'tooltip-view-item' + item._id}
                        leaveDelay={300}
                        title={this.props.t('GO_' + itemTypeName.toUpperCase(), { args: [name] })}
                    >
                        <RRButton
                            to={to}
                            size="small"
                            color="primary"
                        >
                            {'view'}
                        </RRButton>
                    </Tooltip>

                    {this.props.renderActions()}
                </CardActions>
            </Card>
        )
    }
}

ItemCard.propTypes = {
    item: PropTypes.object.isRequired,
    renderActions: PropTypes.func,
    props: PropTypes.string,
}

export default withStyles(styles)(Translate(ItemCard))
