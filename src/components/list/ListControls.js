import React, { Component } from 'react'
import Autocomplete from 'react-toolbox/lib/autocomplete'
import { IconButton, Button } from 'react-toolbox/lib/button'

export const PAGE_SIZES = [
    { value: 5, label: 5 },
    { value: 10, label: 10 },
    { value: 20, label: 20 },
    { value: 46, label: 46 },
]

export const Pagination = (props) => {

    return (
        <div style={{ display: 'inline-block' }}>

            <IconButton
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
                disabled={!(props.page < (props.pages - 1))}
                icon='chevron_right'
                onClick={props.goToNextPage} />

            <span> of </span>
            <span> {props.pages} </span>
            <span>  / Page size: </span>
            {
                PAGE_SIZES.map((page, index) =>
                    <Button
                        key={index}
                        floating
                        mini
                        label={page.value + ''}
                        value={page.value}
                        onClick={props.changePageSize}
                        accent={page.value === props.pageSize}
                        style={(page.value === props.pageSize) && (page.value === 46) ? {background: '#0000cf', color: '#D4FF00'} : null}
                    />
                )
            }
        </div >)

}


const getAllPagedValues = (current, max) => {
    let pages = {}

    for (var index = 0; index < max; index++) {
        pages[index + ''] = index + 1 + ''
    }

    return pages
}
