import React, { Component } from 'react';
import styled from 'styled-components';
import baseStyles from '../base-styles.js';

import Map from './Map';

const AppWrap = styled.div`
  height: 100%;
`;

class App extends Component {
  render() {
    baseStyles();
    return (
      <AppWrap>
        <Map></Map>
      </AppWrap>
    );
  }
}

export default App;