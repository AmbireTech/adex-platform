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
import Avatar from 'react-toolbox/lib/avatar'
import Input from 'react-toolbox/lib/input'
import { Models } from 'adex-models'
import FloatingProgressButton from 'components/common/floating_btn_progress/FloatingProgressButton'
import { Item as ItemModel } from 'adex-models'
import classnames from 'classnames'
import { Prompt } from 'react-router'
import Translate from 'components/translate/Translate'
import { items as ItemsConstants } from 'adex-constants'

const { ItemTypesNames, ItemTypeByTypeId } = ItemsConstants

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
                itemModel: Item
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

        componentWillReceiveProps(nextProps, nextState) {

            let currentItemInst = new this.state.itemModel(this.state.item)
            // Assume that the this.props.match.params.itemId can not be changed without remout of the component
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

        returnPropToInitalState = (propName) => {
            let initialItemStateValue = this.state.initialItemState[propName]
            let newItem = new this.state.itemModel(this.state.item)
            newItem[propName] = initialItemStateValue

            let dp = this.state.dirtyProps.filter((dp) => { return dp !== propName })

            this.setState({ item: newItem.plainObj(), dirtyProps: dp })
        }

        setActiveFields(field, value) {
            let newActiveFields = { ...this.state.activeFields }
            newActiveFields[field] = value
            this.setState({ activeFields: newActiveFields })
        }

        //TODO: Do not save if not dirty!
        save() {
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
            // let model = Models.itemClassByTypeId[this.state.item._type]
            let item = new this.state.itemModel(this.state.item) || {}
            let t = this.props.t
            let canEdit = ItemTypeByTypeId[item.type] === 'collection'
            // let imgSrc =  ItemModel.getImgUrl(item.meta.img, process.env.IPFS_GATEWAY)

            return (
                <div>
                    <Prompt
                        when={!!this.state.dirtyProps.length}
                        message={t('UNSAVED_CHANGES_ALERT')}
                    />

                    <div className={classnames(theme.heading, theme[ItemTypesNames[item._type || item._meta.type]])}>
                        <div className={theme.headingLeft}>
                            <Avatar title={item.fullName} cover onClick={this.handleToggle.bind(this)} />
                             {/* <ImgDialog 
                                imgSrc={imgSrc} 
                                handleToggle={this.handleToggle} 
                                active={this.state.editImg} 
                                onChangeReady={this.handleChange}
                                validateId={item._id}
                              /> */}
                            {canEdit && this.state.activeFields.fullName ?
                                <span>
                                    <span>
                                        <Input
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
                        <div className={classnames(theme.top, theme.right)}>

                            {!!this.props.spinner ?
                                null
                                : (
                                    this.state.dirtyProps.length ?
                                        (
                                            <div className={theme.itemStatus}>
                                                <TooltipFontIcon value='info_outline' tooltip={t('UNSAVED_CHANGES')} />
                                                {this.state.dirtyProps.map((p) => {
                                                    return (
                                                        <Chip
                                                            deletable
                                                            key={p}
                                                            onDeleteClick={this.returnPropToInitalState.bind(this, p)}
                                                        >
                                                            {t(p, { isProp: true })}
                                                        </Chip>)
                                                })}
                                            </div>
                                        ) : ''
                                )}
                            <FloatingProgressButton inProgress={!!this.props.spinner} theme={theme} icon='save' onClick={this.save} floating primary />
                        </div>

                    </div>

                    <div>
                        <Decorated
                            {...this.props}
                            inEdit={!!this.state.dirtyProps.length}
                            item={item}
                            save={this.save}
                            handleChange={this.handleChange}
                            toggleImgEdit={this.handleToggle.bind(this)}
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

    function mapStateToProps(state, props) {
        let persist = state.persist
        let memory = state.memory
        return {
            account: persist.account,
            item: persist.items[props.itemType][props.match.params.itemId],
            spinner: memory.spinners['update' + props.match.params.itemId]
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
