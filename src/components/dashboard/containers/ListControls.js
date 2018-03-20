import React from 'react'
import Autocomplete from 'react-toolbox/lib/autocomplete'
import { IconButton } from 'react-toolbox/lib/button'
import Slider from 'react-toolbox/lib/slider'
import FontIcon from 'react-toolbox/lib/font_icon'
import theme from './theme.css'

export const PAGE_SIZES = [
    { value: 5, label: 5 },
    { value: 10, label: 10 },
    { value: 20, label: 20 },
    { value: 46, label: 46 },
]

export const Pagination = (props) => {

    return (
        <div>
            <div style={{ display: 'inline-block', width: 196 }}>
                <IconButton
                    primary
                    disabled={!(props.page > 0 && props.pages > props.page)}
                    icon='chevron_left'
                    onClick={props.goToPrevPage} />

                <div style={{ display: 'inline-block', width: 70 }}>
                    <Autocomplete
                        allowCreate={false}
                        direction="down"
                        label='page'
                        multiple={false}
                        onChange={props.goToPage}
                        source={getAllPagedValues(props.page, props.pages)}
                        hint={props.page + 1 + ''}
                        value={props.page + ''}
                        suggestionMatch='anywhere'
                        showSuggestionsWhenValueIsSet={true}
                    />
                </div>

                <IconButton
                    primary
                    disabled={!(props.page < (props.pages - 1))}
                    icon='chevron_right'
                    onClick={props.goToNextPage} />

                <span> of </span>
                <span> {props.pages} </span>
            </div>
            <div style={{ position: 'relative', display: 'inline-block', width: 'calc(100% - 196px)'}}>
                <label className={theme.sliderLabel}> Page size <strong>{props.pageSize}</strong> </label>
                <Slider pinned snaps min={5} max={25} step={5} value={props.pageSize} onChange={props.changePageSize} />
            </div>
        </div>
    )
}

const getAllPagedValues = (current, max) => {
    let pages = {}

    for (var index = 0; index < max; index++) {
        pages[index + ''] = index + 1 + ''
    }

    return pages
}

export const InputLabel = ({icon, label}) =>
    <div className={theme.inputLabel} ><FontIcon className={theme.inputLabelIcon} value={icon}/> <span className={theme.inputLabelValue}> {label} </span> </div>