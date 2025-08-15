import { firebase, firestore as db } from '../../firebase';
import { auth } from '../utilityV8/authHandler';
import { generateDocId } from './utility';
 const userId = '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';
export const dummyMensesData = [
  {
    "date": "2025-03-15",
    "day_of_cycle": 15,
    "phase": "Luteal",
    "post_breakfast": 266,
    "post_lunch": 352,
    "post_dinner": 320,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-03-16",
    "day_of_cycle": 16,
    "phase": "Luteal",
    "post_breakfast": 303,
    "post_lunch": 285,
    "post_dinner": 308,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-03-17",
    "day_of_cycle": 17,
    "phase": "Luteal",
    "post_breakfast": 289,
    "post_lunch": 315,
    "post_dinner": 306,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-03-18",
    "day_of_cycle": 18,
    "phase": "Luteal",
    "post_breakfast": 211,
    "post_lunch": 285,
    "post_dinner": 334,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-03-19",
    "day_of_cycle": 19,
    "phase": "Luteal",
    "post_breakfast": 271,
    "post_lunch": 304,
    "post_dinner": 319,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-03-20",
    "day_of_cycle": 20,
    "phase": "Luteal",
    "post_breakfast": 234,
    "post_lunch": 316,
    "post_dinner": 290,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-03-21",
    "day_of_cycle": 21,
    "phase": "Luteal",
    "post_breakfast": 257,
    "post_lunch": 308,
    "post_dinner": 284,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-03-22",
    "day_of_cycle": 22,
    "phase": "Luteal",
    "post_breakfast": 277,
    "post_lunch": 264,
    "post_dinner": 303,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-03-23",
    "day_of_cycle": 23,
    "phase": "Luteal",
    "post_breakfast": 261,
    "post_lunch": 276,
    "post_dinner": 281,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-03-24",
    "day_of_cycle": 24,
    "phase": "Luteal",
    "post_breakfast": 269,
    "post_lunch": 294,
    "post_dinner": 342,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-03-25",
    "day_of_cycle": 25,
    "phase": "Luteal",
    "post_breakfast": 256,
    "post_lunch": 292,
    "post_dinner": 387,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-03-26",
    "day_of_cycle": 26,
    "phase": "Luteal",
    "post_breakfast": 280,
    "post_lunch": 304,
    "post_dinner": 325,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-03-27",
    "day_of_cycle": 27,
    "phase": "Luteal",
    "post_breakfast": 227,
    "post_lunch": 283,
    "post_dinner": 235,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-03-28",
    "day_of_cycle": 28,
    "phase": "Luteal",
    "post_breakfast": 292,
    "post_lunch": 341,
    "post_dinner": 291,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-03-29",
    "day_of_cycle": 29,
    "phase": "After Cycle (Irregular)",
    "post_breakfast": 195,
    "post_lunch": 195,
    "post_dinner": 195,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-03-30",
    "day_of_cycle": 1,
    "phase": "Menstrual",
    "post_breakfast": 218,
    "post_lunch": 236,
    "post_dinner": 264,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-03-31",
    "day_of_cycle": 2,
    "phase": "Menstrual",
    "post_breakfast": 224,
    "post_lunch": 250,
    "post_dinner": 277,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-01",
    "day_of_cycle": 3,
    "phase": "Menstrual",
    "post_breakfast": 221,
    "post_lunch": 254,
    "post_dinner": 247,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-02",
    "day_of_cycle": 4,
    "phase": "Menstrual",
    "post_breakfast": 248,
    "post_lunch": 275,
    "post_dinner": 247,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-03",
    "day_of_cycle": 5,
    "phase": "Menstrual",
    "post_breakfast": 216,
    "post_lunch": 280,
    "post_dinner": 322,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-04",
    "day_of_cycle": 6,
    "phase": "Follicular",
    "post_breakfast": 108,
    "post_lunch": 118,
    "post_dinner": 100,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-05",
    "day_of_cycle": 7,
    "phase": "Follicular",
    "post_breakfast": 97,
    "post_lunch": 89,
    "post_dinner": 112,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-06",
    "day_of_cycle": 8,
    "phase": "Follicular",
    "post_breakfast": 99,
    "post_lunch": 129,
    "post_dinner": 93,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-07",
    "day_of_cycle": 9,
    "phase": "Follicular",
    "post_breakfast": 114,
    "post_lunch": 105,
    "post_dinner": 98,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-08",
    "day_of_cycle": 10,
    "phase": "Follicular",
    "post_breakfast": 95,
    "post_lunch": 101,
    "post_dinner": 80,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-09",
    "day_of_cycle": 11,
    "phase": "Follicular",
    "post_breakfast": 106,
    "post_lunch": 122,
    "post_dinner": 120,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-10",
    "day_of_cycle": 12,
    "phase": "Follicular",
    "post_breakfast": 107,
    "post_lunch": 120,
    "post_dinner": 85,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-11",
    "day_of_cycle": 13,
    "phase": "Follicular",
    "post_breakfast": 102,
    "post_lunch": 93,
    "post_dinner": 102,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-12",
    "day_of_cycle": 14,
    "phase": "Ovulation",
    "post_breakfast": 208,
    "post_lunch": 201,
    "post_dinner": 138,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-13",
    "day_of_cycle": 15,
    "phase": "Luteal",
    "post_breakfast": 245,
    "post_lunch": 273,
    "post_dinner": 302,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-14",
    "day_of_cycle": 16,
    "phase": "Luteal",
    "post_breakfast": 293,
    "post_lunch": 315,
    "post_dinner": 338,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-15",
    "day_of_cycle": 17,
    "phase": "Luteal",
    "post_breakfast": 276,
    "post_lunch": 281,
    "post_dinner": 297,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-16",
    "day_of_cycle": 18,
    "phase": "Luteal",
    "post_breakfast": 281,
    "post_lunch": 318,
    "post_dinner": 364,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-17",
    "day_of_cycle": 19,
    "phase": "Luteal",
    "post_breakfast": 272,
    "post_lunch": 299,
    "post_dinner": 362,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-18",
    "day_of_cycle": 20,
    "phase": "Luteal",
    "post_breakfast": 243,
    "post_lunch": 315,
    "post_dinner": 282,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-19",
    "day_of_cycle": 21,
    "phase": "Luteal",
    "post_breakfast": 310,
    "post_lunch": 332,
    "post_dinner": 368,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-20",
    "day_of_cycle": 22,
    "phase": "Luteal",
    "post_breakfast": 309,
    "post_lunch": 315,
    "post_dinner": 274,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-21",
    "day_of_cycle": 23,
    "phase": "Luteal",
    "post_breakfast": 282,
    "post_lunch": 317,
    "post_dinner": 327,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-22",
    "day_of_cycle": 24,
    "phase": "Luteal",
    "post_breakfast": 267,
    "post_lunch": 295,
    "post_dinner": 324,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-23",
    "day_of_cycle": 25,
    "phase": "Luteal",
    "post_breakfast": 244,
    "post_lunch": 310,
    "post_dinner": 329,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-24",
    "day_of_cycle": 26,
    "phase": "Luteal",
    "post_breakfast": 267,
    "post_lunch": 310,
    "post_dinner": 351,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-25",
    "day_of_cycle": 27,
    "phase": "Luteal",
    "post_breakfast": 245,
    "post_lunch": 334,
    "post_dinner": 346,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-26",
    "day_of_cycle": 28,
    "phase": "Luteal",
    "post_breakfast": 295,
    "post_lunch": 320,
    "post_dinner": 335,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-27",
    "day_of_cycle": 29,
    "phase": "After Cycle (Irregular)",
    "post_breakfast": 160,
    "post_lunch": 160,
    "post_dinner": 160,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-28",
    "day_of_cycle": 1,
    "phase": "Menstrual",
    "post_breakfast": 225,
    "post_lunch": 270,
    "post_dinner": 253,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-29",
    "day_of_cycle": 2,
    "phase": "Menstrual",
    "post_breakfast": 226,
    "post_lunch": 295,
    "post_dinner": 271,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  },
  {
    "date": "2025-04-30",
    "day_of_cycle": 3,
    "phase": "Menstrual",
    "post_breakfast": 234,
    "post_lunch": 229,
    "post_dinner": 229,
    "userId": "2NgUdjPSfjVvBJnmEp3CkvoKkMo1"
  }
];


export const uploadDummyMensesData = async () => {
  try {
    await Promise.all(
      dummyMensesData.map((doc) =>
        db.collection('dummy_menses').add(doc)  // ✅ no timestamp
      )
    );
    console.log('✅ All dummy_menses documents uploaded successfully');
  } catch (error) {
    console.error('❌ Upload failed:', error);
  }
};
export const fetchDummyMensesData = async () => {
  try {
    const snapshot = await db
      .collection('dummy_menses')
      .where('userId', '==', userId)
      .get();

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return data; // You can set it in useState or return it
  } catch (error) {
    console.error('❌ Failed to fetch dummy menses data:', error);
    return [];
  }
};


export const uploadDummyCarbLogs = async () => {
  console.log("inside function")
  const userId = auth.currentUser?.uid || '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';

  try {
    await Promise.all(
      dummy_carb.map((doc) => {
        try {
          // ✅ Parse timestamp safely
          const cleanTime = doc.timestamp.replace(' UTC+5:30', '');
          const [datePart, timePart] = cleanTime.split(' at ');
          const jsDate = new Date(`${datePart} ${timePart} GMT+0530`);

          if (isNaN(jsDate.getTime())) {
            throw new Error(`Invalid timestamp format: ${doc.timestamp}`);
          }

          const logId = generateDocId('insulin', userId, jsDate);

          return db.collection('Insulin_logs').doc(logId).set({
            log_id: logId,
            user_id: userId,
            timestamp: firebase.firestore.Timestamp.fromDate(jsDate),
            basal_rate: doc.basal_rate,
            bolus: doc.bolus,
            calories: doc.calories,
            carb_input: doc.carb_input,
            food_intake: doc.food_intake,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
          });
        } catch (innerError) {
          console.error('❌ Skipping invalid doc:', doc.timestamp, innerError);
          return null;
        }
      })
    );

    console.log('✅ All dummy_carb logs uploaded successfully with log_id and Firestore timestamp.');
  } catch (error) {
    console.error('❌ Upload failed:', error);
  }
};
