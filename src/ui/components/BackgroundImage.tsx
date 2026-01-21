import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Bird } from './Bird';

const BIRDS = [
  { id: 1, startY: 80, size: 6, duration: 25000, delay: 0, flapSpeed: 300 },
  { id: 2, startY: 120, size: 8, duration: 20000, delay: 3000, flapSpeed: 250 },
  { id: 3, startY: 60, size: 5, duration: 30000, delay: 8000, flapSpeed: 350 },
  { id: 4, startY: 140, size: 7, duration: 22000, delay: 12000, flapSpeed: 280 },
];

export default function BackgroundImage() {
  return (
    <View style={styles.container} pointerEvents="none">
      <Image
        style={styles.image}
        source={require('../../../assets/background.jpg')}
      />
      {BIRDS.map(bird => (
        <Bird
          key={bird.id}
          startY={bird.startY}
          size={bird.size}
          duration={bird.duration}
          delay={bird.delay}
          flapSpeed={bird.flapSpeed}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
