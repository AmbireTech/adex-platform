import React from 'react';

// TODO; make it class with default props if needed
const ChannelIcon = ({ width, height, color, ...other }) => {

  const defaultSize = {
    width: 27.51,
    height: 27.49
  }

  return (
    <svg {...other}
      viewBox="0 0 27.51 27.49"
      width={(width || defaultSize.width) + 'px'}
      height={(height || defaultSize.height) + 'px'} >
      <title>channel</title>
      <g id="Layer_2" data-name="Layer 2">
        <g id="Layer_1-2" data-name="Layer 1">
          <path d="M26.12,21.25A3.46,3.46,0,0,0,22.31,21L19.2,18.71a6.06,6.06,0,0,0-4.13-8.5V6.65a3.46,3.46,0,1,0-2.73,0v3.57a6.06,6.06,0,0,0-4.11,8.55L5.2,21a3.46,3.46,0,1,0,1.63,2.18l3.11-2.32a6.06,6.06,0,0,0,7.57,0l3.16,2.36a3.46,3.46,0,1,0,5.44-2ZM13.71,19.48a3.35,3.35,0,1,1,3.35-3.35A3.35,3.35,0,0,1,13.71,19.48Z" />
        </g>
      </g>
    </svg>
  );
};

export default ChannelIcon;
