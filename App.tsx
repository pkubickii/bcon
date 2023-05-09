/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type { PropsWithChildren } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { styled } from 'nativewind';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({ children, title }: SectionProps): JSX.Element {
  return (
    <View className="mt-8 px-2">
      <Text className="text-2xl text-black dark:text-white">{title}</Text>
      <Text className="mt-2 text-lg text-black dark:text-white">
        {children}
      </Text>
    </View>
  );
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = 'bg-slate-300 dark:bg-slate-900';

  return (
    <SafeAreaView className="flex-1">
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#0f172a' : '#cbd5e1'}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className={backgroundStyle}>
        <View className="items-center justify-start bg-slate-200 dark:bg-slate-700">
          <Section title="Beacon Admin App">Rozpoczęto skanowanie...</Section>
        </View>
        <View className="items-start justify-start min-h-screen bg-slate-300 dark:bg-slate-500">
          <Text className=" text-lg text-black dark:text-white">Beacon 1</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
