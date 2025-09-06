// docs/_shared/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// === 你的 Web 配置（按你提供的原样粘贴）===
const firebaseConfig = {
  apiKey: "AIzaSyAORia8tsA8TNGMoS2Y76h7AAhipYmdPhs",
  authDomain: "genome-finder.firebaseapp.com",
  projectId: "genome-finder",
  storageBucket: "genome-finder.firebasestorage.app",
  messagingSenderId: "451538903397",
  appId: "1:451538903397:web:e3949a58ab8e40d680018c",
  measurementId: "G-475T4X8964"
};

// 初始化
const app = initializeApp(firebaseConfig);

// analytics 可选，某些浏览器/第三方拦截会报错，这里做容错
try { getAnalytics(app); } catch {}

// Auth & Firestore
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);  // 刷新后仍保持登录
const db = getFirestore(app);

// 暴露到全局，供其它模块使用
window.__GF__ = { app, auth, db };
