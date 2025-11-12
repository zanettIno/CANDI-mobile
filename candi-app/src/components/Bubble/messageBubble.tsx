import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme/index'; 

const SENT_COLOR = AppTheme.colors.cardBackground; 
const RECEIVED_COLOR = AppTheme.colors.secondary;
const TIME_COLOR = AppTheme.colors.placeholderText;

interface MessageBubbleProps {
  message: string;
  time: string;
  isSent: boolean; 
}

const BubbleContainer = styled(View)<{ isSent: boolean }>`
  max-width: 80%;
  margin-vertical: 4px;
  align-self: ${({ isSent }) => (isSent ? 'flex-end' : 'flex-start')};
  
  shadow-color: ${AppTheme.colors.shadow};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 4px;
  elevation: 2;
`;

const Bubble = styled(View)<{ isSent: boolean }>`
  background-color: ${({ isSent }) => (isSent ? SENT_COLOR : RECEIVED_COLOR)};
  padding: 10px 12px;
  border-radius: 16px;
  
  border-top-left-radius: ${({ isSent }) => (isSent ? '16px' : '4px')};
  border-top-right-radius: ${({ isSent }) => (isSent ? '4px' : '16px')};
`;

const MessageText = styled(Text)`
  color: ${AppTheme.colors.tertinaryTextColor};
  font-size: 16px;
  line-height: 20px;
`;

const TimeContainer = styled(View)<{ isSent: boolean }>`
  align-self: ${({ isSent }) => (isSent ? 'flex-end' : 'flex-start')};
  margin-top: 4px;
  margin-left: 8px;
`;

const TimeText = styled(Text)`
  color: ${TIME_COLOR};
  font-size: 12px;
`;

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, time, isSent }) => {
  return (
    <BubbleContainer isSent={isSent}>
      <Bubble isSent={isSent}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <MessageText>{message}</MessageText>
          <TimeContainer isSent={isSent}>
            <TimeText>{time}</TimeText>
          </TimeContainer>
        </View>
      </Bubble>
    </BubbleContainer>
  );
};

export default MessageBubble;
