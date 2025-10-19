import * as React from "react";
import { View, Text, ScrollView, SafeAreaView, Alert } from "react-native";
import { PaperProvider } from "react-native-paper";
import {
  DatePickerModal,
  TimePickerModal,
  pt,
  registerTranslation,
} from "react-native-paper-dates";
import styled from "styled-components/native";
import { AppTheme } from "../../../theme";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../../constants/api";
import BackIconButton from "@/components/BackIconButton";
import { AppointmentInput } from "@/components/Inputs/inputAppointment";
import { DateInput } from "@/components/Inputs/FormInputSymptom/DateInput";
import { TimeInput } from "@/components/Inputs/inputTime";
import { AddAppointmentButton } from "@/components/Buttons/AppointmentButton";
import { ObservationInput } from "@/components/Inputs/FormInputMedicine/ObservationInput";
import { LocationInput } from "@/components/Inputs/inputLocation";

registerTranslation("pt", pt);

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${AppTheme.colors.primary};
`;

const Header = styled(View)`
  height: 60px;
  justify-content: center;
  padding-left: 16px;
`;

const FormContainer = styled(View)`
  flex: 1;
  background-color: ${AppTheme.colors.cardBackground};
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  margin-top: 10px;
  padding: 32px 24px 24px 24px;
`;

const HeaderTitle = styled(Text)`
  font-family: ${AppTheme.fonts.titleLarge.fontFamily};
  font-size: ${AppTheme.fonts.titleLarge.fontSize}px;
  font-weight: ${AppTheme.fonts.titleLarge.fontWeight};
  color: ${AppTheme.colors.nameText};
  margin-bottom: 8px;
`;

const HeaderSubtitle = styled(Text)`
  font-family: ${AppTheme.fonts.bodyMedium.fontFamily};
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  color: ${AppTheme.colors.tertinaryTextColor};
  line-height: 20px;
  margin-bottom: 24px;
`;

const FormScrollView = styled(ScrollView)`
  flex: 1;
`;

const FieldLabel = styled(Text)`
  font-family: ${AppTheme.fonts.bodyMedium.fontFamily};
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  font-weight: 600;
  color: ${AppTheme.colors.nameText};
  margin-bottom: 8px;
  margin-top: 16px;
`;

const FirstFieldLabel = styled(FieldLabel)`
  margin-top: 0px;
`;

export default function CompromissosAdd() {
  const [appointmentName, setAppointmentName] = React.useState("");
  const [appointmentDate, setAppointmentDate] = React.useState<
    Date | undefined
  >(undefined);
  const [appointmentTime, setAppointmentTime] = React.useState("");
  const [appointmentLocation, setAppointmentLocation] = React.useState("");
  const [appointmentObservation, setAppointmentObservation] =
    React.useState("");
  const [visibleTimePicker, setVisibleTimePicker] = React.useState(false);

  const [visibleDatePicker, setVisibleDatePicker] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();

  const handleDateSelect = () => setVisibleDatePicker(true);

  const onDismissDatePicker = () => setVisibleDatePicker(false);

  const onConfirmDatePicker = (params: { date: Date }) => {
    setVisibleDatePicker(false);
    setAppointmentDate(params.date);
  };

  const handleTimeSelect = () => setVisibleTimePicker(true);

  const onDismissTimePicker = () => setVisibleTimePicker(false);

  const onConfirmTimePicker = ({ hours, minutes }) => {
    setVisibleTimePicker(false);
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
    setAppointmentTime(formattedTime);
  };

  const handleAddAppointment = async () => {
    if (
      !appointmentName ||
      !appointmentDate ||
      !appointmentTime ||
      !appointmentLocation
    ) {
      Alert.alert(
        "Erro",
        "Por favor, preencha todos os campos obrigatórios: Compromisso, Data, Hora e Local."
      );
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Erro", "Você não está autenticado.");
        setLoading(false);
        return;
      }
      
      // ALTERADO: A rota agora é mais simples e segura
      const endpoint = `${API_BASE_URL}/calendar/events`;
      
      const formattedDate = appointmentDate.toISOString().split("T")[0];

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointment_name: appointmentName,
          appointment_date: formattedDate,
          appointment_time: appointmentTime,
          local: appointmentLocation,
          observation: appointmentObservation,
        }),
      });
      
      if (response.ok) {
        Alert.alert("Sucesso", "Compromisso registrado com sucesso!");
        router.back();
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Erro",
          errorData.message || "Não foi possível registrar o compromisso."
        );
      }
    } catch (error) {
      console.error("Erro ao adicionar compromisso:", error);
      Alert.alert("Erro", "Ocorreu um erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    appointmentName !== "" &&
    appointmentDate !== undefined &&
    appointmentTime !== "" &&
    appointmentLocation !== "";

  const modalTheme = {
    colors: {
      primary: AppTheme.colors.primary,
      background: AppTheme.colors.cardBackground,
      surface: AppTheme.colors.cardBackground,
      onSurface: AppTheme.colors.nameText,
      onPrimary: AppTheme.colors.cardBackground,
      outline: AppTheme.colors.tertinaryTextColor,
    },
    roundness: 20,
  };

  return (
    <PaperProvider theme={modalTheme}>
      <Container>
        <Header>
          <BackIconButton
            color={AppTheme.colors.cardBackground}
            onPress={() => router.back()}
          />
        </Header>

        <FormContainer>
          <HeaderTitle>REGISTRAR COMPROMISSO</HeaderTitle>
          <HeaderSubtitle>
            Preencha o formulário para registrar um novo compromisso
          </HeaderSubtitle>

          <FormScrollView showsVerticalScrollIndicator={false}>
            <FirstFieldLabel>Compromisso</FirstFieldLabel>
            <AppointmentInput
              value={appointmentName}
              onChangeText={setAppointmentName}
              placeholder="Ex.: Exame de sangue"
            />

            <FieldLabel>Data do compromisso</FieldLabel>
            <DateInput
              value={
                appointmentDate
                  ? appointmentDate.toLocaleDateString("pt-BR")
                  : ""
              }
              onPress={handleDateSelect}
              placeholder="20/09/2025"
            />

            <FieldLabel>Hora do compromisso</FieldLabel>
            <TimeInput
              value={appointmentTime}
              onPress={handleTimeSelect}
              placeholder="Ex.: 13:00"
            />

            <FieldLabel>Local do compromisso</FieldLabel>
            <LocationInput
              value={appointmentLocation}
              onChangeText={setAppointmentLocation}
              placeholder="Ex.: Unidade de Santos"
            />

            <FieldLabel>Observação</FieldLabel>
            <ObservationInput
              value={appointmentObservation}
              onChangeText={setAppointmentObservation}
              placeholder="Ex.: Levar exames dos últimos 6 meses"
            />

            <AddAppointmentButton
              onPress={handleAddAppointment}
              disabled={!isFormValid || loading}
              loading={loading}
              style={{ marginTop: 24 }}
            />
          </FormScrollView>
        </FormContainer>

        <DatePickerModal
          locale="pt"
          mode="single"
          visible={visibleDatePicker}
          onDismiss={onDismissDatePicker}
          date={appointmentDate}
          onConfirm={onConfirmDatePicker}
          saveLabel="Salvar"
          label="Selecione a data"
        />

        <TimePickerModal
          visible={visibleTimePicker}
          onDismiss={onDismissTimePicker}
          onConfirm={onConfirmTimePicker}
          hours={12}
          minutes={0} 
          locale="pt"
          label="Selecione o horário"
          cancelLabel="Cancelar"
          confirmLabel="Salvar"
        />
      </Container>
    </PaperProvider>
  );
}