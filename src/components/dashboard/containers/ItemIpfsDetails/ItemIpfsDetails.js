import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Grid from '@material-ui/core/Grid'
import { items as ItemsConstants } from 'adex-constants'
import { Item } from 'adex-models'
import Img from 'components/common/img/Img'
import { PropRow, ContentBox, ContentBody, FullContentSpinner } from 'components/common/dialog/content'
import Anchor from 'components/common/anchor/anchor'
import { Item as ItemModel } from 'adex-models'
import UnitTargets from 'components/dashboard/containers/UnitTargets'

const { AdSizesByValue, AdTypesByValue, ItemsTypes } = ItemsConstants

export class ItemIpfsDetails extends Component {

	constructor(props) {
		super(props)
		this.state = {
			details: null,
			itemIpfsUrl: Item.getIpfsMetaUrl(this.props.itemIpfs, process.env.IPFS_GATEWAY)
		}
	}

	componentWillMount() {
		if (this.props.details) {
			this.setState({ details: this.props.details })
		} else {
			this.props.actions.updateSpinner(this.props.itemIpfs, true)

			fetch(this.state.itemIpfsUrl)
				.then((res) => {
					return res.json()
				})
				.then((res) => {
					this.setState({ details: res })
					this.props.actions.updateSpinner(this.props.itemIpfs, false)
				})
				.catch((err) => {
					console.log('err', err)
				})
		}
	}

    itemDetails = ({ details = {}, t } = {}) => {
    	return (
    		<Grid container spacing={8} >
    			<PropRow
    				left={t('PROP_FULLNAME')}
    				right={details.fullName}
    			/>
    			<PropRow
    				left={t('PROP_OWNER')}
    				right={<Anchor target='_blank' href={process.env.ETH_SCAN_ADDR_HOST + details.owner} > {details.owner || '-'} </Anchor>}
    			/>
    			<PropRow
    				left={t('PROP_ADTYPE')}
    				right={AdTypesByValue[details.adType].label}
    			/>
    			<PropRow
    				left={t('PROP_SIZE')}
    				right={t(AdSizesByValue[details.size].label, { args: AdSizesByValue[details.size].labelArgs })}
    			/>
    			<PropRow
    				left={t('PROP_AD_URL')}
    				right={<Anchor target='_blank' href={details.ad_url} > {details.ad_url || '-'} </Anchor>}
    			/>
    			{details.type === ItemsTypes.AdUnit.id &&
                    <PropRow
                    	left={t('UNIT_BANNER_IMG_LABEL')}
                    	right={<Img allowFullscreen={true} className={''} src={ItemModel.getImgUrl(details.img, process.env.IPFS_GATEWAY) || ''} alt={details.fullName} />}
                    />
    			}

    			{(!!details.type === ItemsTypes.AdUnit.id && details.targets) &&
                    <PropRow
                    	left={t('targets', { isProp: true })}
                    	right={<UnitTargets targets={details.targets} t={t} />}
                    />
    			}

    		</Grid>
    	)
    }

    reportDetails = ({ report = {}, t } = {}) => {
    	return (
    		<Grid container spacing={8} >
    			<PropRow
    				left={t('PROP_BIDID')}
    				right={report.bidId}
    			/>
    			<PropRow
    				left={t('PROP_ADVERTISER')}
    				right={<Anchor target='_blank' href={process.env.ETH_SCAN_ADDR_HOST + report.advertiser} > {report.advertiser || '-'} </Anchor>}
    			/>
    			<PropRow
    				left={t('PROP_PUBLISHER')}
    				right={<Anchor target='_blank' href={process.env.ETH_SCAN_ADDR_HOST + report.publisher} > {report.publisher || '-'} </Anchor>}
    			/>
    			<PropRow
    				left={t('PROP_ADUNITIPFS')}
    				right={<Anchor target='_blank' href={Item.getIpfsMetaUrl(report.adUnitIpfs, process.env.IPFS_GATEWAY)} >{report.adUnitIpfs}</Anchor>}
    			/>
    			<PropRow
    				left={t('PROP_ADSLOTIPFS')}
    				right={<Anchor target='_blank' href={Item.getIpfsMetaUrl(report.adSlotIpfs, process.env.IPFS_GATEWAY)} >{report.adSlotIpfs}</Anchor>}
    			/>
    			<PropRow
    				left={t('PROP_ALLCLICKS')}
    				right={report.allClicks}
    			/>
    			<PropRow
    				left={t('PROP_VERIFIEDUNIQUECLICKS')}
    				right={report.verifiedUniqueClicks}
    			/>
    		</Grid>
    	)
    }


    render() {
    	let t = this.props.t

    	const details = this.state.details

    	return (
    		<ContentBox>
    			{/* NOTE: show the ipfs link in case of long loading */}
    			<Grid container spacing={8} style={{ marginBottom: 8 }}>
    				<PropRow
    					left={t('IPFS')}
    					right={<Anchor target='_blank' href={this.state.itemIpfsUrl} > {this.props.itemIpfs} </Anchor>}
    				/>
    			</Grid>
    			{!!this.props.spinner || !details ?
    				<FullContentSpinner />
    				:
    				<ContentBody>
    					{this.props.detailsType === 'item' ?
    						<this.itemDetails details={details} t={t} /> : null
    					}
    					{this.props.detailsType === 'report' ?
    						<this.reportDetails report={details} t={t} /> : null
    					}
    				</ContentBody>
    			}
    		</ContentBox>

    	)
    }
}

ItemIpfsDetails.propTypes = {
	actions: PropTypes.object.isRequired,
	itemIpfs: PropTypes.string.isRequired,
}

function mapStateToProps(state, props) {
	// let persist = state.persist
	const memory = state.memory
	return {
		spinner: memory.spinners[props.itemIpfs],
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemIpfsDetails)
