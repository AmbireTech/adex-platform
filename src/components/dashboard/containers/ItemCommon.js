import React from 'react'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Card, CardMedia, CardTitle } from 'react-toolbox/lib/card'
import Input from 'react-toolbox/lib/input'
import Img from 'components/common/img/Img'
import theme from './theme.css'
import { items as ItemsConstants } from 'adex-constants'
import { Item } from 'adex-models'

const { AdSizesByValue, AdTypesByValue } = ItemsConstants

export const BasicProps = ({ item, t, rightComponent, url, ...rest }) => {

    return (
        <div className={theme.itemPropTop}>
            <Grid fluid style={{ padding: 0 }}>
                <Row top='xs'>
                    <Col xs={12} sm={12} md={12} lg={7}>
                        <div className={theme.imgHolder}>
                            <Card className={theme.itemDetailCard} raised={false} theme={theme}>
                                <CardMedia
                                    aspectRatio='wide'
                                    theme={theme}
                                >
                                    <Img src={Item.getImgUrl(item.meta.img, process.env.IPFS_GATEWAY)} alt={item.fullName} />
                                </CardMedia>
                                <CardTitle theme={theme} >
                                    <a href={url} target='_blank'>
                                        {url}
                                    </a>

                                </CardTitle>
                            </Card>
                            <br />
                            {item.fallbackAdImg || item.fallbackAdUrl ?
                                <div>
                                    <div className={theme.integrationLabel}> {t('FALLBACK_DATA')}</div>
                                    <Card className={theme.itemDetailCard} raised={false} theme={theme}>
                                        <CardMedia
                                            aspectRatio='wide'
                                            theme={theme}
                                        >
                                            <Img src={Item.getImgUrl(item.fallbackAdImg, process.env.IPFS_GATEWAY)} alt={item.fallbackAdUrl} />
                                        </CardMedia>
                                        <CardTitle theme={theme} >
                                            <a href={item.fallbackAdUrl} target='_blank'>
                                                {item.fallbackAdUrl}
                                            </a>

                                        </CardTitle>
                                    </Card>
                                </div>
                                : null
                            }
                        </div>
                        <div className={theme.bannerProps}>
                            <div>
                                {/* TODO: temp use input to use the styles */}
                                <Input
                                    type='text'
                                    value={AdTypesByValue[item.adType].label}
                                    label={t('adType', { isProp: true })}
                                    disabled
                                />
                            </div>
                            <div>
                                <Input
                                    type='text'
                                    value={AdSizesByValue[item.size].label}
                                    label={t('size', { isProp: true })}
                                    disabled
                                />
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={5}>
                        {rightComponent}
                    </Col>
                </Row>
            </Grid>
        </div >
    )
}