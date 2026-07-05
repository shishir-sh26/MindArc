import type { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  Home: undefined;
  Learn: undefined;
  Track: undefined;
  Relax: undefined;
  Activity: undefined;
  ThoughtDiary: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Tabs: NavigatorScreenParams<BottomTabParamList>;
  ModuleDetail: { module: any };
  TrackerHistory: undefined;
  ThoughtDiary: undefined;
  NewThoughtEntry: undefined;
  Breathing: undefined;
  NatureSounds: undefined;
  RelievingGames: undefined;
  YogaPlayer: { videoUrl: string, title: string };
  Crisis: undefined;
  UserDetails: undefined;
};
