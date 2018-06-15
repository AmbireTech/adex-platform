import React from 'react'
import Slider from '@material-ui/lab/Slider'
import theme from './theme.css'
import classnames from 'classnames'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'
import Dropdown from 'components/common/dropdown'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

export const PAGE_SIZES = [
    { value: 5, label: 5 },
    { value: 10, label: 10 },
    { value: 20, label: 20 },
    { value: 46, label: 46 },
]

const pagination = (props) => {

    const {
        page,
        pages,
        pageSize,
        classes,
        goToPrevPage,
        goToNextPage,
        goToPage,
        changePageSize,
        // className,
        t
    } = props
    return (
        <div
            className={classes.flexRow}
        >
            <div
                className={classnames(classes.flexItem, classes.flexRow)}
            >

                <div
                >
                    <Dropdown
                        label={t('LIST_CONTROL_LABEL_PAGE_OF', { args: [(page + 1), pages] })}
                        onChange={goToPage}
                        source={getAllPagedValues(page, pages)}
                        value={page + ''}
                        htmlId='page-size-select'
                    />
                </div>
                <IconButton
                    color='primary'
                    disabled={!(page > 0 && pages > page)}
                    onClick={goToPrevPage}
                    className={classes.rowButton}
                    size='small'
                >
                    <ChevronLeft />
                </IconButton>
                <IconButton
                    color='primary'
                    disabled={!(page < (pages - 1))}
                    onClick={goToNextPage}
                    className={classes.rowButton}
                    size='small'
                >
                    <ChevronRight />
                </IconButton>
            </div>
            <div
                className={classnames(classes.flexItem)}
            >
                <Typography noWrap id="page-size">{t('LIST_CONTROL_LABEL_PAGE_SIZE')} <strong>{pageSize}</strong> </Typography>
                <Slider aria-labelledby="page-size" min={5} max={25} step={5} value={pageSize} onChange={changePageSize} />
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