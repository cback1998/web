// docs/_shared/auth-ui.js
const { auth } = window.__GF__ || {};

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const $ = s => document.querySelector(s);
const authArea = $("#authArea");
const modal = $("#authModal");
const titleEl = $("#authTitle");
const emailEl = $("#authEmail");
const passEl = $("#authPass");
const btnSubmit = $("#authSubmit");

function toast(msg){
  const d=document.createElement("div");
  d.className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-3 py-2 rounded-xl";
  d.textContent=msg; document.body.appendChild(d);
  setTimeout(()=>d.remove(),1500);
}

let mode = "login";

function renderAuth(user){
  if (!authArea) return;
  if (!user) {
    authArea.innerHTML = `
      <button id="btnLogin" class="px-4 py-2 rounded-xl border">登录</button>
      <button id="btnRegister" class="px-4 py-2 rounded-xl bg-indigo-600 text-white">注册</button>`;
    authArea.querySelector("#btnLogin").addEventListener("click", ()=>{
      mode="login"; titleEl.textContent="登录"; modal.showModal();
    });
    authArea.querySelector("#btnRegister").addEventListener("click", ()=>{
      mode="register"; titleEl.textContent="注册"; modal.showModal();
    });
  } else {
    const email = user.email || "已登录";
    authArea.innerHTML = `
      <span class="text-sm text-gray-700">你好，${email}</span>
      <button id="btnLogout" class="px-3 py-2 rounded-xl border">退出</button>`;
    authArea.querySelector("#btnLogout").addEventListener("click", async ()=>{
      try { await signOut(auth); toast("已退出"); }
      catch(e){ toast("退出失败：" + (e?.code||e)); }
    });
  }
}

if (auth) onAuthStateChanged(auth, u => renderAuth(u));

btnSubmit?.addEventListener("click", async (e)=>{
  e.preventDefault();
  if (!auth) return toast("Firebase 未初始化");
  const email = (emailEl?.value||"").trim();
  const pass = (passEl?.value||"").trim();
  if (!email || !pass) return toast("请输入邮箱和密码");
  try {
    if (mode === "login") {
      await signInWithEmailAndPassword(auth, email, pass);
      toast("登录成功");
    } else {
      await createUserWithEmailAndPassword(auth, email, pass);
      toast("注册并登录成功");
    }
    modal?.close();
  } catch (e) {
    const map = {
      "auth/invalid-email": "邮箱格式不正确",
      "auth/missing-password": "请输入密码",
      "auth/weak-password": "密码太弱（≥6位）",
      "auth/email-already-in-use": "该邮箱已注册",
      "auth/invalid-credential": "邮箱或密码错误",
      "auth/wrong-password": "密码错误",
      "auth/user-not-found": "用户不存在",
      "auth/unauthorized-domain": "域名未加入 Firebase 白名单"
    };
    toast(map[e?.code] || ("失败：" + (e?.code||e)));
  }
});
