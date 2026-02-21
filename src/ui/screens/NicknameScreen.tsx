import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.ts';
import { NicknameModal } from '../components/NicknameModal.tsx';

type Props = NativeStackScreenProps<RootStackParamList, 'HomeScreen'>;

export const NicknameScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <NicknameModal
      visible
      onComplete={() => navigation.replace('HomeScreen')}
    />
  );
};
