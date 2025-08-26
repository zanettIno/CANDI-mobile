import * as React from 'react';
import { View, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../theme';
import Carousel, { CarouselItem } from '../components/Carousel/carousel';

const demoData: CarouselItem[] = [
  { title: 'Slide 1', image: 'https://picsum.photos/600/400?1' },
  { title: 'Slide 2', image: 'https://picsum.photos/600/400?2' },
  { title: 'Slide 3', image: 'https://picsum.photos/600/400?3' },
];

export default function Index() {
  return (
    <PaperProvider theme={AppTheme}>
      <View style={{ flex: 1, paddingTop: 50, backgroundColor: AppTheme.colors.background }}>
        <Text
          style={{
            color: AppTheme.colors.textColor,
            fontSize: 20,
            margin: 20,
            fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
          }}
        >
          Oioi Candi!! CHZ
        </Text>

        <Carousel
          data={demoData}
          onItemPress={(item) => console.log('Clicou em:', item)}
        />
      </View>
    </PaperProvider>
  );
}
