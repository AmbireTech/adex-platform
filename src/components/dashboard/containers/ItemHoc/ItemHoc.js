import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import ImgDialog from 'components/dashboard/containers/ImgDialog'
import { Models } from 'adex-models'
import { Item as ItemModel } from 'adex-models'
import classnames from 'classnames'
import { Prompt } from 'react-router'
import Translate from 'components/translate/Translate'
import { items as ItemsConstants } from 'adex-constants'
import Img from 'components/common/img/Img'
import SaveBtn from 'components/dashboard/containers/SaveBtn'
import { withStyles } from '@material-ui/core/styles'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment'
import FormControl from '@material-ui/core/FormControl'
import Paper from '@material-ui/core/Paper'
import InfoOutlineIcon from '@material-ui/icons/InfoOutline'
import Chip from '@material-ui/core/Chip'
import FormHelperText from '@material-ui/core/FormHelperText'
import { styles } from './styles'

const { ItemTypesNames, ItemTypeByTypeId, AdSizesByValue } = ItemsConstants

export default function ItemHoc(Decorated) {
    class Item extends Component {
        constructor(props) {
            super(props)
            this.save = this.save.bind(this)
            this.state = {
                activeFields: {},
                item: null,
                initialItemState: {},
                dirtyProps: [],
                editImg: false,
                itemModel: Item,
                _activeInput: null
            }
        }

        updateNav = (item = {}) => {
            this.props.actions.updateNav('navTitle', this.props.t(ItemTypesNames[item._type]) + ' > ' + item.fullName)
        }

        componentWillMount() {
            let item = this.props.item
            if (!item) {
                return
            }

            let model = Models.itemClassByTypeId[item._type]
            let initialItemState = new model(item)

            this.setState({ item: { ...item }, initialItemState: initialItemState, itemModel: model })
            this.updateNav(initialItemState)
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

            this.updateNav(nexItemInst)
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
            let canEdit = ItemTypeByTypeId[item.type] === 'collection'
            let imgSrc = item.meta.img.tempUrl || ItemModel.getImgUrl(item.meta.img, process.env.IPFS_GATEWAY) || ''
            let { validations, classes, t, ...rest } = this.props

            return (
                <div>
                    <Prompt
                        when={!!this.state.dirtyProps.length}
                        message={t('UNSAVED_CHANGES_ALERT')}
                    />

                    <div >
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
                    </div>
                    <div>
                        {!!this.state.dirtyProps.length &&
                            <div
                                className={classes.changesLine}
                            >
                                <InfoOutlineIcon className={classes.buttonLeft} />
                                <span className={classes.buttonLeft}>
                                    {t('UNSAVED_CHANGES')}:
                                    </span>
                                {this.state.dirtyProps.map((p) => {
                                    return (
                                        <Chip
                                            className={classes.changeChip}
                                            key={p}
                                            label={t(p, { isProp: true })}
                                            onDelete={() => this.returnPropToInitialState(p)}
                                        />)
                                })}
                            </div>
                        }
                    </div>
                    <div>
                        <Grid container spacing={16} >
                            <Grid item xs={12} sm={12} md={12} lg={7}>
                                <div>
                                    <FormControl
                                        fullWidth
                                        className={classes.textField}
                                        margin='dense'
                                    >
                                        <InputLabel >{t('fullName', { isProp: true })}</InputLabel>
                                        <Input
                                            fullWidth
                                            autoFocus
                                            type='text'
                                            name={t('fullName', { isProp: true })}
                                            value={item.fullName}
                                            onChange={(ev) => this.handleChange('fullName', ev.target.value)}
                                            maxLength={1024}
                                            onBlur={(ev) => this.setActiveFields('fullName', false)}
                                            disabled={!this.state.activeFields.fullName}
                                            endAdornment={canEdit &&
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        // size='small'
                                                        color='secondary'
                                                        className={classes.buttonRight}
                                                        onClick={(ev) => this.setActiveFields('fullName', true)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                        />
                                    </FormControl>
                                </div>
                                <div>
                                    <FormControl
                                        margin='dense'
                                        fullWidth
                                        className={classes.textField}
                                    >
                                        <InputLabel htmlFor="adornment-password">{t('description', { isProp: true })}</InputLabel>
                                        <Input
                                            fullWidth
                                            autoFocus
                                            multiline
                                            rows={3}
                                            type='text'
                                            name='description'
                                            value={item.description || ''}
                                            onChange={(ev) => this.handleChange('description', ev.target.value)}
                                            maxLength={1024}
                                            onBlur={(ev) => this.setActiveFields('description', false)}
                                            disabled={!this.state.activeFields.description}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        // size='small'
                                                        color='secondary'
                                                        className={classes.buttonRight}
                                                        onClick={(ev) => this.setActiveFields('description', true)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                        />
                                        {!item.description &&
                                            <FormHelperText >
                                                {t('NO_DESCRIPTION_YET')}
                                            </FormHelperText >
                                        }
                                    </FormControl>
                                </div>
                            </Grid >
                            <Grid item xs={12} sm={12} md={12} lg={5}>

                                {this.props.showLogo &&
                                    <div style={{ width: 270 }}>
                                        <Paper
                                            className={classnames(classes.mediaRoot, classes.imgContainer)}
                                        >
                                            <Img
                                                src={imgSrc}
                                                alt={item.fullName}
                                                onClick={this.handleToggle}
                                                className={classnames(classes.img, { [classes.pointer]: this.props.canEditImg })}
                                            />
                                        </Paper>
                                    </div>
                                }
                            </Grid >
                        </Grid>
                    </div>
                    <div>
                        <SaveBtn
                            spinnerId={'update' + item._id}
                            validationId={'update-' + item._id}
                            returnPropToInitialState={this.returnPropToInitialState}
                            dirtyProps={this.state.dirtyProps}
                            save={this.save}
                        />
                    </div>

                    <div>
                        <Decorated
                            {...rest}
                            t={t}
                            inEdit={!!this.state.dirtyProps.length}
                            item={item}
                            save={this.save}
                            handleChange={this.handleChange}
                            toggleImgEdit={this.handleToggle.bind(this)}
                            activeFields={this.state.activeFields}
                            setActiveFields={this.setActiveFields.bind(this)}
                        />
                    </div>
                </div >
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

            if (!!item && item._ipfs && !!ipfs && item._ipfs === ipfs) {
                return item
            }
        }

        return null
    }

    function mapStateToProps(state, props) {
        const persist = state.persist
        // const memory = state.memory
        const items = persist.items[props.itemType]
        const id = props.match.params.itemId
        let item = items[id]

        if (!item && (props.itemType !== undefined)) {
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
    )(withStyles(styles)(Translate(Item)))
}
