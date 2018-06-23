import React, { Component } from 'react';
import styled from 'styled-components';

const BoxWrap = styled.div`
  transform-style: preserve-3d;
  position: relative;
  height: ${props => props.height + 'px'};
  width: ${props => props.width + 'px'};
`;

const BoxElement = styled.div`
  background-color: ${props => props.color ? props.color : 'transparent'};
  backface-visibility: hidden;
  border: 2px solid black;
  position: absolute;
  top: 0;
  left: 0;
  user-select: none;
  height: 100%;
  width: 100%;
`;

const MapBoxBottom = BoxElement.extend``;

const MapBoxTop = BoxElement.extend`
  transform: translateZ(100px);
`;

const MapBoxLeft = BoxElement.extend`
  transform-origin: 0 0 0;
  transform: rotateY(-90deg);
`;

const MapBoxRight = BoxElement.extend`
  transform-origin: 100% 0 0;
  transform: rotateY(90deg);
`;

const RoofFront = BoxElement.extend`
  transform: translateZ(${props => props.width + props.roofHeight / 2}px) translateY(${props => props.width - props.roofHeight / 2}px) translateX(${props =>-props.roofHeight / 4}px) rotateX(-90deg);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 60px ${props => props.roofHeight}px 60px;
  border-color: transparent transparent #007bff transparent;
`;

const RoofBack = RoofFront.extend`
  transform: translateZ(${props => props.width + props.roofHeight / 2}px) translateY(${props => -props.roofHeight / 2}px) translateX(${props =>-props.roofHeight / 4}px) rotateX(-90deg) rotateY(180deg);
`;

const MapBoxFront = BoxElement.extend`
  transform-origin: 0 100% 0;
  transform: rotateX(-90deg);
`;

const MapBoxBack = BoxElement.extend`
  transform-origin: 0 0 0;
  transform: rotateX(90deg);
`;

class Box extends Component {
  render() {
    return (
      <BoxWrap {...this.props}>
        <MapBoxTop color={this.props.color}>2</MapBoxTop>
        <MapBoxBottom color={this.props.color}>1</MapBoxBottom>
        <MapBoxLeft color={this.props.color}>3</MapBoxLeft>
        <MapBoxRight color={this.props.color}>4</MapBoxRight>
        <RoofFront width={this.props.width} roofHeight={50}>RoofFront</RoofFront>
        <RoofBack width={this.props.width} roofHeight={50}>RoofBack</RoofBack>
        <MapBoxFront color={this.props.color}>5</MapBoxFront>
        <MapBoxBack color={this.props.color}>6</MapBoxBack>
      </BoxWrap>
    );
  }
}

export default Box;

