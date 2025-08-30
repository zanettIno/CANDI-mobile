import React from 'react';
import { View, Dimensions, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
const { height: screenHeight } = Dimensions.get('window');

export type CarouselItem = {
  title: string;
  image?: string;
};

type Props = {
  data: CarouselItem[];
  onItemPress?: (item: CarouselItem) => void;
};

const { width: screenWidth } = Dimensions.get('window');

const CarouselComponent: React.FC<Props> = ({ data, onItemPress }) => {
  const renderItem = ({ item }: { item: CarouselItem }) => (
    <TouchableOpacity onPress={() => onItemPress?.(item)}>
      <View style={styles.itemContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.title}>{item.title}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Carousel
      loop
      width={screenWidth}        
      height={screenHeight * 0.3}
      autoPlay={false}
      data={data}
      scrollAnimationDuration={500}
      mode="parallax"              
      modeConfig={{
        parallaxScrollingScale: 0.9,
        parallaxAdjacentItemScale: 0.8,
    }}
    renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    width: '100%',   
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CarouselComponent;
