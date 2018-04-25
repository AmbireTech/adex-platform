import React from 'react'
import theme from './theme.css'
import classnames from 'classnames'

const RectWithText = ({ width, height, color, text, className = '', ...other }) => {

  const defaultSize = {
    width: 24,
    height: 24
  }

  return (
    <svg {...other}
      viewBox='0 0 24 24'
      preserveAspectRatio='xMinYMin meet'
      width={(width || defaultSize.width) + 'px'}
      height={(height || defaultSize.height) + 'px'}
      className={classnames(className, theme.svg)}
    >
      <g>
        <rect 
          width={width || defaultSize.width} 
          height={height || defaultSize.height} 
          className={classnames(className, theme.rect)}
          ry='3'
          rx='3'
         />
        <text 
          x='50%' 
          y='50%' 
          textAnchor='middle'
          alignmentBaseline='central'
          dominantBaseline ='central'
          className={classnames(className, theme.text)}
        >{text}</text>
      </g>
    </svg>
  )
}

export default RectWithText
