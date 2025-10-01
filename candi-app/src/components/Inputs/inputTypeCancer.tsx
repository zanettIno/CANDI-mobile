import React, { useState } from "react";
import { View, Text } from "react-native";
import styled from "styled-components/native";
import { Menu } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { AppTheme } from "@/theme";

interface CancerType {
  id: number;
  name: string;
}

interface InputTypeCancerProps {
  value: number | null;
  onSelect: (id: number) => void;
  placeholder?: string;
  style?: any;
}

const Container = styled(View)`
  position: relative;
  margin-bottom: 16px;
  margin: 16px;
`;

const StyledInputLike = styled.TouchableOpacity<{ hasError?: boolean }>`
  background-color: ${AppTheme.colors.formFieldColor};
  border-radius: 50px;
  padding: 16px 50px 16px 16px;
  font-size: 20px;
  border: 1px solid ${props => props.hasError ? '#ff6b6b' : 'transparent'};
  justify-content: center;
`;

const InputText = styled(Text)<{ hasValue: boolean }>`
  font-size: 20px;
  color: ${props => props.hasValue ? AppTheme.colors.textColor : '#545f71'};
`;

const IconContainer = styled(View)`
  position: absolute;
  right: 16px;
  top: 50%;
  margin-top: -12px;
`;


export const cancerTypes: CancerType[] = [
  { id: 1, name: "Mama" },
  { id: 2, name: "Próstata" },
  { id: 3, name: "Pulmão" },
  { id: 4, name: "Cólon e Reto" },
  { id: 5, name: "Estômago" },
  { id: 6, name: "Fígado" },
  { id: 7, name: "Colo do Útero" },
  { id: 8, name: "Esôfago" },
  { id: 9, name: "Bexiga" },
  { id: 10, name: "Linfoma não Hodgkin" },
  { id: 11, name: "Leucemia" },
  { id: 12, name: "Rim" },
  { id: 13, name: "Pâncreas" },
  { id: 14, name: "Tireoide" },
  { id: 15, name: "Sistema Nervoso Central" },
  { id: 16, name: "Ovário" },
  { id: 17, name: "Melanoma" },
  { id: 99, name: "Outros" },
];

const InputTypeCancer: React.FC<InputTypeCancerProps> = ({
  value,
  onSelect,
  placeholder = "Tipo do câncer",
  style,
}) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (id: number) => {
    onSelect(id);
    closeMenu();
  };

  
  const selectedCancer = cancerTypes.find(type => type.id === value);

  return (
    <Container style={style}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <StyledInputLike onPress={openMenu} activeOpacity={0.8} hasError={style?.borderColor === '#ff6b6b'}>
            <InputText hasValue={!!value}>
              {selectedCancer ? selectedCancer.name : placeholder}
            </InputText>
            <IconContainer>
              <MaterialIcons name="favorite" size={24} color="#545f71" style={{ top: '70%' }}/>
            </IconContainer>
          </StyledInputLike>
        }
        contentStyle={{ borderRadius: 12 }}
      >
        {cancerTypes.map((type) => (
          <Menu.Item
            key={type.id} 
            onPress={() => handleSelect(type.id)} 
            title={type.name}
          />
        ))}
      </Menu>
    </Container>
  );
};

export default InputTypeCancer;