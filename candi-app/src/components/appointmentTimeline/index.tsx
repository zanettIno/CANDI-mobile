import { AppTheme } from '@/theme';
import * as React from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';

interface PropsBola {
  isCompleted: boolean;
}

interface PropsLinha {
  isCompleted: boolean;
}

const AppointmentContainer = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const TimelineContainer = styled(View)`
  flex-direction: column;
  align-items: flex-start;
  padding-left: 10px;
  padding-top: 10px;
`;

const TimelineItemWrapper = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 15px;
  width: 100%;
`;

const DotAndLineContainer = styled(View)`
  flex-direction: column;
  align-items: center;
`;

const TimelineDot = styled(View)<PropsBola>`
  height: 30px;
  width: 30px;
  background-color: ${(props) =>
    props.isCompleted ? AppTheme.colors.secondary : AppTheme.colors.placeholderText};
  border-radius: 15px;
`;

const TimelineLine = styled(View)<PropsLinha>`
  height: 40px;
  width: 4px;
  background-color: ${(props) =>
    props.isCompleted ? AppTheme.colors.secondary : AppTheme.colors.placeholderText};
`;

const ContentContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex: 1;
`;

const NowButton = styled(View)`
  background-color: ${AppTheme.colors.tertiary};
  border-radius: 5px;
  padding: 5px 15px;
  margin-left: 10px;
`;

const NowText = styled(Text)`
  color: white;
  font-weight: bold;
`;

const ItemText = styled(Text)`
  font-size: ${AppTheme.fonts.bodyLarge.fontSize + 3}px;
  color: ${AppTheme.colors.tertiary};
`;

export default function AppointmentTimeline() {
  const appointments = [
    { text: 'Ir à clínica oncológica', time: '9h', isCompleted: true },
    { text: 'Retirar exame', time: '', isCompleted: true, showNow: true },
    { text: 'Marcar retorno com exame', time: '13h', isCompleted: false },
    { text: 'Ir para a fisioterapia', time: '15h', isCompleted: false },
  ];

  return (
    <TimelineContainer>
      {appointments.map((item, index) => (
        <TimelineItemWrapper key={index}>
          <DotAndLineContainer>
            <TimelineDot isCompleted={item.isCompleted} />
            {index < appointments.length - 1 && (
              <TimelineLine isCompleted={appointments[index + 1].isCompleted} />
            )}
          </DotAndLineContainer>
          <ContentContainer>
            <ItemText>{item.text}</ItemText>
            <AppointmentContainer>
              {item.showNow ? (
                <NowButton>
                  <NowText>Agora</NowText>
                </NowButton>
              ) : (
                <ItemText>{item.time}</ItemText>
              )}
            </AppointmentContainer>
          </ContentContainer>
        </TimelineItemWrapper>
      ))}
    </TimelineContainer>
  );
}