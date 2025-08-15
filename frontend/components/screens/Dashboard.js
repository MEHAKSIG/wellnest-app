import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import HealthArticles from './HeathArticle';
import RecipeBook from './Recipe';
import ReportVault from './Vault';
import ModelPage from './Diabemo';
import { getLatestCgmLogNearNow } from '../utilityV8/cgmService';
import {
  getLatestInsulinLogNearNow,
  getInsulinLog,
} from '../utilityV8/insulinService';
import { getUserTracking, getUser } from '../utilityV8/userService';
import { checkAndSyncFitbit } from '../utilityV8/utility';
import { useUser } from '../../UserContext';
import { updateActivityLogsWithHeartRate,getLatestNonZeroHeartRateToday } from '../utilityV8/activityService';
import { auth } from '../../firebase';
import {
  uploadDummyMensesData,
  fetchDummyMensesData,
  uploadDummyCarbLogs,
} from '../utilityV8/dummy_mense';

const userId = auth.currentUser?.uid || '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';
const { width } = Dimensions.get('window');

const quotes = [
  'Your health is your wealth.',
  'Every step counts toward a healthier you.',
  'Wellness is a daily commitment.',
  'Small habits make big changes.',
  "Take care of your body—it's the only place you live.",
];

const DashboardHome = () => {
  const navigation = useNavigation();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [glucose, setGlucose] = useState('-- mg/dL');
  const [insulin, setInsulin] = useState('-- units');
  const [heartrate, setHeartrate] = useState('-- bpm');
  const [steps, setSteps] = useState('-- cal');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { setUser } = useUser();
  const animateQuote = useCallback(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    });
  }, [fadeAnim]);

  useFocusEffect(
    useCallback(() => {
      const fetchLatest = async () => {
        checkAndSyncFitbit();
        const glucose = await getLatestCgmLogNearNow().then((val) =>
          val !== undefined ? `${parseFloat(val).toFixed(3)} mg/dL` : '-- mg/dL'
        );
        setGlucose(glucose);
        const log = await getLatestNonZeroHeartRateToday();
        if (log && log.heart_rate) {
          setHeartrate(`${log.heart_rate} bpm`);
        } else {
          setHeartrate('No data');
        }
        const insulin = await getLatestInsulinLogNearNow().then((val) =>
          val !== undefined ? `${parseFloat(val).toFixed(3)} mg/dL` : '-- mg/dL'
        );
        setInsulin(insulin);
        const tracking = await getUserTracking();
        console.log(tracking);
        const bolusTimestamp = tracking?.last_predicted_bolus;
        console.log(bolusTimestamp);

        if (bolusTimestamp?.toDate) {
          const log = await getInsulinLog(bolusTimestamp.toDate());
          if (log?.bolus !== undefined) {
            const insulin = `${parseFloat(log.bolus).toFixed(3)} Units`;
            setInsulin(insulin);
          }
        }
      };

      fetchLatest(); // 🔁 called every time screen is focused
    }, [])
  );

  useEffect(() => {
    animateQuote();
    const interval = setInterval(animateQuote, 4000);

    //Comment after use
    const loadData = async () => {
      //const uid='oC2CP74HEUU8ZLnuHTV6DNyreaW2';
      const uid = '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';
      const userDoc = await getUser(uid);
      console.log(userDoc);
      setUser({ uid, ...userDoc });
    };
    //loadData();
    //updateActivityLogsWithHeartRate()
    //console.log(userId)
    //uploadDummyMensesData();
    //uploadDummyCarbLogs();
    //checkAndSyncFitbit();
    //   const loadData = async () => {
    //   const result = await fetchDummyMensesData();
    //   console.log("dummy data:", result);
    //   // setData(result); // optional: store in state
    // };
    //loadData()
    return () => clearInterval(interval);
  }, [animateQuote]);

  const data = [
    {
      title: 'Heart Rate',
      value: heartrate,
      icon: require('../../assets/heart.png'),
      bgColor: '#C5E4E7',
      screen: 'Heart Rate',
    },
    {
      title: 'Blood Sugar',
      value: glucose,
      icon: require('../../assets/glucose.png'),
      bgColor: '#FAD4D4',
      screen: 'Glucose',
    },
    {
      title: 'Insulin',
      value: insulin,
      icon: require('../../assets/insulin.png'),
      bgColor: '#FFE0B2',
      screen: 'Insulin',
    },
    {
      title: 'Activity',
      value: 'steps',
      icon: require('../../assets/activity.png'),
      bgColor: '#E1BEE7',
      screen: 'Activity',
    },
    {
      title: 'Nutrition',
      value: '3 Meals',
      icon: require('../../assets/apple.png'),
      bgColor: '#C8E6C9',
      screen: 'Nutrition',
    },
    {
      title: 'Menstrual',
      value: '3 days left',
      icon: require('../../assets/menses.png'),
      bgColor: '#F8BBD0',
      screen: 'Menses',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ position: 'relative' }}>
          <ImageBackground
            source={require('../../assets/girl.png')}
            style={styles.imageBg}
            imageStyle={{
              width: width,
              height: '100%',
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              resizeMode: 'cover',
            }}>
            {/* 🔵 User Profile Button (top-right) */}
            <TouchableOpacity
              style={{ position: 'absolute', top: 40, right: 20 }}
              onPress={() => navigation.navigate('UserProfile')}>
              <Ionicons name="person-circle-outline" size={36} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerTextBox}>
              <Text style={styles.headerText}>WellNest</Text>
            </View>
            <View style={styles.overlay}>
              <View style={styles.glucoseBanner}>
                <Text style={styles.glucoseBannerText}>
                  Keep your glucose below 150 mg/dL
                </Text>
              </View>
              <Animated.Text style={[styles.quote, { opacity: fadeAnim }]}>
                {quotes[quoteIndex]}
              </Animated.Text>
            </View>
          </ImageBackground>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.monthScroll}>
          {[
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
            'Jan',
            'Feb',
          ].map((month, index) => (
            <TouchableOpacity key={index} style={styles.monthButton}>
              <Text style={styles.monthText}>{month}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.grid}>
          {data.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, { backgroundColor: item.bgColor }]}
              onPress={() => navigation.navigate(item.screen)}>
              <Image source={item.icon} style={styles.cardIcon} />
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardValue}>{item.value}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Tab = createBottomTabNavigator();

const Dashboard = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 5,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Health') iconName = 'newspaper-outline';
          else if (route.name === 'Recipes') iconName = 'restaurant-outline';
          else if (route.name === 'Dashboard') iconName = 'home-outline';
          else if (route.name === 'Vault') iconName = 'folder-open-outline';
          else if (route.name === 'Diabemo') iconName = 'pulse-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}>
      <Tab.Screen name="Health" component={HealthArticles} />
      <Tab.Screen name="Recipes" component={RecipeBook} />
      <Tab.Screen name="Dashboard" component={DashboardHome} />
      <Tab.Screen name="Vault" component={ReportVault} />
      <Tab.Screen name="Diabemo" component={ModelPage} />
    </Tab.Navigator>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  container: {
    paddingBottom: 80, // 🔼 More space for bottom tab
    paddingTop: 10, // 🔼 Push content slightly down from top
  },
  imageBg: {
    width: width,
    height: Platform.OS === 'ios' ? 320 : 320,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTextBox: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  headerText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  overlay: {
    alignItems: 'center',
  },
  glucoseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6E6E',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  glucoseBannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  quote: {
    color: '#EEE',
    marginTop: 10,
    fontStyle: 'italic',
    fontSize: 13,
    textAlign: 'center',
  },
  monthScroll: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  monthButton: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  monthText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginTop: 10, // 🔽 Reduced from 20
  },
  card: {
    width: '42%',
    height: 130,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8, // 🔽 Reduced vertical margin
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    padding: 10,
  },
  cardIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  cardValue: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});

// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import {
//   SafeAreaView,
//   ScrollView,
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   ImageBackground,
//   StyleSheet,
//   Animated,
//   Dimensions,
//   Platform,
// } from 'react-native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { useNavigation } from '@react-navigation/native';

// import HealthArticles from './HeathArticle';
// import RecipeBook from './Recipe';
// import ReportVault from './Vault';
// import ModelPage from './Diabemo';

// const { width } = Dimensions.get('window');

// const quotes = [
//   "Your health is your wealth.",
//   "Every step counts toward a healthier you.",
//   "Wellness is a daily commitment.",
//   "Small habits make big changes.",
//   "Take care of your body—it's the only place you live.",
// ];

// const DashboardHome = () => {
//   const navigation = useNavigation();
//   const [quoteIndex, setQuoteIndex] = useState(0);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   const animateQuote = useCallback(() => {
//     Animated.sequence([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//       Animated.delay(2500),
//       Animated.timing(fadeAnim, {
//         toValue: 0,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//     ]).start(() => {
//       setQuoteIndex((prev) => (prev + 1) % quotes.length);
//     });
//   }, [fadeAnim]);

//   useEffect(() => {

//     animateQuote();
//     const interval = setInterval(animateQuote, 4000);
//     return () => clearInterval(interval);
//   }, [animateQuote]);

//   const data = [
//     { title: 'Heart Rate', value: '60 bpm', icon: require('../../assets/heart.png'), bgColor: '#C5E4E7', screen: 'Heart Rate' },
//     { title: 'Blood Sugar', value: '97 mg/dL', icon: require('../../assets/glucose.png'), bgColor: '#FAD4D4', screen: 'Glucose' },
//     { title: 'Insulin', value: '22 units', icon: require('../../assets/insulin.png'), bgColor: '#FFE0B2', screen: 'Insulin' },
//     { title: 'Activity', value: '120 cal', icon: require('../../assets/activity.png'), bgColor: '#E1BEE7', screen: 'Activity' },
//     { title: 'Nutrition', value: '3 Meals', icon: require('../../assets/apple.png'), bgColor: '#C8E6C9', screen: 'Nutrition' },
//     { title: 'Menstrual', value: '3 days left', icon: require('../../assets/menses.png'), bgColor: '#F8BBD0', screen: 'Menses' },
//   ];

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView contentContainerStyle={styles.container}>
//         <View style={{ position: 'relative' }}>
//           <ImageBackground
//             source={require('../../assets/girl.png')}
//             style={styles.imageBg}
//             imageStyle={{
//               width: width,
//               height: '100%',
//               borderBottomLeftRadius: 20,
//               borderBottomRightRadius: 20,
//               resizeMode: 'cover',
//             }}
//           >
//             <View style={styles.headerTextBox}>
//               <Text style={styles.headerText}>WellNest</Text>
//             </View>
//             <View style={styles.overlay}>
//               <View style={styles.glucoseBanner}>
//                 <Text style={styles.glucoseBannerText}>Keep your glucose below 150 mg/dL</Text>
//               </View>
//               <Animated.Text style={[styles.quote, { opacity: fadeAnim }]}>
//                 {quotes[quoteIndex]}
//               </Animated.Text>
//             </View>
//           </ImageBackground>
//         </View>

//         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
//           {['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'].map((month, index) => (
//             <TouchableOpacity key={index} style={styles.monthButton}>
//               <Text style={styles.monthText}>{month}</Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         <View style={styles.grid}>
//           {data.map((item, index) => (
//             <TouchableOpacity
//               key={index}
//               style={[styles.card, { backgroundColor: item.bgColor }]}
//               onPress={() => navigation.navigate(item.screen)}
//             >
//               <Image source={item.icon} style={styles.cardIcon} />
//               <Text style={styles.cardTitle}>{item.title}</Text>
//               <Text style={styles.cardValue}>{item.value}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const Tab = createBottomTabNavigator();

// const Dashboard = () => {
//   return (
//     <Tab.Navigator
//       initialRouteName="Dashboard"
//       screenOptions={({ route }) => ({
//         headerShown: false,
//         tabBarActiveTintColor: '#7c3aed',
//         tabBarInactiveTintColor: 'gray',
//         tabBarStyle: { height: 60, paddingBottom: 5 },
//         tabBarIcon: ({ color, size }) => {
//           let iconName;
//           if (route.name === 'Health') iconName = 'newspaper-outline';
//           else if (route.name === 'Recipes') iconName = 'restaurant-outline';
//           else if (route.name === 'Dashboard') iconName = 'home-outline';
//           else if (route.name === 'Vault') iconName = 'folder-open-outline';
//           else if (route.name === 'Diabemo') iconName = 'pulse-outline';
//           return <Ionicons name={iconName} size={22} color={color} />;
//         },
//       })}
//     >
//       <Tab.Screen name="Health" component={HealthArticles} />
//       <Tab.Screen name="Recipes" component={RecipeBook} />
//       <Tab.Screen name="Dashboard" component={DashboardHome} />
//       <Tab.Screen name="Vault" component={ReportVault} />
//       <Tab.Screen name="Diabemo" component={ModelPage} />
//     </Tab.Navigator>
//   );
// };

// export default Dashboard;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#0A0F1C',
//   },
//   container: {
//     paddingBottom: 30,
//   },
//   imageBg: {
//     width: width,
//     height: Platform.OS === 'ios' ? 320 : 320,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//     paddingBottom: 30,
//     paddingHorizontal: 20,
//   },
//   headerTextBox: {
//     position: 'absolute',
//     top: 40,
//     left: 20,
//   },
//   headerText: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   overlay: {
//     alignItems: 'center',
//   },
//   glucoseBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FF6E6E',
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginTop: 10,
//   },
//   glucoseBannerText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   quote: {
//     color: '#EEE',
//     marginTop: 10,
//     fontStyle: 'italic',
//     fontSize: 13,
//     textAlign: 'center',
//   },
//   monthScroll: {
//     marginTop: 10,
//     paddingHorizontal: 16,
//   },
//   monthButton: {
//     backgroundColor: '#1f2937',
//     borderRadius: 20,
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     marginRight: 10,
//   },
//   monthText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-evenly',
//     marginTop: 20,
//   },
//   card: {
//     width: '42%',
//     height: 130,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginVertical: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 5,
//     padding: 10,
//   },
//   cardIcon: {
//     width: 32,
//     height: 32,
//     resizeMode: 'contain',
//     marginBottom: 6,
//   },
//   cardTitle: {
//     fontSize: 16,
//     color: '#333',
//     fontWeight: 'bold',
//   },
//   cardValue: {
//     fontSize: 14,
//     color: '#555',
//     marginTop: 4,
//   },
// });
// //REMOVE BELOW IMPORT
// // import { addUser } from '../utilityV8/userService';
// // import { addMultipleCgmRecords } from '../utilityV8/cgmService';
// // import { addMultipleVaultFiles } from '../utilityV8/vaultService';
// // useEffect(() => {
// //   // Quote animation (keep your existing logic)
// //   animateQuote();
// //   const interval = setInterval(animateQuote, 4000);

// //   // Seed function
// //   const seedDashboardData = async () => {
// //     try {
// //       const userId = 'user_20250503_garima';

// //       console.log('🚀 Seeding started');

// //       // Add user
// //       await addUser({
// //         name: 'Garima',
// //         email: 'garryj15107@gmail.com',
// //         phone: '9876543210',
// //         dob: '1995-06-15',
// //         gender: 'female',
// //         cgm_device_id: 'CGM1234',
// //         fitbit_permission: true,
// //         user_id: userId,
// //       });

// //       // Add 100 CGM logs
// //       const now = new Date();
// //       const cgmData = Array.from({ length: 100 }, (_, i) => ({
// //         glucose_value: Math.floor(70 + Math.random() * 80),
// //         reading_time: new Date(now.getTime() - i * 5 * 60 * 1000).toISOString(),
// //         device: 'FreeStyle Libre 2',
// //       }));

// //       await addMultipleCgmRecords(userId, cgmData);

// //       // Add vault files
// //       const vaultFiles = [
// //         {
// //           file_url: 'https://www.google.com',
// //           file_name: 'Prescription1',
// //           file_type: 'prescriptions',
// //         },
// //         {
// //           file_url: 'https://www.google.com',
// //           file_name: 'Report1',
// //           file_type: 'reports',
// //         },
// //         {
// //           file_url: 'https://www.google.com',
// //           file_name: 'Prescription2',
// //           file_type: 'prescriptions',
// //         },
// //       ];

// //       await addMultipleVaultFiles(userId, vaultFiles);

// //       console.log('✅ Seeding completed successfully');
// //     } catch (error) {
// //       console.error('❌ Error seeding dashboard data:', error);
// //     }
// //   };

// //   seedDashboardData();

// //   // Cleanup
// //   return () => clearInterval(interval);
// // }, [animateQuote]);
