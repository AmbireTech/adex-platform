import React, {Component} from 'react';
import { Card, CardMedia, CardTitle, CardText, CardActions } from 'react-toolbox/lib/card';
import {Button, IconButton} from 'react-toolbox/lib/button';
import {Link as ToolboxLink} from 'react-toolbox/lib/link';
import {Navigation} from 'react-toolbox/lib/navigation';
import theme from './theme.css';
import { advertiserData } from './../test-data';
import { Route, Switch, Link } from 'react-router-dom';
import {withReactRouterLink} from './../../common/rr_hoc/RRHoc.js';
import Tooltip from 'react-toolbox/lib/tooltip';
import { Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib//table';

import classnames from 'classnames';

const RRButton = withReactRouterLink(Button)
const RRCardTitle = withReactRouterLink(CardTitle)
const RRCardMedia = withReactRouterLink(CardMedia)
const RRTableCell = withReactRouterLink(TableCell)

const TooltipRRButton = withReactRouterLink(Tooltip(Button))
const TooltipIconButton = Tooltip(IconButton)



class Rows extends Component {
    render () {
        let side = this.props.side //this.props.match.params.side;
        let campaign = this.props.campaign // this.props.match.params.campaign;
        let camp = this.props.item // advertiserData.cmpaigns.filter((c) => c.name === campaign)[0] || {}

        let name = this.props.name
        
        return (
            <div>
                <h1> {camp.name} </h1>
                <div>
                <Table theme={theme}>
                    <TableHead>
                        <TableCell> Img </TableCell>
                        <TableCell> Name </TableCell>
                        <TableCell> Type </TableCell>
                        <TableCell> Size </TableCell>
                        <TableCell> Actions </TableCell> 
                    </TableHead>

                            {camp.meta.units.map((u, i) => {
                                let to = '/dashboard/' + side + '/' + camp.id + '/' + u.id 
                                return (
                                    <TableRow key={i} theme={theme}>
                                        <RRTableCell className={theme.link} to={to} theme={theme}> 
                                            <img className={theme.img} src={u.img} alt={u.name}/>
                                        </RRTableCell>                                        
                                        <RRTableCell className={theme.link} to={to}> {u.name} </RRTableCell>
                                        <TableCell> {u.type} </TableCell>
                                        <TableCell> {u.size} </TableCell>
                                        <TableCell> 

                                            <TooltipRRButton 
                                                to={to} label='view' 
                                                raised primary 
                                                tooltip='Click here to click' 
                                                tooltipDelay={1000} 
                                                tooltipPosition='top'/>                                        
                                            <TooltipIconButton 
                                                icon='archive' 
                                                label='archive' 
                                                raised  
                                                tooltip='Archive here to archive' 
                                                tooltipDelay={1000} 
                                                tooltipPosition='top'/>
                                            <TooltipIconButton 
                                                icon='delete' 
                                                label='delete' 
                                                raised accent 
                                                tooltip='Delete here to delete' 
                                                tooltipDelay={1000} 
                                                tooltipPosition='top'/>

                                        </TableCell>
                                    </TableRow>
                                )
                            })
                    })} 

                </Table>
                </div>
            </div>
        );
    }
}

export default Rows;
