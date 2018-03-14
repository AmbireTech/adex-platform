import React from 'react'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Card, CardMedia, CardTitle } from 'react-toolbox/lib/card'
import Input from 'react-toolbox/lib/input'
import Img from 'components/common/img/Img'
import theme from './theme.css'
import { items as ItemsConstants } from 'adex-constants'
import { Item } from 'adex-models'
import classnames from 'classnames'
import { IconButton } from 'react-toolbox/lib/button'
import { validUrl } from 'helpers/validators'
import ValidItemHoc from 'components/dashboard/forms/ValidItemHoc'

const { AdSizesByValue, AdTypesByValue } = ItemsConstants

const FallbackAdData =  ({ item, t, rightComponent, url, ...rest }) => {
    let errFallbackAdUrl = rest.invalidFields['fallbackAdUrl']

    return (
        <div>
            <div className={theme.integrationLabel}> {t('FALLBACK_DATA')}</div>
            <Card className={theme.itemDetailCard} raised={false} theme={theme}>
                <CardMedia
                    aspectRatio='wide'
                    theme={theme}
                >
                    <Img src={Item.getImgUrl(item.fallbackAdImg, process.env.IPFS_GATEWAY)} alt={item.fallbackAdUrl} onClick={rest.toggleFallbackImgEdit} style={{ cursor: 'pointer' }} />
                </CardMedia>
                <CardTitle theme={theme} >                                           

                    {rest.activeFields.fallbackAdUrl ?
                        <Input
                            // required
                            autoFocus
                            type='text'
                            label={t('fallbackAdUrl', { isProp: true })}
                            value={item.fallbackAdUrl}
                            onChange={(val) =>  rest.handleChange('fallbackAdUrl', val)}
                            maxLength={1024}
                            onBlur={() => { rest.setActiveFields('fallbackAdUrl', false); rest.validate('fallbackAdUrl', { isValid: !item.fallbackAdUrl || validUrl(item.fallbackAdUrl), err: { msg: 'ERR_INVALID_URL' }, dirty: true }); } }
                            onFocus={() => rest.validate('fallbackAdUrl', { isValid: !item.fallbackAdUrl || validUrl(item.fallbackAdUrl), err: { msg: 'ERR_INVALID_URL' }, dirty: false })}
                            error={errFallbackAdUrl && !!errFallbackAdUrl.dirty ? <span> {errFallbackAdUrl.errMsg} </span> : null}
                        >
                            {!errFallbackAdUrl || !errFallbackAdUrl.dirty ?
                                <div>
                                    {t('SLOT_FALLBACK_AD_URL_DESCRIPTION')}
                                </div> : null}
                        </Input>
                        :
                        <div >
                            <p>
                                {item.fallbackAdUrl ?
                                    <a href={item.fallbackAdUrl} target='_blank'>
                                        {item.fallbackAdUrl}
                                    </a>
                                    :
                                    <span style={{ opacity: 0.3 }}> {t('NO_FALLBACK_URL_YET')}</span>
                                }
                                <span>
                                    <IconButton
                                        theme={theme}
                                        icon='edit'
                                        accent
                                        onClick={ () => rest.setActiveFields('fallbackAdUrl', true)}
                                    />
                                </span>
                            </p>
                            {errFallbackAdUrl && !!errFallbackAdUrl.dirty ?
                                <div>
                                    <span className={theme.error}> {errFallbackAdUrl.errMsg} </span>
                                </div> : null}

                        </div>
                    }

                </CardTitle>
            </Card>
        </div>
    )
}

const ValidatedFallbackAdData = ValidItemHoc(FallbackAdData)

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
                                    <Img src={Item.getImgUrl(item.meta.img, process.env.IPFS_GATEWAY)} alt={item.fullName} onClick={rest.toggleImgEdit} className={classnames({ [theme.pointer]: rest.canEditImg })} />
                                </CardMedia>
                                <CardTitle theme={theme} >
                                    <a href={url} target='_blank'>
                                        {url}
                                    </a>

                                </CardTitle>
                            </Card>
                            <br />
                            {item.fallbackAdImg || item.fallbackAdUrl ?
                                <ValidatedFallbackAdData validateId={item._id} item={item} t={t} url={url} {...rest} />
                                : null
                            }
                        </div>
                        <div className={theme.bannerProps}>
                            <div>
                                {/* TODO: temp use input to use the styles */}
                                <Input
                                    type='text'
                                    value={(AdTypesByValue[item.adType] || {}).label}
                                    label={t('adType', { isProp: true })}
                                    disabled
                                />
                            </div>
                            <div>
                                <Input
                                    type='text'
                                    value={(AdSizesByValue[item.size] || {}).label}
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