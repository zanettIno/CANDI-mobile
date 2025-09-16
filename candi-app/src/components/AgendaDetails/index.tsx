import { useState } from 'react';
import { View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme';

const { height: height } = Dimensions.get('window');

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

export default function HomeAgenda() {
    const [expandido, setExpandido] = useState(false);

    const altDetails = expandido ? height * 0.57 : height * 0.15;

    const toggleSheet = () => {
        setExpandido(!expandido);
    };

    return (
        <ContainerDetails height={altDetails}>
            <UpDown onPress={toggleSheet}>
                <Macaneta/>
            </UpDown>
            {setExpandido && <ContainerInfo>
                
            {
                // Vai ir MUITA coisa aq dentro, might see it later on
            }

            </ContainerInfo>}
        </ContainerDetails>
    );
};