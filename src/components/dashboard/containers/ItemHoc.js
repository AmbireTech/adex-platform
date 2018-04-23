import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Chip from 'react-toolbox/lib/chip'
import { IconButton } from 'react-toolbox/lib/button'
import theme from './theme.css'
import FontIcon from 'react-toolbox/lib/font_icon'
import ImgDialog from './ImgDialog'
import Tooltip from 'react-toolbox/lib/tooltip'
import Input from 'react-toolbox/lib/input'
import { Models } from 'adex-models'
import FloatingProgressButton from 'components/common/floating_btn_progress/FloatingProgressButton'
import { Item as ItemModel } from 'adex-models'
import classnames from 'classnames'
import { Prompt } from 'react-router'
import Translate from 'components/translate/Translate'
import { items as ItemsConstants } from 'adex-constants'
import Img from 'components/common/img/Img'
import SaveBtn from './SaveBtn'

const { ItemTypesNames, ItemTypeByTypeId, AdSizesByValue } = ItemsConstants

const TooltipFontIcon = Tooltip(FontIcon)

export default function ItemHoc(Decorated) {
    class Item extends Component {
        constructor(props) {
            super(props)
            this.save = this.save.bind(this)
            this.state = {
                activeFields: {},
                item: {},
                initialItemState: {},
                dirtyProps: [],
                editImg: false,
                itemModel: Item,
                _activeInput: null
            }
        }

        componentWillMount() {
            let item = this.props.item
            if (!item) {
                return
            }

            let model = Models.itemClassByTypeId[item._type]
            let initialItemState = new model(item)

            this.setState({ item: { ...item }, initialItemState: initialItemState, itemModel: model })
        }

        // shouldComponentUpdate(nextProps, nextState) {
        //     let diffProps = JSON.stringify(this.props) !== JSON.stringify(nextProps)
        //     let diffState = JSON.stringify(this.state) !== JSON.stringify(nextState)
        //     return diffProps || diffState
        // }

        componentWillReceiveProps(nextProps, nextState) {
            let currentItemInst = new this.state.itemModel(this.state.item)
            // Assume that the this.props.match.params.itemId can not be changed without remount of the component
            // TODO: check the above
            let nextItem = nextProps.item
            let nexItemInst = new this.state.itemModel(nextItem)

            if (currentItemInst.modifiedOn !== nexItemInst.modifiedOn) {
                this.setState({ item: nexItemInst.plainObj(), initialItemState: nexItemInst, activeFields: {}, dirtyProps: [] })
            }
        }

        componentWillUnmount() {
            if (this.state.item) {
                this.props.actions.updateSpinner('update' + this.state.item._id, false)
            }
        }

        handleChange = (name, value) => {
            let newItem = new this.state.itemModel(this.state.item)
            newItem[name] = value

            let dp = this.state.dirtyProps.slice(0)

            if (dp.indexOf(name) < 0) {
                dp.push(name)
            }

            this.setState({ item: newItem.plainObj(), dirtyProps: dp })
        }

        returnPropToInitialState = (propName) => {
            let initialItemStateValue = this.state.initialItemState[propName]
            let newItem = new this.state.itemModel(this.state.item)
            newItem[propName] = initialItemStateValue

            let dp = this.state.dirtyProps.filter((dp) => { return dp !== propName })

            this.setState({ item: newItem.plainObj(), dirtyProps: dp })
            // TEMP fix, we assume that the initial values are validated
            this.props.actions.resetValidationErrors(this.state.item._id, propName)
        }

        setActiveFields = (field, value) => {
            let newActiveFields = { ...this.state.activeFields }
            newActiveFields[field] = value
            this.setState({ activeFields: newActiveFields })
        }

        //TODO: Do not save if not dirty!
        save = () => {
            if (this.state.dirtyProps.length && !this.props.spinner) {
                let item = { ...this.state.item }
                this.props.actions.updateItem({
                    item: item,
                    authSig: this.props.account._authSig
                })
                this.props.actions.updateSpinner('update' + item._id, true)
                this.setState({ dirtyProps: [] })
            }
        }

        isDirtyProp(prop) {
            return this.state.item.dirtyProps.indexOf(prop) > -1
        }

        handleToggle = () => {
            if (!this.props.canEditImg) return

            let active = this.state.editImg
            this.setState({ editImg: !active })
        }

        render() {
            if (!this.state.item) {
                return (<h1> No item found! </h1>)
            }
            /*
                * NOTE: using instance of the item, the instance is passes to the Unit, Slot, Channel and Campaign components,
                * in this case there is no need to make instance inside them
            */

            let item = new this.state.itemModel(this.state.item) || {}
            let t = this.props.t
            let canEdit = ItemTypeByTypeId[item.type] === 'collection'
            let imgSrc = item.meta.img.tempUrl || ItemModel.getImgUrl(item.meta.img, process.env.IPFS_GATEWAY) || ''
            let { validations, ...rest } = this.props

            return (
                <div>
                    <Prompt
                        when={!!this.state.dirtyProps.length}
                        message={t('UNSAVED_CHANGES_ALERT')}
                    />

                    <div className={classnames(theme.heading, theme[ItemTypesNames[item._type || item._meta.type]])}>
                        <div className={theme.headingLeft}>
                            <Img src={imgSrc} alt={item.fullName} onClick={this.handleToggle} className={classnames(theme.avatar, { [theme.pointer]: this.props.canEditImg })} />

                            <ImgDialog
                                {...this.props}
                                imgSrc={imgSrc}
                                handleToggle={this.handleToggle}
                                active={this.state.editImg}
                                onChangeReady={this.handleChange}
                                validateId={item._id}
                                width={this.props.updateImgWidth || (AdSizesByValue[item.size] || {}).width}
                                height={this.props.updateImgHeight || (AdSizesByValue[item.size] || {}).height}
                                title={t(this.props.updateImgLabel)}
                                additionalInfo={t(this.props.updateImgInfoLabel)}
                                exact={this.props.updateImgExact}
                                errMsg={this.props.updateImgErrMsg}
                                imgPropName='img'
                            />
                            {canEdit && this.state.activeFields.fullName ?
                                <span>
                                    <span>
                                        <Input
                                            autoFocus
                                            className={theme.itemName}
                                            type='text'
                                            label={t('fullName', { isProp: true })}
                                            name='fullName'
                                            value={item.fullName}
                                            onChange={this.handleChange.bind(this, 'fullName')}
                                            maxLength={128}
                                            onBlur={this.setActiveFields.bind(this, 'fullName', false)}
                                        />
                                    </span>
                                </span>
                                :
                                <h3 className={theme.itemName}>
                                    <span> {item.fullName} </span>
                                    {canEdit ?
                                        <span>
                                            <IconButton
                                                theme={theme}
                                                icon='edit'
                                                accent
                                                onClick={this.setActiveFields.bind(this, 'fullName', true)}
                                            />
                                        </span>
                                        : null}
                                </h3>
                            }
                        </div>
                    </div>
                    <div>
                        <div className={classnames(theme.top, theme.left)}>

                            {this.state.activeFields.description ?
                                <Input
                                    autoFocus
                                    multiline
                                    rows={3}
                                    type='text'
                                    label={t('description', { isProp: true })}
                                    name='description'
                                    value={item.description}
                                    onChange={this.handleChange.bind(this, 'description')}
                                    maxLength={1024}
                                    onBlur={this.setActiveFields.bind(this, 'description', false)}
                                />
                                :
                                <div>
                                    <p>
                                        {item.description ?
                                            item.description
                                            :
                                            <span style={{ opacity: 0.3 }}> {t('NO_DESCRIPTION_YET')}</span>
                                        }
                                        <span>
                                            <IconButton
                                                theme={theme}
                                                icon='edit'
                                                accent
                                                onClick={this.setActiveFields.bind(this, 'description', true)}
                                            />
                                        </span>
                                    </p>

                                </div>
                            }

                        </div>
                        <SaveBtn
                            spinnerId={'update-' + item._id}
                            validationId={'update-' + item._id}
                            returnPropToInitialState={this.returnPropToInitialState}
                            dirtyProps={this.state.dirtyProps}
                            save={this.save}
                        />
                    </div>

                    <div>
                        <Decorated
                            {...rest}
                            inEdit={!!this.state.dirtyProps.length}
                            item={item}
                            save={this.save}
                            handleChange={this.handleChange}
                            toggleImgEdit={this.handleToggle.bind(this)}
                            activeFields={this.state.activeFields}
                            setActiveFields={this.setActiveFields.bind(this)}
                        />
                    </div>
                </div>
            )
        }
    }

    Item.propTypes = {
        actions: PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        item: PropTypes.object.isRequired,
        spinner: PropTypes.bool
    }

    const tryGetItemByIpfs = ({ items, ipfs }) => {

        let keys = Object.keys(items)

        for (let index = 0; index < keys.length; index++) {
            const key = keys[index]
            const item = items[key]

            if (item._ipfs === ipfs) {
                return item
            }

        }

        return null
    }

    function mapStateToProps(state, props) {
        let persist = state.persist
        // let memory = state.memory
        const items = persist.items[props.itemType]
        const id = props.match.params.itemId
        let item = items[id]

        if (!item && props.itemType) {
            item = tryGetItemByIpfs({ items: items, ipfs: id })
        }

        return {
            account: persist.account,
            item: item
        }
    }

    function mapDispatchToProps(dispatch) {
        return {
            actions: bindActionCreators(actions, dispatch)
        }
    }

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(Translate(Item))
}
