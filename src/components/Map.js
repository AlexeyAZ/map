import React, { Component } from 'react';
import ReactCursorPosition from 'react-cursor-position';
import styled from 'styled-components';
import helpers from '../helpers';


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

const MapContentInner = styled(ReactCursorPosition)`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

const MapGridWrap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

const MapGrid = (props) => {
  return (
    <MapGridWrap>
      {props.children}
    </MapGridWrap>
  )
}

const MapSettings = styled.div`
  background-color: white;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
`;

const MapBox = styled.div`
  transform-style: preserve-3d;
  position: absolute;
  top: 0;
  left: 0;
  height: 100px;
  width: 100px;
`;

const MapBoxBottom = styled.div`
  border: 2px solid black;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

const MapBoxTop = styled.div`
  transform: translateZ(100px);
  border: 2px solid black;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

const MapBoxLeft = styled.div`
  transform-origin: 0 0 0;
  transform: rotateY(-90deg);
  border: 2px solid black;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

const MapBoxRight = styled.div`
  transform-origin: 100% 0 0;
  transform: rotateY(90deg);
  border: 2px solid black;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

const MapBoxFront = styled.div`
  transform-origin: 0 100% 0;
  transform: rotateX(-90deg);
  border: 2px solid black;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

const MapBoxBack = styled.div`
  transform-origin: 0 0 0;
  transform: rotateX(90deg);
  border: 2px solid black;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

class Map extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      canvasSize: 2000,
      mouseDown: false,
      mouseMoveX: null,
      mouseMoveY: null,
      mouseRotateX: null,
      pressShift: false,
      mapGrid: {
        x: null,
        y: null
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

    this.contentRef = React.createRef();

    this.handleInputChange = this.handleInputChange.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMapContentInnerMouseMove = this.onMapContentInnerMouseMove.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState((prevState, props) => {
      let newState = prevState.inputs[name].value = value;
      return newState;
    });
  }

  onMouseWheel(event) {
    const delta = event.deltaY;
    const sign = helpers.getSign(delta);
    let value = +this.state.inputs.translateZ.value - 1000 * sign;

    let inputs = Object.assign({}, this.state.inputs);
    if (value >= this.state.inputs.translateZ.min && value <= this.state.inputs.translateZ.max) {
      inputs.translateZ.value = value;
      this.setState({inputs});
    }
  }

  onMouseDown(event) {
    if (event.button === 0) {
      this.setState({mouseDown: true, mouseMoveX: event.screenX, mouseMoveY: event.screenY, mouseRotateX: event.screenX});
    }
  }

  onMouseUp(event) {
    if (event.button === 0) {
      this.setState({mouseDown: false});
    }
  }

  onMouseMove(event) {
    let inputs = Object.assign({}, this.state.inputs);

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

  onMapContentInnerMouseMove(obj) {
    if (!obj.isPositionOutside) {
      this.setState((prevState, props) => {
        let newState = Object.assign({}, this.state);
        newState.mapGrid.x = prevState.canvasSize / obj.elementDimensions.width * obj.position.x;
        newState.mapGrid.y = prevState.canvasSize / obj.elementDimensions.height * obj.position.y;

        return newState;
      });
    }
  }

  render() {
    const {inputs, mapGrid} = this.state;

    const InputsElements = [];
    for (let key in inputs) {
      InputsElements.push(
        <div key={inputs[key].name}>
          <label style={{display: 'block'}}>{key}: {inputs[key].value}</label>
          <input {...inputs[key]} onChange={this.handleInputChange}/>
        </div>
      )
    }

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
              x: {mapGrid.x}
            </div>
            <div>
              y: {mapGrid.y}
            </div>
          </div>
        </MapSettings>
        <MapContainer perspective={`${this.state.inputs.perspective.value}px`}>
          <MapContent
            translateX={`${this.state.inputs.translateX.value}px`}
            translateY={`${this.state.inputs.translateY.value}px`}
            translateZ={`${this.state.inputs.translateZ.value}px`}
            rotateZ={`${this.state.inputs.rotateZ.value}deg`}
            onMouseMove={this.onContainerMouseMove}
            innerRef={this.contentRef}
            size={this.state.canvasSize}>
            <MapContentInner onPositionChanged={this.onMapContentInnerMouseMove}>
              <MapGrid>
                <MapBox>
                  <MapBoxTop>2</MapBoxTop>
                  <MapBoxBottom>1</MapBoxBottom>
                  <MapBoxLeft>3</MapBoxLeft>
                  <MapBoxRight>4</MapBoxRight>
                  <MapBoxFront>5</MapBoxFront>
                  <MapBoxBack>6</MapBoxBack>
                </MapBox>
              </MapGrid>
            </MapContentInner>
            {/* <Grid cells={mapGrid.cells} cellSize={mapGrid.cellSize}/> */}
          </MapContent>
        </MapContainer>
      </MapWrap>
    );
  }
}

export default Map;