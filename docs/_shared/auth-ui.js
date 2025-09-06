<!-- docs/_shared/auth-ui.js -->
<script type="module">
import { auth } from "./firebase.js";
import {
  onAuthStateChanged, signOut,
  signInWithEmailAndPassword, createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const $ = s => document.querySelector(s);

// 首页里已有这些节点：#authArea、#authModal、#authTitle、#authEmail、#authPass、#authSubmit、#btnLogin、#btnRegister
const nav      = $("#authArea");
const dlg      = $("#authModal");
const dlgTitle = $("#authTitle");
const inpMail  = $("#authEmail");
const inpPass  = $("#authPass");
const btnSubmit= $("#authSubmit");
const btnLogin = $("#btnLogin");
const btnReg   = $("#btnRegister");

let mode = "login"; // 或 "register"

// 打开对话框
btnLogin?.addEventListener("click", () => { mode="login";    if(dlgTitle) dlgTitle.textContent="登录";  dlg?.showModal(); });
btnReg  ?.addEventListener("click", () => { mode="register"; if(dlgTitle) dlgTitle.textContent="注册";  dlg?.showModal(); });

// 提交登录/注册
btnSubmit?.addEventListener("click", async (e) => {
  e.preventDefault();
  if (!inpMail || !inpPass) return;
  const email = (inpMail.value||"").trim();
  const pass  = inpPass.value||"";
  try {
    if (mode === "login") {
      await signInWithEmailAndPassword(auth, email, pass);
    } else {
      await createUserWithEmailAndPassword(auth, email, pass);
    }
    dlg?.close();
  } catch (err) {
    alert((err?.message) || "登录/注册失败");
  }
});

// 登录态渲染
function renderAuthedUI(user){
  if (!nav) return;
  if (user) {
    nav.innerHTML = `
      <span class="text-sm text-gray-600">已登录：${user.email}</span>
      <button id="btnLogout" class="px-3 py-1.5 rounded-xl border">退出</button>`;
    nav.querySelector("#btnLogout")?.addEventListener("click", ()=> signOut(auth));
  } else {
    nav.innerHTML = `
      <button id="btnLogin" class="px-4 py-2 rounded-xl border">登录</button>
      <button id="btnRegister" class="px-4 py-2 rounded-xl bg-indigo-600 text-white">注册</button>`;
    nav.querySelector("#btnLogin")?.addEventListener("click", () => { mode="login";    dlgTitle && (dlgTitle.textContent="登录");  dlg?.showModal(); });
    nav.querySelector("#btnRegister")?.addEventListener("click", () => { mode="register"; dlgTitle && (dlgTitle.textContent="注册"); dlg?.showModal(); });
  }
}

onAuthStateChanged(auth, renderAuthedUI);
</script>
