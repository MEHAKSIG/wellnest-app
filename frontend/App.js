import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider } from './UserContext';

import LoginScreen from './components/screens/login';
import RegisterScreen from './components/screens/registration';
import Dashboard from './components/screens/Dashboard';
import HealthDiary from './components/screens/HealthDiary';
import GlucoseScreen from './components/screens/Glucose';
import HeartRateScreen from './components/screens/HeartRate';
import InsulinScreen from './components/screens/insulin';
import MensesScreen from './components/screens/mensesScreen';
import ActivityScreen from './components/screens/activity';
import NutritionScreen from './components/screens/nutrition';
import UserProfileScreen from './components/screens/UserProfileScreen';
import PdfReportUploader from './components/screens/Reports';
import DoctorBotScreen from './components/screens/Doctor';
import CycleGraphScreen from './components/screens/CycleGraph';
import Prescription from './components/screens/Prescription';

import Breakfast from './components/screens/Breakfast'; // make sure this path is correct
import LunchDinnerList from './components/screens/LunchDinner';
import DessertsList from './components/screens/Desserts';
import LibreLinkScreen from './components/screens/LibreLink';
import MedtronicScreen from './components/screens/Medronic';
import VerioScreen from './components/screens/Verio';

const Stack = createNativeStackNavigator();

export default function App() {
  return (<UserProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Glucose" component={GlucoseScreen} />
        <Stack.Screen name="Heart Rate" component={HeartRateScreen} />
        <Stack.Screen name="Insulin" component={InsulinScreen} />
        <Stack.Screen name="Menses" component={MensesScreen} />
        <Stack.Screen name="Activity" component={ActivityScreen} />
        <Stack.Screen name="Nutrition" component={NutritionScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="HealthDiary" component={HealthDiary} />
        <Stack.Screen name="PdfReportUploader" component={PdfReportUploader} />
        <Stack.Screen name="DoctorBot" component={DoctorBotScreen} />
        <Stack.Screen name="Prescription" component={Prescription} options={{ headerShown: false }} />
        <Stack.Screen
          name="Breakfast"
          component={Breakfast}
          options={{ headerShown: true, title: 'Diabetic Breakfast Recipes' }}
        />
        <Stack.Screen
          name="LunchDinner"
          component={LunchDinnerList}
          options={{ headerShown: true, title: 'Diabetic LunchDinner Recipes' }}
        />
        <Stack.Screen
          name="Desserts"
          component={DessertsList}
          options={{ headerShown: true, title: 'Diabetic Desserts Recipes' }}
        />
        <Stack.Screen name="LibreLinkScreen" component={LibreLinkScreen} />
        <Stack.Screen name="MedtronicScreen" component={MedtronicScreen} />
        <Stack.Screen name="VerioScreen" component={VerioScreen} />
        <Stack.Screen name="CycleGraphScreen" component={CycleGraphScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </UserProvider>
  );
}
