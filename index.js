// index.js
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const databaseURL = process.env.FIREBASE_DB_URL;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ✅ Firebase Admin SDK 초기화
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: databaseURL
});

const db = admin.database();


// ✅ [GET] 전체 주문 목록 가져오기 (/orders)
app.get('/orders', (req, res) => {
  const ref = db.ref('orders');
  ref.once('value', snapshot => {
    res.json(snapshot.val());
  }, error => {
    res.status(500).json({ error: error.message });
  });
});


// ✅ [PUT] 특정 주문 상태 변경 (/orders/:orderId/status)
app.put('/orders/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const orderRef = db.ref(`orders/${orderId}`);
  orderRef.update({ status }, error => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ success: true });
    }
  });
});


// ✅ [PUT] 요리 아이템 상태 업데이트 (/orders/:orderId/items)
app.put('/orders/:orderId/items', async (req, res) => {
  const { orderId } = req.params;
  const { items } = req.body;
  const orderRef = db.ref(`orders/${orderId}`);

  // 🔒 빠른 중복 요청 방지를 위해 이미 응답했는지 플래그로 추적
  let responded = false;

  orderRef.once('value', async snapshot => {
    const orderData = snapshot.val();
    if (!orderData) {
      if (!responded) {
        responded = true;
        return res.status(404).json({ error: '주문 없음' });
      }
    }

    orderData.items = items;

    const allDone = items.every(item => item.status === 'done');

    if (allDone) {
      try {
        await db.ref(`archive/${orderId}`).set(orderData);
        await orderRef.remove();

        if (!responded) {
          responded = true;
          return res.json({ archived: true });
        }
      } catch (err) {
        if (!responded) {
          responded = true;
          return res.status(500).json({ error: err.message });
        }
      }
    } else {
      orderRef.update({ items }, err => {
        if (!responded) {
          responded = true;
          if (err) return res.status(500).json({ error: err.message });
          return res.json({ success: true });
        }
      });
    }
  }, error => {
    if (!responded) {
      responded = true;
      return res.status(500).json({ error: error.message });
    }
  });
});


// ✅ [GET] 지난 주문(아카이브) 조회 (/archive)
app.get('/archive', (req, res) => {
  const ref = db.ref('archive');
  ref.once('value', snapshot => {
    res.json(snapshot.val());
  }, error => {
    res.status(500).json({ error: error.message });
  });
});


// ✅ 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
