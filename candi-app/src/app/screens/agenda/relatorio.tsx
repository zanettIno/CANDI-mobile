import * as React from 'react';
import { View, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import CandiLogo from '@/components/WhiteCandiLogo';
import BackIconButton from '@/components/BackIconButton';
import { AppTheme } from '../../../theme';
import { useEffect, useState } from 'react';

export default function Relatorio() {

const [lista, setLista] = useState([]);

  // Teste com API de produtos do Rony, 
  //  inserir url da API nossa dps!! 
  //    kisses XOXO
  //    -Z
  
  async function carregarDados() {
    var resultado = await fetch('https://fakestoreapi.com/products');
    var lst = await resultado.json();
    console.log(lst);
    setLista(lst);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <PaperProvider>
      <View>
        <CandiLogo bottom={'20%'} version={require('../../../../assets/images/rosa_full.png')}/>
        <BackIconButton/>
        {
          lista.map((prod) => {
            return (
            <Text style={AppTheme.fonts.labelLarge}>
              {prod.title}
            </Text>
            )
          })
        }
      </View>
    </PaperProvider>
  );
}