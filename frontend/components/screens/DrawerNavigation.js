import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Dashboard from './Dashboard';
import GlucoseScreen from './Glucose';
import HeartRateScreen from './HeartRate';
import InsulinScreen from './insulin';
import MensesScreen from './mensesScreen';
import ActivityScreen from './activity';
import NutritionScreen from './nutrition';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Glucose" component={GlucoseScreen} />
      <Drawer.Screen name="Heart Rate" component={HeartRateScreen} />
      <Drawer.Screen name="Insulin" component={InsulinScreen} />
      <Drawer.Screen name="Menses" component={MensesScreen} />
      <Drawer.Screen name="Activity" component={ActivityScreen} />
      <Drawer.Screen name="Nutrition" component={NutritionScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
