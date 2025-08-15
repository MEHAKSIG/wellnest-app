import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ImageBackground,
} from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const moods = [
  { label: 'Happy', icon: 'smile' },
  { label: 'Tired', icon: 'coffee' },
  { label: 'Anxious', icon: 'alert-circle' },
  { label: 'Calm', icon: 'sun' },
  { label: 'Low', icon: 'cloud' },
];

const moodQuotes = {
  Happy: [
    "Joy is not in things; it is in us.",
    "Let your smile change the world.",
    "Happiness is contagious — spread it around!",
    "Count your rainbows, not your thunderstorms.",
    "A grateful heart is a magnet for miracles.",
    "Be so happy that others get happy too.",
    "Today is a perfect day to be happy.",
    "The more you praise and celebrate, the more to celebrate.",
    "Smiles are free — give them generously.",
    "Live life with joy — it's the best makeup.",
  ],
  Tired: [
    "Rest is not idleness. It is healing.",
    "Even the sun needs to set to rise again.",
    "You don’t have to do it all today.",
    "Slow down. Breathe. Heal.",
    "It’s okay to pause — not quit.",
    "Your body whispers before it screams. Rest.",
    "Recharge. You deserve it.",
    "Self-care is not selfish.",
    "Better rested. Better tomorrow.",
    "Take a nap. The world can wait.",
  ],
  Anxious: [
    "You’ve survived 100% of your worst days.",
    "One breath at a time.",
    "Let what you can’t control go.",
    "Anxiety is a liar. You are safe.",
    "Feelings are not facts.",
    "You are not alone. Ever.",
    "You’ve got this, even if your hands shake.",
    "Pause. Breathe. Proceed.",
    "Peace is found in presence.",
    "You are stronger than your storm.",
  ],
  Calm: [
    "Peace begins with a deep breath.",
    "Still waters run deep.",
    "Be here now.",
    "Let silence speak to your soul.",
    "Inhale calm. Exhale tension.",
    "There is strength in serenity.",
    "Softness is power.",
    "Stillness is not emptiness.",
    "A calm mind is a superpower.",
    "Breathe. Everything is okay.",
  ],
  Low: [
    "It's okay not to be okay.",
    "You are loved, even on hard days.",
    "The sun will rise again.",
    "This moment will pass.",
    "Your story isn't over.",
    "Hope is a quiet courage.",
    "You matter. More than you know.",
    "Be gentle with yourself today.",
    "Crying is brave too.",
    "Dark days grow beautiful things.",
  ],
};

const moodBackgrounds = {
  Happy: 'https://images.pexels.com/photos/725255/pexels-photo-725255.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  Tired: 'https://images.pexels.com/photos/16733794/pexels-photo-16733794/free-photo-of-man-pouring-water-into-a-cup.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  Anxious: 'https://images.pexels.com/photos/2914198/pexels-photo-2914198.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  Calm: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  Low: 'https://images.pexels.com/photos/3943933/pexels-photo-3943933.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
};

const defaultBackgroundImage = 'https://images.pexels.com/photos/3876635/pexels-photo-3876635.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

const getMoodQuote = (mood) => {
  const day = new Date().getDate();
  const list = moodQuotes[mood];
  return list[day % list.length];
};

const HealthDiaryScreen = () => {
  const navigation = useNavigation();
  const [selectedMood, setSelectedMood] = useState(null);
  const [entry, setEntry] = useState('');
  const [bodyFeeling, setBodyFeeling] = useState('');
  const [diabetesImpact, setDiabetesImpact] = useState('');
  const [journalEntries, setJournalEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatDate = (date) => date.toLocaleDateString('en-IN');

  const handleSaveEntry = () => {
    if (!entry.trim()) return;
    const newEntry = {
      date: formatDate(selectedDate),
      mood: selectedMood,
      bodyFeeling,
      diabetesImpact,
      entry,
    };
    setJournalEntries([newEntry, ...journalEntries]);
    setSelectedMood(null);
    setBodyFeeling('');
    setDiabetesImpact('');
    setEntry('');
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const backgroundImage = moodBackgrounds[selectedMood] || defaultBackgroundImage;
  const quote = selectedMood ? getMoodQuote(selectedMood) : "Today is a fresh start. Make it kind.";

  return (
    <ImageBackground source={{ uri: backgroundImage }} style={styles.background} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="#b71c1c" />
        </TouchableOpacity>

        <View style={styles.container}>
          <Text style={styles.title}>Welcome, Mehak</Text>
          <Text style={styles.quote}>{quote}</Text>

          <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          <View style={styles.moodContainer}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.label}
                style={[
                  styles.moodButton,
                  selectedMood === mood.label && styles.moodSelected,
                ]}
                onPress={() => setSelectedMood(mood.label)}
              >
                <Feather name={mood.icon} size={20} color="#333" />
                <Text style={styles.moodText}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.dateNav}>
            <TouchableOpacity onPress={() => changeDate(-1)}>
              <AntDesign name="leftcircle" size={24} color="#b71c1c" />
            </TouchableOpacity>
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            <TouchableOpacity onPress={() => changeDate(1)}>
              <AntDesign name="rightcircle" size={24} color="#b71c1c" />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.prompt}>How did your body feel today?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Calm, tired, bloated..."
              value={bodyFeeling}
              onChangeText={setBodyFeeling}
            />

            <Text style={styles.prompt}>How did diabetes impact your day?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Managed well, overwhelming, just background..."
              value={diabetesImpact}
              onChangeText={setDiabetesImpact}
            />

            <Text style={styles.prompt}>Today I want to remember...</Text>
            <TextInput
              style={styles.journalInput}
              multiline={true}
              numberOfLines={6}
              placeholder="Write freely..."
              value={entry}
              onChangeText={setEntry}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEntry}>
              <Text style={styles.saveButtonText}>Save Entry</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Your Journal</Text>
          <FlatList
            data={journalEntries}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.entryDate}>{item.date}</Text>
                <Text style={styles.entryMood}>Mood: {item.mood}</Text>
                <Text>Body: {item.bodyFeeling}</Text>
                <Text>Diabetes: {item.diabetesImpact}</Text>
                <Text style={styles.entryText}>{item.entry}</Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContainer: { paddingTop: 60 },
  container: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  backButton: {
    position: 'absolute',
    top: 28,
    left: 28,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 50,
    elevation: 3,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  quote: {
    fontStyle: 'italic',
    fontSize: 14,
    marginVertical: 12,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#555',
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  moodButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  moodSelected: {
    backgroundColor: '#d3f3ee',
    borderColor: '#1abc9c',
  },
  moodText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 10,
    color: '#b71c1c',
    backgroundColor: '#fff4f4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 2,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  prompt: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
  },
  journalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 12,
    backgroundColor: '#ff9999',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  entryDate: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  entryMood: {
    fontStyle: 'italic',
    marginBottom: 4,
  },
  entryText: {
    marginTop: 6,
  },
});

export default HealthDiaryScreen;
