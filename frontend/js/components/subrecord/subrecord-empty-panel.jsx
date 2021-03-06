/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records
*
* Copyright (C) 2015-2019 University Of Helsinki (The National Library Of Finland)
*
* This file is part of marc-merge-ui
*
* marc-merge-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* marc-merge-ui is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export class EmptySubRecordPanel extends React.Component {

  static propTypes = {
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
    rowId: PropTypes.string.isRequired
  }

  render() {
    const { isOver, canDrop } = this.props;

    const classes = classNames({
      'empty-droppable': true,
      'is-over': isOver,
      'can-drop': canDrop,
      'cannot-drop': !canDrop
    });

    return <div className={classes} />;
  }
}