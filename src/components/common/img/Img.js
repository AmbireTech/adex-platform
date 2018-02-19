import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NO_IMAGE from 'resources/no-image-box.png'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import theme from './theme.css'

const MAX_IMG_LOAD_TIME = 3000

class Img extends Component {

    constructor(props) {
        super(props)
        this.state = {
            imgSrc: null
        }

        this.setDisplayImage = this.setDisplayImage
        this.loadTimeout = null
    }

    componentDidMount() {
        this.displayImage = new window.Image()
        this.setDisplayImage({ image: this.props.src, fallback: this.props.fallbackSrc || NO_IMAGE })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.src !== this.props.src) {
            this.setDisplayImage({ image: nextProps.src, fallback: nextProps.fallbackSrc || NO_IMAGE })
        }
    }

    componentWillUnmount() {
        if (this.displayImage) {
            this.displayImage.onerror = null;
            this.displayImage.onload = null;
            this.displayImage = null;
        }
    }

    setDisplayImage = ({ image, fallback }) => {
        this.loadTimeout = setTimeout(() => {
            this.setState({
                imgSrc: fallback || null
            })
        }, MAX_IMG_LOAD_TIME)

        this.displayImage.onerror = () => {
            clearTimeout(this.loadTimeout)
            this.setState({
                imgSrc: fallback || null
            })
        }
        this.displayImage.onload = () => {
            clearTimeout(this.loadTimeout)
            this.setState({
                imgSrc: image
            })
        }

        this.displayImage.src = image
    }

    render() {
        let { alt, ...other } = this.props
        return (
            this.state.imgSrc ?
                <img {...other} alt={alt} src={this.state.imgSrc} />
                :
                <div className={theme.imgLoading}>
                    <ProgressBar theme={theme} type='circular' mode='indeterminate' />
                </div>
        )
    }
}

Img.propTypes = {
    src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    fallbackSrc: PropTypes.string,
    alt: PropTypes.string
}

export default Img
