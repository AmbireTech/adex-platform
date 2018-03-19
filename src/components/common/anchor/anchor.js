import React from 'react'

const getUrl = (url) => {

	url = url.replace(/^(https?:)?\/\//i, '//')

	return url
}

const Anchor = ({href, target, children, ...rest}) => {
    let url = target && target === '_blank' ?  getUrl(href) : href
    return (
        <a 
            draggable='false'
            rel='noopener noreferrer'
            {...rest}
            href={url}
        >
            { children }
        </a>
    )
}

export default Anchor