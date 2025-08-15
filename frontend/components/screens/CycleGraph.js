import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { firestore } from '../../firebase';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // for arrow icon


const screenWidth = Dimensions.get('window').width;
const monthPairs = [['Jan', 'Feb'], ['Mar', 'Apr'], ['May', 'Jun'], ['Jul', 'Aug'], ['Sep', 'Oct'], ['Nov', 'Dec']];

export default function PhaseGraphScreen() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState({});
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [visibleKey, setVisibleKey] = useState('');
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await firestore
          .collection('dummy_menses')
          .where('userId', '==', '2NgUdjPSfjVvBJnmEp3CkvoKkMo1')
          .get();
        const raw = snapshot.docs.map(doc => doc.data());

        if (!raw.length) {
          setEmpty(true);
          setLoading(false);
          return;
        }

        raw.sort((a, b) => new Date(a.date) - new Date(b.date));

        const dataWindows = {};
        for (let entry of raw) {
          const date = new Date(entry.date);
          const month = date.toLocaleString('default', { month: 'short' });
          const year = date.getFullYear();
          const label = `${entry.phase}\n${entry.date.slice(5)}`;

          const pair = monthPairs.find(([m1, m2]) => [m1, m2].includes(month));
          if (!pair) continue;
          const key = `${pair[0]}-${pair[1]} ${year}`;

          if (!dataWindows[key]) {
            dataWindows[key] = { breakfast: [], lunch: [], dinner: [] };
          }

          dataWindows[key].breakfast.push({ label, value: entry.post_breakfast });
          dataWindows[key].lunch.push({ label, value: entry.post_lunch });
          dataWindows[key].dinner.push({ label, value: entry.post_dinner });
        }

        setGroupedData(dataWindows);

        // Try to show current month pair first
        const now = new Date();
        const nowMonth = now.getMonth();
        const pairIndex = Math.floor(nowMonth / 2);
        const key = `${monthPairs[pairIndex][0]}-${monthPairs[pairIndex][1]} ${now.getFullYear()}`;
        if (dataWindows[key]) {
          setCurrentPairIndex(pairIndex);
          setCurrentYear(now.getFullYear());
          setVisibleKey(key);
        } else {
          const earliest = Object.keys(dataWindows)[0];
          const [months, yr] = earliest.split(' ');
          const idx = monthPairs.findIndex(([m1]) => months.startsWith(m1));
          setCurrentPairIndex(idx);
          setCurrentYear(parseInt(yr));
          setVisibleKey(earliest);
        }

        setLoading(false);
      } catch (e) {
        console.error('❌ Firebase fetch error:', e);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const navigateWindow = (direction) => {
    let year = currentYear;
    let index = currentPairIndex + direction;

    if (index < 0) {
      index = monthPairs.length - 1;
      year -= 1;
    } else if (index >= monthPairs.length) {
      index = 0;
      year += 1;
    }

    const nextKey = `${monthPairs[index][0]}-${monthPairs[index][1]} ${year}`;
    setCurrentPairIndex(index);
    setCurrentYear(year);
    setVisibleKey(nextKey);
  };

  const renderGraph = (title, dataset, color) => {
    const phaseColors = {
      "Luteal": 'rgba(255,183,178,1)',
      "Menstrual": 'rgba(255,79,122,1)',
      "Follicular": 'rgba(173,216,230,1)',
      "Ovulation": 'rgba(115,85,255,1)'
    };

    const phaseAverages = {};
    dataset.forEach(entry => {
      const phase = entry.label.split("\n")[0];
      if (!phaseAverages[phase]) phaseAverages[phase] = { total: 0, count: 0 };
      phaseAverages[phase].total += entry.value;
      phaseAverages[phase].count += 1;
    });

    const avgSummary = Object.entries(phaseAverages)
      .map(([phase, stat]) => `${phase}: ${Math.round(stat.total / stat.count)} mg/dL`)
      .join(' | ');

    const maxLabels = 6;
    const step = Math.max(1, Math.floor(dataset.length / maxLabels));
    const reducedLabels = dataset.map((d, i) => (i % step === 0 ? d.label.split("\n")[1] : ''));

    const phaseDataset = dataset.map(d => {
      const phase = d.label.split("\n")[0];
      return {
        ...d,
        color: () => phaseColors[phase] || color
      };
    });

    return (
      <View style={styles.card}>
        <Text style={styles.phaseTitle}>{title}</Text>
        <Text style={styles.avgText}>Avg: {avgSummary}</Text>
        <LineChart
          data={{
            labels: reducedLabels,
            datasets: [
              {
                data: phaseDataset.map(d => d.value),
                color: (opacity = 1) => phaseDataset[0].color(opacity),
                strokeWidth: 2
              }
            ]
          }}
          width={screenWidth * 1.4}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(40, 27, 74, ${opacity})`,
            labelColor: () => '#000',
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#fff'
            },
            propsForBackgroundLines: {
              stroke: 'rgba(0,0,0,0.1)'
            },
            propsForLabels: {
              fontSize: 10
            }
          }}
          bezier
          style={{ borderRadius: 14, marginTop: 10 }}
        />
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#FF4F7A" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  const data = groupedData[visibleKey];

  return (
    <ScrollView style={{ backgroundColor: '#281B4A' }} contentContainerStyle={{ padding: 16 }}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
  <Ionicons name="arrow-back" size={24} color="#fff" />
  <Text style={styles.backText}>Back</Text>
</TouchableOpacity>

      <View style={styles.navButtons}>
        <TouchableOpacity onPress={() => navigateWindow(-1)} style={styles.navBtn}>
          <Text style={styles.navText}>⬅ Prev</Text>
        </TouchableOpacity>
        <Text style={styles.navTextMid}>{visibleKey}</Text>
        <TouchableOpacity onPress={() => navigateWindow(1)} style={styles.navBtn}>
          <Text style={styles.navText}>Next ➡</Text>
        </TouchableOpacity>
      </View>

      {data ? (
        <>
          {renderGraph('🩸 Post-Breakfast Readings', data.breakfast, 'rgba(255,107,129,1)')}
          {renderGraph('🍽️ Post-Lunch Readings', data.lunch, 'rgba(255,177,103,1)')}
          {renderGraph('🌙 Post-Dinner Readings', data.dinner, 'rgba(111,191,255,1)')}
        </>
      ) : (
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>📭 No data for {visibleKey}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFDCEC',
    marginBottom: 4,
    textAlign: 'center'
  },
  avgText: {
    fontSize: 12,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 6
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  navBtn: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8
  },
  navText: {
    color: '#281B4A',
    fontWeight: 'bold'
  },
  navTextMid: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  backButton: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12
},
backText: {
  color: '#fff',
  marginLeft: 6,
  fontSize: 16
}

});
