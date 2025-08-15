// 🌸 CycleCalendarScreen – Enhanced Feminine Tracker UI
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

export default function CycleCalendarScreen({ navigation }) {
  const [cycleStartDate, setCycleStartDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [showGraph, setShowGraph] = useState(false);

  const handleDateSelect = (day) => {
    setCycleStartDate(day.dateString);
    const start = new Date(day.dateString);
    const marked = {};

    const addDays = (date, days) => {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + days);
      return newDate.toISOString().split('T')[0];
    };

    const markRange = (startOffset, endOffset, color) => {
      for (let i = startOffset; i <= endOffset; i++) {
        const date = addDays(start, i);
        marked[date] = {
          customStyles: {
            container: {
              backgroundColor: color,
              borderRadius: 14,
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.3,
              shadowRadius: 2
            },
            text: {
              color: '#fff',
              fontWeight: 'bold'
            }
          }
        };
      }
    };

    markRange(0, 4, '#FF4F7A'); // Period
    markRange(5, 12, '#FD9DC6'); // Symptoms (Follicular-like)
    markRange(13, 14, '#2D2F74'); // Ovulation
    markRange(15, 27, '#FFB7B2'); // Luteal

    const nextCycleStart = addDays(start, 28);
    markRange(28, 32, '#FF4F7A'); // Next Period

    setMarkedDates(marked);
  };

  return (
    <ImageBackground source={{ uri: 'https://images.pexels.com/photos/3746214/pexels-photo-3746214.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} style={styles.backgroundImage}>
      <View style={styles.gradientOverlay}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonWrap}>
          <Ionicons name="arrow-back" size={24} color="#FF4F7A" />
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>💖 My Period Calendar</Text>
        <Text style={styles.subHeader}>Tap your last period start date 👇</Text>

        <Calendar
          onDayPress={handleDateSelect}
          markedDates={markedDates}
          markingType={'custom'}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            selectedDayTextColor: '#fff',
            todayTextColor: '#FFC1E3',
            arrowColor: '#FF4F7A',
            monthTextColor: '#FF6CA4',
            textDayFontWeight: '600',
            textMonthFontWeight: 'bold',
            dayTextColor: '#fff',
            textDisabledColor: '#A79BBF'
          }}
          style={styles.calendar}
        />

        {cycleStartDate && (
          <Text style={styles.selectedDate}>🗓️ Start: {cycleStartDate}</Text>
        )}

        <View style={styles.legendWrap}>
          <Text style={styles.legend}><Text style={[styles.pill, { backgroundColor: '#FF4F7A' }]}>🩸</Text> Period</Text>
          <Text style={styles.legend}><Text style={[styles.pill, { backgroundColor: '#FD9DC6' }]}>🌸</Text> Symptoms</Text>
          <Text style={styles.legend}><Text style={[styles.pill, { backgroundColor: '#2D2F74' }]}>🌼</Text> Ovulation</Text>
          <Text style={styles.legend}><Text style={[styles.pill, { backgroundColor: '#FFB7B2' }]}>🩷</Text> Luteal</Text>
          <Text style={styles.legend}><Text style={[styles.pill, { backgroundColor: '#FF4F7A' }]}>🔮</Text> Next Cycle</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CycleGraphScreen')} style={styles.nextButton}>
  <Text style={styles.nextButtonText}>View Glucose Graph ➡️</Text>
</TouchableOpacity>

      </View>
      
      </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  nextButton: {
    backgroundColor: '#FF4F7A',
    marginTop: 20,
    marginHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: 'rgba(40, 27, 74, 0.65)',
    paddingHorizontal: 0,
    justifyContent: 'center'
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover'
  },
  container: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    color: '#FFDCEC',
    marginBottom: 6,
    letterSpacing: 1
  },
  subHeader: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 14,
    color: '#FFE6F2'
  },
  backButtonWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  backButton: {
    fontSize: 16,
    marginLeft: 4,
    color: '#FFB6C1'
  },
  selectedDate: {
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
    fontSize: 16,
    color: '#fff'
  },
  calendar: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16
  },
  legendWrap: {
    marginTop: 20,
    paddingHorizontal: 12,
  },
  legend: {
    fontSize: 16,
    marginVertical: 5,
    fontWeight: '700',
    color: '#FFEFF8'
  },
  pill: {
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 8,
    fontSize: 14
  }
});
