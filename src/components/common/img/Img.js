import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NO_IMAGE from 'resources/no-image-box.png'

class Img extends Component {

    constructor(props) {
        super(props);
        this.state = {
            imgSrc: props.fallbackSrc || NO_IMAGE
        };
        this.setDisplayImage = this.setDisplayImage.bind(this)
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

    setDisplayImage({ image, fallback }) {
        this.displayImage.onerror = () => {
            this.setState({
                imgSrc: fallback || null
            })
        }
        this.displayImage.onload = () => {
            this.setState({
                imgSrc: image
            })
        }

        this.displayImage.src = image
    }

    render() {
        return (
            <img alt={this.props.alt} src={this.state.imgSrc} />
        )
    }
}

Img.propTypes = {
    src: PropTypes.string,
    fallbackSrc: PropTypes.string,
    alt: PropTypes.string
}

export default Img
