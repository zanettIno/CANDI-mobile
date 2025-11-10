import { Redirect } from 'expo-router';

/*
  Este componente existe apenas para que o Expo Router "veja" um arquivo
  chamado "homeApp" e possa renderizar a aba "Início" no layout.
  Ao ser clicado, ele imediatamente redireciona para a home principal.
*/
export default function HomeAppRedirect() {
  return <Redirect href="/screens/home" />;
}