import { Image, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { useWindowDimensions } from 'react-native';

export default function CandiLogo({bottom, version}) {
    const { width, height } = useWindowDimensions();
  return (
    <PaperProvider>
        <View style={{
            height: width - 650,
            width: height - 650,
            bottom: bottom}}>

            <Image style={{
                height: '100%',
                width: '100%',
                resizeMode: 'contain'}} 
                    source={version}/>

        </View>
    </PaperProvider>
  );
}