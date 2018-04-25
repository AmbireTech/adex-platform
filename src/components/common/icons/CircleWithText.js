import React from 'react'
import theme from './theme.css'
import classnames from 'classnames'

const CircleWithText = ({ width, height, color, text, className = '', ...other }) => {

  const defaultSize = {
    width: 24,
    height: 24
  }

  return (
    <svg {...other}
      viewBox="0 0 24 24"
      preserveAspectRatio="xMinYMin meet"
      width={(width || defaultSize.width) + 'px'}
      height={(height || defaultSize.height) + 'px'}
      className={classnames(className, theme.svg)}
    >
      <g>
        <circle r="50%" cx="50%" cy="50%" className={classnames(className, theme.circle)} />
        <text 
          x="50%" 
          y="50%" 
          textAnchor="middle" 
          alignmentBaseline="central"
          dominantBaseline ="central"
          // dy="0.33em" 
          className={classnames(className, theme.text)}
        >{text}</text>
      </g>
    </svg>
  )
}

export default CircleWithText
