import * as React from 'react';
import { View, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import CandiLogo from '@/components/WhiteCandiLogo';
import BackIconButton from '@/components/BackIconButton';
import { AppTheme } from '../../../theme';
import { useEffect, useState } from 'react';

export default function Relatorio() {
  const [lista, setLista] = useState([]);
  
  async function carregarDados() {
    try {
      var resultado = await fetch('https://fakestoreapi.com/products');
      var lst = await resultado.json();
      setLista(lst);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <PaperProvider>
      <View style={{ flex: 1, backgroundColor: AppTheme.colors.cardBackground }}>
        <BackIconButton left={'2%'} color={AppTheme.colors.primary} bottom={'-215%'}/>
        <View style={{
          flex: 1,
          width: '100%',
          padding: 10
        }}>
          <CandiLogo left={'24%'} bottom={'122%'} version={require('../../../../assets/images/original.png')}/>
          <View style={{
            position: 'absolute',
            flex: 1,
            marginTop: '-60%',
            marginLeft: '5%',
          }}>
          <Text style={{
            fontFamily: AppTheme.fonts.displayLarge.fontFamily,
            fontStyle: AppTheme.fonts.displayLarge.fontStyle,
            fontSize: AppTheme.fonts.titleLarge.fontSize
          }}>RELATORIO GERAL</Text>
          {/*
          {
            lista.map((prod) => (
              <Text key={prod.id} style={AppTheme.fonts.labelLarge}>
                {prod.title}
              </Text>
            ))
          }
          */}
          </View>
        </View>
      </View>
    </PaperProvider>
  );
}