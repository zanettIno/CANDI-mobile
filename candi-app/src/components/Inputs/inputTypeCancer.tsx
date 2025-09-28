import React, { useState } from "react";
import { View } from "react-native";
import styled from "styled-components/native";
import { Menu } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

interface InputTypeCancerProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
}

const Container = styled(View)`
  position: relative;
  margin-bottom: 16px;
  margin: 16px;
`;

const StyledInputLike = styled.TouchableOpacity<{ isValid?: boolean }>`
  background-color: #f5f5f5;
  border-radius: 50px;
  padding: 16px 50px 16px 16px;
  font-size: 20px;
  border: 1px solid ${props => props.isValid === false ? '#ff6b6b' : 'transparent'};
  justify-content: center;
`;

const InputText = styled.Text`
  font-size: 20px;
  color: #545f71;
`;

const IconContainer = styled(View)`
  position: absolute;
  right: 16px;
  top: 50%;
  margin-top: -12px;
`;

const cancerTypes = [
  "Mama", "Próstata", "Pulmão", "Cólon e Reto", "Estômago", "Fígado", "Colo do Útero",
  "Esôfago", "Bexiga", "Linfoma não Hodgkin", "Leucemia", "Rim", "Pâncreas", "Tireoide",
  "Sistema Nervoso Central", "Ovário", "Melanoma", "Outros",
];

const InputTypeCancer: React.FC<InputTypeCancerProps> = ({
  value,
  onChangeText,
  placeholder = "Tipo do câncer",
  style,
}) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (item: string) => {
    onChangeText(item);
    closeMenu();
  };

  const isValid = !!value;

  return (
    <Container style={style}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <StyledInputLike onPress={openMenu} activeOpacity={0.8} isValid={isValid}>
            <InputText>{value || placeholder}</InputText>
            <IconContainer>
              <MaterialIcons name="favorite" size={24} color="#545f71" />
            </IconContainer>
          </StyledInputLike>
        }
        contentStyle={{ borderRadius: 12 }}
      >
        {cancerTypes.map((type) => (
          <Menu.Item
            key={type}
            onPress={() => handleSelect(type)}
            title={type}
          />
        ))}
      </Menu>
    </Container>
  );
};

export default InputTypeCancer;
