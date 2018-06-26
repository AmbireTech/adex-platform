import moment from 'moment'
class Helper {

    getGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8) // eslint-disable-line no-mixed-operators
            return v.toString(16)
        })
    }

    getRndHash32(prefix) {
        let h = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); // eslint-disable-line no-mixed-operators
            return v.toString(16)
        })
        if (prefix) {
            h = prefix + (h.substring(prefix.length))
        }
        return h
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    getRandomBool() {
        return !!this.getRandomInt(0, 1)
    }

    getRandomPropFromObj(obj) {
        var keys = Object.keys(obj)
        return obj[keys[keys.length * Math.random() << 0]];
    }

    getRandomKeyFromObj(obj) {
        var keys = Object.keys(obj)
        return keys[keys.length * Math.random() << 0]
    }

    geRandomMoment(maxDaysPast, maxDaysAhead, initialMoment) {
        // TODO: fix +/- 1 day bug
        let initial = moment.isMoment(initialMoment) ?
            initialMoment.valueOf() : undefined

        return moment(initial)
            .add(this.getRandomInt(-maxDaysPast, maxDaysAhead), 'd')
            .add(this.getRandomInt(-24, 24), 'h')
            .add(this.getRandomInt(-60, 60), 'm')
    }

    hexToRgbaColorString = (hex, alpha) => {
        if (!hex || (typeof hex !== 'string')) {
            throw new Error('Invalid color')
        } else if (hex.length === 4) {
            hex = hex + hex.substr(1, 4)
        }

        if (typeof alpha === 'object' || typeof alpha === 'undefined') {
            alpha = 1
        }

        const hexToDec = (h) => {
            return parseInt("0x" + h, 16)
        }

        let r = hexToDec(hex.substr(1, 2))
        let g = hexToDec(hex.substr(3, 2))
        let b = hexToDec(hex.substr(5, 2))

        return `rgba(${r},${g},${b},${alpha})`
    }

    getQuery(queryParams) {
        if (!queryParams) return ''
        return '?' + Object.keys(queryParams).map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key])
        }, '').join('&') || ''
    }

    getErrMsg = (err) => {
        let stack = ((err.message || err || '').toString()).split(/\r\n|\n|\r/g)

        if (stack.length > 1) {
            return (err.name ? err.name + ': ' : '') + (stack[0]).toString()
        } else {
            return (err.error || err || '').toString()
        }
    }

    isInt = (int) => {
        return typeof int === 'number' && (int % 1 === 0)
    }
}

export default new Helper()
