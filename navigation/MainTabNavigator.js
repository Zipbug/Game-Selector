import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/PlayerChooser';
import SettingsScreen from '../screens/SettingsScreen';

const HomeStack = createStackNavigator({
  Home: HomeScreen,
});

HomeStack.navigationOptions = {
  tabBarLabel: 'Collection',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-list' : 'md-reorder'}
    />
  ),
};

const LinksStack = createStackNavigator({
  Links: LinksScreen,
});

LinksStack.navigationOptions = {
  tabBarLabel: 'Player Chooser',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-locate' : 'md-locate'}
    />
  ),
};

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
});

SettingsStack.navigationOptions = {
  tabBarLabel: 'About',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />

  ),
};

const Navigator = createBottomTabNavigator({
  HomeStack,
  LinksStack,
  SettingsStack,
});

export default Navigator;
