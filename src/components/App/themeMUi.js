import React from 'react'
import { createMuiTheme } from '@material-ui/core/styles'
import indigo from '@material-ui/core/colors/indigo'
import pink from '@material-ui/core/colors/pink'
import lime from '@material-ui/core/colors/lime'
import deepOrange from '@material-ui/core/colors/deepOrange'

const palette = {
    primary: indigo,
    secondary: pink,
    error: deepOrange,
    first: lime,
    contrastThreshold: 3,
    tonalOffset: 0.2,
}

export const themeMUI = createMuiTheme({
    palette: { ...palette },
    overrides: {
        MuiButton: {
            root: {
                borderRadius: 0
            },
            outlined: {
                borderRadius: 0
            }
        },
        MuiTableCell: {
            head: {
               whiteSpace: 'nowrap' 
            },
            root: {
                whiteSpace: 'nowrap'
            }
        }
        // MuiStepIcon: {
        //     root: {
        //         color: 'yellow',
        //         '&$active': {
        //             color: 'orange'
        //         }
        //     },
        //     active: {
        //         color: 'yellow'
        //     }
        // }
    },
})