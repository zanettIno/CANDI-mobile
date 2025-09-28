import React from "react";
import { TextInput, View, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { MaterialIcons } from "@expo/vector-icons";

interface InputBirthProps {
  value: string;
  onChangeText: (date: Date | null, text: string) => void; // retorna Date e string
  placeholder?: string;
  style?: any;
}

const Container = styled(View)`
  position: relative;
  margin-bottom: 16px;
  margin: 16px;
`;

const StyledTextInput = styled(TextInput)`
  background-color: #f5f5f5;
  border-radius: 50px;
  padding: 16px 50px 16px 16px;
  font-size: 20px;
  color: #545f71;
  border: 1px solid transparent;
`;

const IconContainer = styled(TouchableOpacity)`
  position: absolute;
  right: 16px;
  top: 50%;
  margin-top: -12px;
`;

const InputBirth: React.FC<InputBirthProps> = ({
  value,
  onChangeText,
  placeholder = "Data de nascimento",
  style,
}) => {
  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, ""); // só números
    if (cleaned.length <= 8) {
      const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
      if (match) {
        let formatted = "";
        if (match[1]) formatted += match[1];
        if (match[2]) formatted += `/${match[2]}`;
        if (match[3]) formatted += `/${match[3]}`;
        return formatted;
      }
    }
    return text;
  };

  const parseDate = (text: string): Date | null => {
    if (text.length !== 10) return null;
    const [day, month, year] = text.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }
    return null;
  };

  const isValidDate = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date <= today;
  };

  const handleChangeText = (text: string) => {
    const formatted = formatDate(text);
    const date = parseDate(formatted);
    const validDate = isValidDate(date) ? date : null; // se inválido, devolve null
    onChangeText(validDate, formatted);
  };

  return (
    <Container style={style}>
      <StyledTextInput
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        keyboardType="numeric"
        maxLength={10}
        style={{
          borderColor: value && !isValidDate(parseDate(value))
            ? "#ff6b6b"
            : "transparent"
        }}
      />
      <IconContainer>
        <MaterialIcons name="calendar-today" size={24} color="#545f71" />
      </IconContainer>
    </Container>
  );
};

export default InputBirth;
