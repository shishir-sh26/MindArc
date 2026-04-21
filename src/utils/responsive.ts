import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const wp = (percent: number) => (SCREEN_W * percent) / 100;
export const hp = (percent: number) => (SCREEN_H * percent) / 100;
export const rf = (size: number) => size * PixelRatio.getFontScale();
