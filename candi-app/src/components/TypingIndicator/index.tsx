import * as React from 'react';
import {AppTheme} from '../../theme';

interface Props {
  dotSize?: number; 
  duration?: number; 
  dotCount?: number; 
}

const ACTIVE_COLOR = AppTheme.colors.tertiary;
const INACTIVE_COLOR = AppTheme.colors.placeholderBackground;
const ANIMATION_NAME = 'typing-indicator-animation';

const TypingIndicator: React.FC<Props> = ({
  dotSize = 12,
  duration = 1500,
  dotCount = 3,
}) => {
  React.useEffect(() => {
    const keyframes = `
      @keyframes ${ANIMATION_NAME} {
        0%, 100% {
          background-color: ${INACTIVE_COLOR};
          transform: scale(1);
        }
        50% {
          background-color: ${ACTIVE_COLOR};
          transform: scale(1.2);
        }
      }
    `;

    let styleSheet = document.getElementById('typing-indicator-styles');
    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = 'typing-indicator-styles';
      document.head.appendChild(styleSheet);
    }
    styleSheet.innerText = keyframes;

  }, []); 

  const dots = Array.from({ length: dotCount }).map((_, i) => {
    const dotStyle: React.CSSProperties = {
      width: `${dotSize}px`,
      height: `${dotSize}px`,
      borderRadius: '50%',
      backgroundColor: INACTIVE_COLOR, 
      animationName: ANIMATION_NAME,
      animationDuration: `${duration}ms`,
      animationIterationCount: 'infinite',
      animationTimingFunction: 'ease-in-out',
      animationDelay: `${(i * duration) / (dotCount * 2)}ms`,
    };

    return <div key={i} style={dotStyle} />;
  });

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${dotSize / 2}px`, 
  };

  return <div style={containerStyle}>{dots}</div>;
};

export default TypingIndicator;

