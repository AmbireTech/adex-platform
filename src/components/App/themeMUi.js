import React from 'react'
import { createMuiTheme } from '@material-ui/core/styles'

export const themeMUI = createMuiTheme({
    overrides: {
        MuiButton: {
            root: {
                borderRadius: 0
            },
        },
        MuiStepIcon: {
            root: {
                color: 'yellow',
                '&$active': {
                    color: 'orange'
                }
            },
            active: {
                color: 'yellow'
            }
        }
    },
})