import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Chip from 'react-toolbox/lib/chip'
import { Button, IconButton } from 'react-toolbox/lib/button'
import theme from './theme.css'
import FontIcon from 'react-toolbox/lib/font_icon'
import Tooltip from 'react-toolbox/lib/tooltip'
import Avatar from 'react-toolbox/lib/avatar'
import Input from 'react-toolbox/lib/input'
import { Base, Item as ItemModel, Models } from 'adex-models'
import FloatingProgressButton from 'components/common/floating_btn_progress/FloatingProgressButton'
import classnames from 'classnames'
import ImgDialog from './ImgDialog'
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
                dirtyProps: [],
                editImg: false
            }
        }

        componentDidUpdate(prevProps, prevState) {
            let itemId = this.props.match.params.itemId
            let item = this.props.items[itemId]
            let prevItem = prevProps.items[itemId]

            if ((item._meta.modifiedOn && prevItem._meta.modifiedOn) && (item._meta.modifiedOn !== prevItem._meta.modifiedOn)) {
                this.props.actions.updateSpinner(ItemTypesNames[this.state.item._type], false)
                this.setState({ activeFields: {}, dirtyProps: [] })
            }
        }

        componentWillMount() {
            this.setState({ item: this.props.items[this.props.match.params.itemId] })
        }

        componentWillReceiveProps(nextProps) {
            if (!nextProps.spinner) {
                this.setState({ item: nextProps.items[nextProps.match.params.itemId] })
            }
        }

        componentWillUnmount() {
            if (this.state.item) {
                this.props.actions.updateSpinner(ItemTypesNames[this.state.item._type], false)
            }
        }

        // handleChange = (name, value) => {
        //     let newItem = Base.updateMeta(this.state.item, { [name]: value }, this.state.dirtyProps || [])
        //     this.setState({ item: newItem, dirtyProps: newItem.dirtyProps })
        // }

        handleChange = (name, value) => {
            let newItem = Base.updateObject({
                item: this.state.item,
                meta: { [name]: value },
                dirtyProps: this.state.dirtyProps || [],
                objModel: this.props.objModel
            })
            this.setState({ item: newItem, dirtyProps: newItem.dirtyProps })
        }

        setActiveFields(field, value) {
            let newActiveFields = { ...this.state.activeFields }
            newActiveFields[field] = value
            this.setState({ activeFields: newActiveFields })
        }

        //TODO: Do not save if not dirty!
        save() {
            if (this.state.dirtyProps.length && !this.props.spinner) {
                this.props.actions.updateItem({
                    item: this.state.item,
                    newMeta: this.state.item._meta,
                    objModel: this.props.objModel
                })
                this.props.actions.updateSpinner(ItemTypesNames[this.state.item._type], true)
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
            let model = Models.itemClassByTypeId[this.state.item._type]
            let item = new model(this.state.item) || {}
            let imgSrc = item.imgUrl
            let t = this.props.t
            let canEdit = ItemTypeByTypeId[item.type] === 'collection'

            return (
                <div>
                    <Prompt
                        when={!!this.state.dirtyProps.length}
                        message={t('UNSAVED_CHANGES_ALERT')}
                    />

                    <div className={classnames(theme.heading, theme[ItemTypesNames[item._type]])}>
                        <div className={theme.headingLeft}>
                            <Avatar image={imgSrc} title={item.fullName} cover onClick={this.handleToggle.bind(this)} />
                            <ImgDialog imgSrc={imgSrc} handleToggle={this.handleToggle} active={this.state.editImg} onChange={this.handleChange.bind(this, 'img')} />
                            {canEdit && this.state.activeFields.fullName ?
                                <Input className={theme.itemName} type='text' label={t('fullName', { isProp: true })} name='fullName' value={item.fullName} onChange={this.handleChange.bind(this, 'fullName')} maxLength={128} />
                                :
                                <h3 className={theme.itemName}>
                                    <span> {item.fullName} </span>
                                    {canEdit ?
                                        <span><IconButton theme={theme} icon='edit' accent onClick={this.setActiveFields.bind(this, 'fullName', true)} /></span>
                                        : null}
                                </h3>
                            }
                        </div>
                    </div>
                    <div>
                        <div className={classnames(theme.top, theme.left)}>


                            {this.state.activeFields.description ?
                                <Input multiline rows={3} type='text' label={t('description', { isProp: true })} name='description' value={item.description} onChange={this.handleChange.bind(this, 'description')} maxLength={1024} />
                                :
                                <div>
                                    <p>
                                        {item.description ?
                                            item.description
                                            :
                                            <span> {t('NO_DESCRIPTION_YET')}</span>
                                        }
                                        <span>
                                            <IconButton theme={theme} icon='edit' accent onClick={this.setActiveFields.bind(this, 'description', true)} />
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
                                                    return (<Chip key={p}>{t(p, { isProp: true })}</Chip>)
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
                            item={item}
                            save={this.save}
                            handleChange={this.handleChange}
                            toggleImgEdit={this.handleToggle.bind(this)}
                        />
                    </div>
                    {/* <pre> {JSON.stringify(item, null, 2)} </pre> */}

                </div>
            )
        }
    }

    Item.propTypes = {
        actions: PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        items: PropTypes.object.isRequired,
        spinner: PropTypes.bool,
        // objModel: PropTypes.func.isRequired
    }

    function mapStateToProps(state, props) {
        let persist = state.persist
        let memory = state.memory
        return {
            account: persist.account,
            items: persist.items[props.itemType]
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

    return Translate(Item)
}
