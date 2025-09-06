// /web/_shared/auth-ui.js
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// ---- Guard & wiring ----
if (!window.__GF__ || !window.__GF__.auth) {
  console.error("[GF] Firebase 未就绪：window.__GF__ 不存在。请先确保 /web/_shared/firebase.js 成功加载。");
}

const auth = (window.__GF__ && window.__GF__.auth) || getAuth();
const $ = (s, ctx = document) => ctx.querySelector(s);

// DOM refs（页面已有这些元素）
const nav = $("#authArea");
const dlg = $("#authModal");
const titleEl = $("#authTitle");
const emailEl = $("#authEmail");
const passEl = $("#authPass");
const submitBtn = $("#authSubmit");

// 记录当前模式：login | register
let mode = "login";

// 简单转义
const esc = (s) => String(s || "").replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));

// 渲染：未登录
function renderLoggedOut() {
  if (!nav) return;
  nav.innerHTML = `
    <button id="btnLogin" class="px-4 py-2 rounded-xl border">登录</button>
    <button id="btnRegister" class="px-4 py-2 rounded-xl bg-indigo-600 text-white">注册</button>
  `;
}

// 渲染：已登录
function renderLoggedIn(user) {
  if (!nav) return;
  const name = user.displayName || user.email || "已登录";
  nav.innerHTML = `
    <span class="text-sm text-gray-700">你好，${esc(name)}</span>
    <button id="btnLogout" class="px-3 py-1.5 rounded-xl border">退出</button>
  `;
}

// 打开对话框并切换模式
function openDialog(nextMode) {
  mode = nextMode;
  if (titleEl) titleEl.textContent = mode === "register" ? "注册" : "登录";
  if (!dlg) return console.error("[GF] 找不到 #authModal");
  if (typeof dlg.showModal === "function") {
    dlg.showModal();
  } else {
    // 极老旧浏览器兜底
    dlg.setAttribute("open", "");
  }
}

// 关闭对话框
function closeDialog() {
  if (!dlg) return;
  if (typeof dlg.close === "function") dlg.close();
  else dlg.removeAttribute("open");
}

// 点击委托（确保即使 nav 被重绘，监听依然有效）
document.addEventListener("click", async (e) => {
  const t = e.target;

  if (t.closest && t.closest("#btnLogin")) {
    e.preventDefault();
    openDialog("login");
    return;
  }

  if (t.closest && t.closest("#btnRegister")) {
    e.preventDefault();
    openDialog("register");
    return;
  }

  if (t.closest && t.closest("#btnLogout")) {
    e.preventDefault();
    try {
      await signOut(auth);
      console.log("[GF] 已退出");
    } catch (err) {
      console.error("[GF] 退出失败：", err);
      alert("退出失败：" + (err?.message || err));
    }
    return;
  }

  if (t.closest && t.closest("#authSubmit")) {
    e.preventDefault();
    const email = emailEl?.value.trim();
    const pass = passEl?.value;
    if (!email || !pass) { alert("请输入邮箱和密码"); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = "处理中…";

    try {
      if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email, pass);
        console.log("[GF] 注册成功");
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
        console.log("[GF] 登录成功");
      }
      closeDialog();
      if (emailEl) emailEl.value = "";
      if (passEl) passEl.value = "";
    } catch (err) {
      console.error("[GF] 认证失败：", err);
      // 常见：auth/operation-not-allowed 表示未在控制台启用 Email/Password
      alert("失败：" + (err?.code || "") + " " + (err?.message || err));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "确定";
    }
  }
});

// 回车提交
emailEl?.addEventListener("keydown", (e) => { if (e.key === "Enter") submitBtn?.click(); });
passEl?.addEventListener("keydown", (e) => { if (e.key === "Enter") submitBtn?.click(); });

// 监听登录态
onAuthStateChanged(auth, (user) => {
  console.log("[GF] onAuthStateChanged:", user ? user.uid : "signed-out");
  if (user) renderLoggedIn(user);
  else renderLoggedOut();
});

// 启动日志
console.log("[GF] auth-ui booted; __GF__ =", window.__GF__);
