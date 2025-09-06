// docs/_shared/firebase.js
// 仅做初始化 & 暴露全局 __GF__，不做任何 UI 绑定

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// 你的配置（保持与控制台一致）
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
const auth = getAuth(app);
const db   = getFirestore(app);

// 挂到全局，方便其它脚本及控制台使用
window.__GF__ = { app, auth, db };
console.log("[GF] Firebase initialized", window.__GF__);

// 可选：同时导出（如果你以后用 import 方式）
export { app, auth, db };
