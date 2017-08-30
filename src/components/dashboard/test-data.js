const stremioLogo = 'https://www.strem.io/3.0/stremio-purple-small.png'
const snipLogo = 'https://www.snip.today/static/img/snip_logo_rect.4099c1f945bb.png'
const imdbLogo = 'http://ia.media-imdb.com/images/M/MV5BMTczNjM0NDY0Ml5BMl5BcG5nXkFtZTgwMTk1MzQ2OTE@._V1_.png'
const bgmammaLogo = 'http://vchas.net/wp-content/uploads/2014/01/15.jpg'

let advertiserData = {
    dashboard: {
        data: {
            visits: {data: { total: 1000}},
            revenue: {data: { total: 0.1}},
            ctr: {data: { total: 32}},
            cvr: {data: { total: 94}},
            total_conversions: {data: { total: 63}},
            gender: {data: { male: 11, femele: 5, apache_helicopter: 86}},
            geolocation: {data: { us: 90.1, china: 9.9}}
        }
    },
    cmpaigns: [
        {
            name: 'stremio',
            logo: stremioLogo,
            data: {
                units: [
                    {
                        name: 'all you can watch',
                        type: 'html',
                        size: '300x300',
                        stats: {}
                    },{
                        name: 'foo',
                        type: 'xhtml',
                        size: '69x69',
                        stats: {}
                    },{
                        name: 'winter is coming',
                        type: 'html',
                        size: '300x300',
                        stats: {}
                    }
                ]
            }
        },{
            name: 'snip',
            logo: snipLogo,
            data: {
                units: [
                    {
                        name: 'all you can snip',
                        type: 'html',
                        size: '300x300',
                        stats: {}
                    },{
                        name: 'snip your finger to snip',
                        type: 'html',
                        size: '30x0',
                        stats: {}
                    },{
                        name: 'snip it',
                        type: 'html',
                        size: '300x300',
                        stats: {}
                    }
                ]
            }
        },{
            name: 'imdb',
            logo: imdbLogo,
            data: {
                units: [
                    {
                        name: 'all you can watch',
                        type: 'html',
                        size: '300x300',
                        stats: {}
                    },{
                        name: 'watch movie to watch',
                        type: 'html',
                        size: '30x300',
                        stats: {}
                    },{
                        name: 'watch it',
                        type: 'html',
                        size: '300x300',
                        stats: {}
                    }
                ]
            }
        },{
            name: 'bgmamma',
            logo: bgmammaLogo,
            data: {
                units: [
                    {
                        name: 'watch your mamma to watch',
                        type: 'html',
                        size: '300x300',
                        stats: {}
                    },{
                        name: 'foo',
                        type: 'html',
                        size: '30x300',
                        stats: {}
                    },{
                        name: 'bar',
                        type: 'html',
                        size: '300x300',
                        stats: {}
                    }
                ]
            }
        },
    ]
}

module.exports = {
    advertiserData: advertiserData
}
