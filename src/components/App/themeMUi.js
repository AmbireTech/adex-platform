import React from 'react'
import { createMuiTheme } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import green from '@material-ui/core/colors/green'
import deepOrange from '@material-ui/core/colors/deepOrange'

const palette = {
    primary: blue,
    secondary: green,
    error: deepOrange,
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
        },
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