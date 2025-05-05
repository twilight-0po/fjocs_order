// index.js
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();
require('dotenv').config();
const databaseURL = process.env.FIREBASE_DB_URL;
const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin 초기화
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')),
  databaseURL: databaseURL
})

const db = admin.database();

// ✅ API 예시 1: 모든 주문 가져오기
app.get('/orders', async (req, res) => {
  const ref = db.ref('orders');
  ref.once('value', snapshot => {
    res.json(snapshot.val());
  }, error => {
    res.status(500).json({ error: error.message });
  });
});

// ✅ API 예시 2: 특정 주문 상태 변경
app.put('/orders/:orderId/status', async (req, res) => {
  const orderId = req.params.orderId;
  const newStatus = req.body.status;

  const orderRef = db.ref(`orders/${orderId}`);
  orderRef.update({ status: newStatus }, error => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ success: true });
    }
  });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
