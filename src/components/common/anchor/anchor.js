import React from 'react'

const getUrl = (url) => {

    url = (url || '').replace(/^(https?:)?\/\//i, '')
    if(url) {
        url = '//' + url
    }

	return url
}

const Anchor = ({href, target, children, ...rest}) => {
    let url = target && target === '_blank' ?  getUrl(href) : href
    return (
        <a 
            draggable='false'
            rel='noopener noreferrer'
            {...rest}
            target={target}
            href={url}
        >
            { children }
        </a>
    )
}

export default Anchor