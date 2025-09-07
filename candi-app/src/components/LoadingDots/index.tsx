import * as React from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { AppTheme } from '../../theme';

interface Props {
  size?: number;     
  dotSize?: number;  
  duration?: number;
}

const NUM_DOTS = 12;

const Spinner: React.FC<Props> = ({
  size = 80,
  dotSize = 6,
  duration = 1200,
}) => {
  const dotAnimations = React.useRef(
    [...Array(NUM_DOTS)].map(() => new Animated.Value(0))
  ).current;

  React.useEffect(() => {
    const createDotAnimation = (animation: Animated.Value) => {
      return Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.ease,
          useNativeDriver: false, 
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.ease,
          useNativeDriver: false,
        }),
      ]);
    };

    const staggeredAnimation = Animated.stagger(
      duration / NUM_DOTS,
      dotAnimations.map(anim => createDotAnimation(anim))
    );
    Animated.loop(staggeredAnimation).start();
  }, [duration, dotAnimations]);

  const dots = [...Array(NUM_DOTS)].map((_, i) => {
    const angle = (i / NUM_DOTS) * 2 * Math.PI;
    const x = (size / 2 - dotSize / 2) * Math.cos(angle);
    const y = (size / 2 - dotSize / 2) * Math.sin(angle);

    const color = dotAnimations[i].interpolate({
      inputRange: [0, 1],
      outputRange: [AppTheme.colors.placeholderBackground ,AppTheme.colors.tertiary], 
    });

    const scale = dotAnimations[i].interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.4],
    });

    return (
      <Animated.View
        key={i}
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
            top: size / 2 - dotSize / 2 + y,
            left: size / 2 - dotSize / 2 + x,
            transform: [{ scale }],
          },
        ]}
      />
    );
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {dots}
    </View>
  );
};

export default Spinner;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', 
  },
  dot: {
    position: 'absolute',
  },
});