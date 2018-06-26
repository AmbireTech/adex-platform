import React, { Component } from 'react'
import PublisherLogo from 'components/common/icons/AdexPublisher'
import AdvertiserLogo from 'components/common/icons/AdexAdvertiser'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import Translate from 'components/translate/Translate'
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const SideBox = ({ salePoints = [], linkTitle, icon, title, disabled, classes, ...other }) => (
  <div {...other} className={classnames(classes.sideBox, { [classes.disabled]: disabled })} >
    <div className={classes.icon}>
      {icon}
    </div>
    <h2>{title}</h2>
    <ul className={classes.salePoints}>
      {salePoints.map(function (point, key) {
        return (<li key={key}> {point} </li>)
      })}
    </ul>
  </div >
)

const RRSideBox = withReactRouterLink(SideBox)

class SideSelect extends Component {

  render() {
    let { t, classes } = this.props
    return (
      <Dialog
        open={true}
        classes={{ paper: classes.dialogPaper }}
        BackdropProps={{
          classes: {
            root: classes.backdrop
          }
        }}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle >
          {t('CHOOSE_SIDE')}
        </DialogTitle>
        <DialogContent>

          <RRSideBox
            classes={classes}
            title={t('ADVERTISER')}
            icon={<AdvertiserLogo style={{ width: 110, height: 110 }} color='primary' />}
            salePoints={[t('SALE_POINT_ADV_1'), t('SALE_POINT_ADV_2'), t('SALE_POINT_ADV_3')]}
            to='/dashboard/advertiser'
            linkTitle={t('GO_ADVERTISER')}
          // disabled
          />

          <RRSideBox
            classes={classes}
            title={t('PUBLISHER')}
            icon={<PublisherLogo style={{ width: 110, height: 110 }} color='primary' />}
            salePoints={[t('SALE_POINT_PUB_1'), t('SALE_POINT_PUB_2'), t('SALE_POINT_PUB_3')]}
            to='/dashboard/publisher'
            linkTitle={t('GO_PUBLISHER')}
          // disabled
          />

        </DialogContent>
      </Dialog>
    )
  }
}

export default Translate(withStyles(styles)(SideSelect))
