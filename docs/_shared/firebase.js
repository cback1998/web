<!-- docs/_shared/firebase.js -->
<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAnalytics, isSupported as analyticsSupported } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";

// === 你的 Firebase Web 配置（保持键名不变）===
const firebaseConfig = {
  apiKey: "AIzaSyAORia8tsA8TNGMoS2Y76h7AAhipYmdPhs",
  authDomain: "genome-finder.firebaseapp.com",
  projectId: "genome-finder",
  storageBucket: "genome-finder.firebasestorage.app",
  messagingSenderId: "451538903397",
  appId: "1:451538903397:web:e3949a58ab8e40d680018c",
  measurementId: "G-475T4X8964"
};
// ==============================================

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.useDeviceLanguage?.();

export const db = getFirestore(app);

// 可选：Analytics（仅在支持且 HTTPS 才启用）
export let analytics = null;
try {
  analyticsSupported().then(supported => {
    if (supported) analytics = getAnalytics(app);
  });
} catch (_) {
  // 忽略不支持的环境（如部分 iframe / 非安全上下文）
}
</script>
