import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewItemHoc from './NewItemHocStep'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import Autocomplete from 'components/common/autocomplete'
import { getTags } from 'services/adex-node/actions'

const noTagsErrMsg = 'ERR_REQUIRED_FIELD'

class NewItemFormTags extends Component {
    componentWillMount() {
        this.props.validate('tags', {isValid: this.props.item.meta.tags && this.props.item.meta.tags.length > 0, err: {msg: noTagsErrMsg}})                             
            getTags({authSig: this.props.account._authSig})
            .then((res) => {
                const tags = res.reduce((o, key) => ({ ...o, [key._id]: key._id}), {})

                this.props.actions.updateTags({tags: tags})
            })
    }
    
    addTagsForDisplay(tags) {
        if (!tags) {
            return null
        }
        tags.forEach(tag => {
            if (this.doesTagExist(tag)) {
                return null
            }
    
            this.props.actions.addNewTag({tag: tag})
        })
    }

    doesTagExist(tag) {
        return tag in this.props.tags
    }

    render() {
        if (!this.props.tags) {
            return null
        } else {
            return (
                <Grid item lg={12}>
                    <Autocomplete
                        id='tags-select'
                        direction='auto'
                        multiple
                        openOnClick
                        required
                        onChange={(value) => {
                            this.props.handleChange('tags', [...value])
                            this.props.validate('tags', {isValid: this.props.item.meta.tags && !!value.length, err: { msg: noTagsErrMsg}})
                            this.props.actions.addNewTag({tag: value[value.length - 1]})
                        }}
                        value={[...(this.props.item.meta.tags || [])]}
                        label={this.props.t('TAGS_LABEL')}
                        placeholder={this.props.t('TAGS_PLACEHOLDER')}
                        source={{...this.props.tags}}
                        showSuggestionsWhenValueIsSet={true}
                        allowCreate={true}
                    />
                </Grid>
            )
        }
    }
}


NewItemFormTags.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    title: PropTypes.string,
    tags: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
        tags: persist.tags
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

const ItemNewItemFormTags = NewItemHoc(NewItemFormTags)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(ItemNewItemFormTags))
