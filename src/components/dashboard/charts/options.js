import Helper from 'helpers/miscHelpers'
import { defaults } from 'react-chartjs-2'
import merge from 'lodash.merge'

export const CHARTS_COLORS = ['#0277BD', '#03A9F4', '#00E676', '#FFAB00', '#FF5722', '#616161']

export let  CHARTS_COMMON_OPTIONS = {
    responsive: true,
    tooltips: {
        mode: 'label',
        cornerRadius: 2,
        backgroundColor: Helper.hexToRgbaColorString('#616161', 0.9)
    }
}

window.hoi = CHARTS_COMMON_OPTIONS

export const hexColorsToRgbaArray = (colors, alpha) => {
    return colors.map((color) => {
        return Helper.hexToRgbaColorString(color, alpha)
    })
}

merge(defaults, {global: CHARTS_COMMON_OPTIONS})
