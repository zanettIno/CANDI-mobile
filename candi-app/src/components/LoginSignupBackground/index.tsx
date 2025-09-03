import * as React from 'react';
import { View, Dimensions } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import styled from 'styled-components/native';
import Svg, { Path } from 'react-native-svg';
import { AppTheme } from '../../theme';

const { width, height } = Dimensions.get('window');

const FirstLayer = styled(View)`
  flex: 1;
  position: relative;
  background-color: ${AppTheme.colors.background};
  z-index: 1;
`;

const SecondLayer = styled(View)`
  height: ${height / 4}px;
  width: 100%;
  position: absolute;
  top: 0;
  z-index: 2;
`;

const ThirdLayer = styled(View)`
  height: ${height / 5}px;
  width: 100%;
  position: absolute;
  top: 0;
  z-index: 3;
`;

const ContentContainer = styled(View)`
  flex: 1;
  z-index: 4;
  position: relative;
`;

const SecondWaves = ({ color, layerHeight, position = 'bottom' }) => {
  const isBottom = position === 'bottom';
  
  const wavePath = isBottom 
    ? `M 0,0 L 0,${layerHeight - 90} 
       Q ${width * 0.25},${layerHeight} ${width * 0.5},${layerHeight - 20}
       T ${width},${layerHeight - 20} L ${width},0 Z`
    : `M 0,20 Q ${width * 0.25},0 ${width * 0.5},20
       T ${width},20 L ${width},${layerHeight} L 0,${layerHeight} Z`;

  return (
    <Svg height={layerHeight} width={width} style={{ position: 'absolute' }}>
      <Path d={wavePath} fill={color} />
    </Svg>
  );
};

const ThirdWaves = ({ color, layerHeight, position = 'bottom' }) => {
  const isBottom = position === 'bottom';
  
  const wavePath = isBottom 
    ? `M 0,0 L 0,${layerHeight - 25} 
       Q ${width * 0.25},${layerHeight} ${width * 0.5},${layerHeight - 30}
       T ${width},${layerHeight - 25} L ${width},0 Z`
    : `M 0,20 Q ${width * 0.25},0 ${width * 0.5},20
       T ${width},20 L ${width},${layerHeight} L 0,${layerHeight} Z`;

  return (
    <Svg height={layerHeight} width={width} style={{ position: 'absolute' }}>
      <Path d={wavePath} fill={color} />
    </Svg>
  );
};

export default function LoginSignupBackground({ children }) {
  return (
    <PaperProvider theme={AppTheme}>
      <FirstLayer>
        <SecondLayer>
          <SecondWaves
            color={AppTheme.colors.secondary} 
            layerHeight={height / 4}
            position="bottom"
          />
        </SecondLayer>
        
        <ThirdLayer>
          <ThirdWaves
            color={AppTheme.colors.primary} 
            layerHeight={height / 5}
            position="bottom"
          />
        </ThirdLayer>
        
        <ContentContainer>
          {children}
        </ContentContainer>
      </FirstLayer>
    </PaperProvider>
  );
}