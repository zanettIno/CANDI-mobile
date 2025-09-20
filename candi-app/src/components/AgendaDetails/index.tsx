import { useState } from 'react';
import { View, TouchableOpacity, Dimensions, ScrollView, Text } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme';
import AppointmentTimeline from '../appointmentTimeline';
import ButtonCustom from '../Buttons/buttonCustom';

const { height: height } = Dimensions.get('window');

const meses = ['JANEIRO', 'FEVEREIRO', 'MARCO', 
               'ABRIL', 'MAIO', 'JUNHO', 
               'JULHO', 'AGOSTO', 'SETEMBRO', 
               'OUTUBRO', 'NOVEMBRO' , 'DEZEMBRO']

const hoje = new Date();
const ano = hoje.getFullYear();
const mes = hoje.getMonth() + 1;
const dia = hoje.getDate();

const ContainerDetails = styled(ScrollView)`
    position: absolute;
    bottom: 0;
    width: 100%;
    background-color: ${AppTheme.colors.cardBackground};
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
`;

const UpDown = styled(TouchableOpacity)`
    align-items: center;
    padding-top: 15px;
    padding-bottom: 15px;
`;

const Macaneta = styled(View)`
    width: 40px;
    height: 5px;
    background-color: #ccc;
    border-radius: 2.5px;
`;

const ContainerInfo = styled(View)`
  flex: 1;
  padding-left: 20px;
  padding-right: 20px;
`;

const ContainerMedicamentos = styled(View)`
  flex: 1;
  height: 120px;
  border-radius: 16px;
  background-color: ${AppTheme.colors.tertiary};
`;

export default function BottomSheet() {
    const [expandido, setExpandido] = useState(false);

    const altDetails = expandido ? height * 0.57 : height * 0.10;

    const toggleSheet = () => {
        setExpandido(!expandido);
    };

    return (
        <ContainerDetails height={altDetails}>
            <UpDown onPress={toggleSheet}>
                <Macaneta/>
            </UpDown>
            {setExpandido && <ContainerInfo>
                    <Text style={{
                        fontFamily: AppTheme.fonts.titleLarge.fontFamily,
                        fontSize: AppTheme.fonts.titleLarge.fontSize,
                        color: AppTheme.colors.tertiary}}>
                        HOJE, {dia} DE {meses[mes-1]}
                    </Text>
                    <AppointmentTimeline/>

                    <Text style={{
                        fontFamily: AppTheme.fonts.titleLarge.fontFamily,
                        fontSize: AppTheme.fonts.titleLarge.fontSize,
                        color: AppTheme.colors.tertiary,
                        paddingVertical: '6%'}}>
                        MEDICAMENTOS
                    </Text>

                    <ContainerMedicamentos>

                    </ContainerMedicamentos>

                    <ButtonCustom
                        title="Registrar medicamento"
                        onPress={() => { console.log("foi") }}
                        variant="secondary"/>
            </ContainerInfo>}
        </ContainerDetails>
    );
};