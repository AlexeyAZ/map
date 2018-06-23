import React, { Component } from 'react';

import Box from './Box';

import styled from 'styled-components';
import helpers, {clone} from '../helpers';


const MapWrap = styled.div`
  cursor: ${props => props.isMouseDown ? 'grabbing' : 'default'};
  overflow: hidden;
  position: relative;
  height: 100%;
`;

const MapContainer = styled.div`
  background-color: rgba(0,0,0,0.3);
  perspective: ${props => props.perspective};
  position: relative;
  height: 100%;
`;

const MapContent = styled.div.attrs({
    style: (props) => ({
      transform: `translate3d(${props.translateX}, ${props.translateY}, ${props.translateZ})
                  rotateX(65deg)
                  rotateZ(${props.rotateZ})`
    })
  })`
  background-color: rgba(0,0,0,0.3);
  background-image: url('img/map-bg.jpg');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  transform-style: preserve-3d;
  position: absolute;
  top: calc(50% - ${props => props.size / 2 + 'px'});
  left: calc(50% - ${props => props.size / 2 + 'px'});
  height: ${props => props.size + 'px'};
  width: ${props => props.size + 'px'};
`;

const MapGridWrap = styled.div`
  transform-style: preserve-3d;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

const MapGrid = (props) => {
  return (
    <MapGridWrap {...props}>
      {props.children}
    </MapGridWrap>
  )
};

const MapElementOptions = styled.div`
  transform: rotateX(90deg) rotateY(${props => props.rotate ? -props.rotate + 'deg' : 0}) translateY(100px);
  transform-origin: 0 100%;
  border: 2px solid red;
  opacity: 0;
  position: absolute;
  bottom: 100%;
  left: 100%;
  height: 20px;
  width: 100px;
`;

const MapElementWrap = styled.div.attrs({
    style: (props) => ({
      top: `${props.x ? props.x + 'px' : 0}`,
      left: `${props.y ? props.y + 'px' : 0}`
    })
  })`
  transform-style: preserve-3d;
  pointer-events: ${props => props.move === false ? 'auto' : 'none'};
  position: absolute;

  &:hover ${MapElementOptions} {
    opacity: 1;
  }
`;

const MapElement = (props) => {
  return (
    <MapElementWrap {...props}>
      {/* <MapElementOptions rotate={props.rotate}/> */}
      {props.children}
    </MapElementWrap>
  );
};

const MapSettings = styled.div`
  background-color: white;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
`;

class Map extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      canvasSize: 2000,
      mouseDown: false,
      mouseMoveX: null,
      mouseMoveY: null,
      mouseOffsetX: null,
      mouseOffsetY: null,
      mouseRotateX: null,
      pressShift: false,
      isElementMove: false,
      mapElements: [],
      mapGrid: {
        relativeBox: {
          x: null,
          y: null
        }
      },
      inputs: {
        perspective: {
          value: 2000,
          type: 'range',
          name: 'perspective',
          min: 1,
          max: 8000
        },
        translateX: {
          value: 0,
          type: 'range',
          name: 'translateX',
          min: -10000,
          max: 10000
        },
        translateY: {
          value: 0,
          type: 'range',
          name: 'translateY',
          min: -20000,
          max: 20000
        },
        translateZ: {
          value: -8000,
          type: 'range',
          name: 'translateZ',
          min: -30000,
          max: 30000
        },
        rotateZ: {
          value: 45,
          type: 'range',
          name: 'rotateZ',
          min: 0,
          max: 360
        }
      }
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onElementClick = this.onElementClick.bind(this);
    this.addMapElement = this.addMapElement.bind(this);
    this.onContainerMouseMove = this.onContainerMouseMove.bind(this);
    this.onContainerClick = this.onContainerClick.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState(prevState => {
      let newState = prevState.inputs[name].value = value;
      return newState;
    });
  }

  onMouseWheel(event) {
    const delta = event.deltaY;
    const sign = helpers.getSign(delta);
    let value = +this.state.inputs.translateZ.value - 1000 * sign;

    let inputs = clone(this.state.inputs);
    if (value >= this.state.inputs.translateZ.min && value <= this.state.inputs.translateZ.max) {
      inputs.translateZ.value = value;
      this.setState({inputs});
    }
  }

  onMouseDown(event) {
    if (event.button === 0) {
      this.setState({
        isElementMove: false,
        mouseDown: true,
        mouseMoveX: event.screenX,
        mouseMoveY: event.screenY,
        mouseRotateX: event.screenX
      });
    }
  }

  onMouseUp(event) {
    if (event.button === 0) {
      this.setState({mouseDown: false});
    }
  }

  onMouseMove(event) {
    let inputs = clone(this.state.inputs);

    if (this.state.mouseDown && !event.shiftKey) {
      let valueX;
      let valueY;

      valueX = +this.state.inputs.translateX.value - (this.state.mouseMoveX - event.screenX);
      valueY = +this.state.inputs.translateY.value - (this.state.mouseMoveY - event.screenY);

      if (valueX >= this.state.inputs.translateX.min && valueX <= this.state.inputs.translateX.max) {
        inputs.translateX.value = valueX;
      }

      if (valueY >= this.state.inputs.translateY.min && valueY <= this.state.inputs.translateY.max) {
        inputs.translateY.value = valueY;
      }

      this.setState({inputs, mouseMoveX: event.screenX, mouseMoveY: event.screenY});
    }

    if (this.state.mouseDown && event.shiftKey) {
      let rotateX;
      rotateX = +this.state.inputs.rotateZ.value - (this.state.mouseRotateX - event.screenX);
      
      if (rotateX >= this.state.inputs.rotateZ.min && rotateX <= this.state.inputs.rotateZ.max) {
        inputs.rotateZ.value = rotateX;
      }

      this.setState({inputs, mouseRotateX: event.screenX});
    }
  }

  onContainerClick() {
    if (this.state.isElementMove !== false) {
      this.setState({isElementMove: false});
    }
  }

  onContainerMouseMove(event) {
    if (this.state.isElementMove !== false) {
      event.persist();
      
      const mapElements = clone(this.state.mapElements);
      mapElements[this.state.isElementMove].x = event.nativeEvent.offsetY;
      mapElements[this.state.isElementMove].y = event.nativeEvent.offsetX;
      this.setState({mapElements})
    }
  }

  onElementClick(index) {
    this.setState({isElementMove: index});
  }

  createMapElement(x = 0, y = 0) {
    let item = {};
    item.x = x;
    item.y = y;
    item.width = 100;
    item.height = 100;

    return item;
  }

  addMapElement() {
    let mapElements = clone(this.state.mapElements);
    let item = this.createMapElement();
    mapElements.push(item);
    this.setState({mapElements});
  }

  stressTest() {
    let mapElements = [];
    const size = 100;
    for(let i = 0; i < this.state.canvasSize / size; i++) {
      for(let j = 0; j < this.state.canvasSize / size; j++) {
        mapElements.push(this.createMapElement(j * size, i * size));
      }
    }
    this.setState({mapElements});
  }

  render() {
    const {inputs, mapGrid, mapElements, isElementMove} = this.state;

    const InputsElements = [];
    for (let key in inputs) {
      InputsElements.push(
        <div key={inputs[key].name}>
          <label style={{display: 'block'}}>{key}: {inputs[key].value}</label>
          <input {...inputs[key]} onChange={this.handleInputChange}/>
        </div>
      )
    };
    
    const MapElements = [];
    mapElements.forEach((item, index) => {
      MapElements.push(
        <MapElement
          onClick={this.onElementClick.bind(this, index)}
          rotate={inputs.rotateZ.value}
          move={isElementMove}
          key={index}
          x={item.x}
          y={item.y}>
          <Box height={item.height} width={item.width} color={'red'}/>
        </MapElement>
      );
    });

    return (
      <MapWrap
        onWheel={this.onMouseWheel}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseMove={this.onMouseMove}
        isMouseDown={this.state.mouseDown}>
        <MapSettings>
          {InputsElements}
          <div>
            <div>
              relativeBox
            </div>
            <div>
              x: {mapGrid.relativeBox.x}
            </div>
            <div>
              y: {mapGrid.relativeBox.y}
            </div>
            <button onClick={this.addMapElement}>+</button>
            <button onClick={(e) => this.stressTest(e)}>stressTest</button>
          </div>
        </MapSettings>
        <MapContainer perspective={`${this.state.inputs.perspective.value}px`}>
          <MapContent
            translateX={`${this.state.inputs.translateX.value}px`}
            translateY={`${this.state.inputs.translateY.value}px`}
            translateZ={`${this.state.inputs.translateZ.value}px`}
            rotateZ={`${this.state.inputs.rotateZ.value}deg`}
            size={this.state.canvasSize}>
            <MapGrid
              onMouseMove={this.onContainerMouseMove}
              onClick={this.onContainerClick}>
              {MapElements}
            </MapGrid>
          </MapContent>
        </MapContainer>
      </MapWrap>
    );
  }
}

export default Map;