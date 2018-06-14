import React from 'react'
import Slider from '@material-ui/lab/Slider'
import theme from './theme.css'
import classnames from 'classnames'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'
import Dropdown from 'components/common/dropdown'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

export const PAGE_SIZES = [
    { value: 5, label: 5 },
    { value: 10, label: 10 },
    { value: 20, label: 20 },
    { value: 46, label: 46 },
]

const pagination = (props) => {

    const { classes, className } = props
    return (
        <div
            className={classes.flexRow}
        >
            <div
                className={classnames(classes.flexRow, className)}
            >
                <IconButton
                    color='primary'
                    disabled={!(props.page > 0 && props.pages > props.page)}
                    onClick={props.goToPrevPage} >
                    <ChevronLeft />
                </IconButton>

                <div className={theme.paginationInput}>
                    <Dropdown
                        label={props.t('LIST_CONTROL_LABEL_PAGE')}
                        onChange={props.goToPage}
                        source={getAllPagedValues(props.page, props.pages)}
                        // hint={props.page + 1 + ''}
                        value={props.page + ''}
                    // suggestionMatch='anywhere'
                    // showSuggestionsWhenValueIsSet={true}
                    />
                </div>

                <IconButton
                    color='primary'
                    disabled={!(props.page < (props.pages - 1))}
                    onClick={props.goToNextPage}
                >
                    <ChevronRight />
                </IconButton>

                <span className={classnames(theme.pageOf, theme.ellipsis)}> {props.t('LIST_CONTROL_LABEL_PAGE_OF', { args: [props.pages] })} </span>
            </div>
            <div className={theme.paginationSlider} >
                <label className={classnames(theme.sliderLabel, theme.ellipsis)}> {props.t('LIST_CONTROL_LABEL_PAGE_SIZE')} <strong>{props.pageSize}</strong> </label>
                <Slider pinned snaps min={5} max={25} step={5} value={props.pageSize} onChange={props.changePageSize} />
            </div>
        </div>
    )
}

export const Pagination = withStyles(styles)(pagination)

const getAllPagedValues = (current, max) => {
    // let pages = {}

    // for (var index = 0; index < max; index++) {
    //     pages[index + ''] = index + 1 + ''
    // }

    let pages = []

    for (var index = 0; index < max; index++) {
        pages.push({ value: index + '', label: index + 1 + '' })
    }

    return pages
}