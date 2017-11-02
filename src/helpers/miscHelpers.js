import slug from 'slug'
import unidecode from 'unidecode'
import moment from 'moment'
class Helper {

    getGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); // eslint-disable-line no-mixed-operators
            return v.toString(16);
        });
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

    slugify(str) {
        if (!str || (typeof str !== 'string')) return ''
        return slug(unidecode(str), { lower: true }).substring(0, 32);
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
}

export default new Helper()
