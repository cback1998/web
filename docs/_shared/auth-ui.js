// docs/_shared/auth-ui.js
// 负责把“登录/注册/退出”按钮与 dialog 绑定到 Firebase Auth
// 依赖 window.__GF__（由 firebase.js 先行创建）

import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// 等待 __GF__ 就绪（防止极端情况下加载顺序问题）
async function waitForGF(ms = 2000) {
  const t0 = Date.now();
  while (!window.__GF__) {
    await new Promise(r => setTimeout(r, 30));
    if (Date.now() - t0 > ms) throw new Error("Firebase core not ready: __GF__ missing");
  }
  return window.__GF__;
}

function $(s){ return document.querySelector(s); }
function toast(msg){
  const d = document.createElement("div");
  d.className = "fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-3 py-2 rounded-xl";
  d.textContent = msg; document.body.appendChild(d);
  setTimeout(()=> d.remove(), 1400);
}

function formatAuthError(err){
  const code = err?.code || "";
  if (code.includes("invalid-email")) return "邮箱格式不正确";
  if (code.includes("email-already-in-use")) return "该邮箱已被注册";
  if (code.includes("weak-password")) return "密码强度不足（至少 6 位）";
  if (code.includes("invalid-credential")) return "邮箱或密码错误";
  return err?.message || String(err);
}

async function main(){
  // 保证 DOM 就绪
  if (document.readyState === "loading") {
    await new Promise(r => document.addEventListener("DOMContentLoaded", r, { once:true }));
  }

  // 等 __GF__（auth）准备好
  const { auth } = await waitForGF();

  // 这些元素在首页 index.html 中已经存在
  const area   = $("#authArea");
  const dlg    = $("#authModal");
  const title  = $("#authTitle");
  const emailI = $("#authEmail");
  const passI  = $("#authPass");
  const submit = $("#authSubmit");

  // 当前模式：登录 / 注册
  let mode = "login";
  function openLogin(){ mode="login"; if (title) title.textContent="登录"; dlg?.showModal(); }
  function openRegister(){ mode="register"; if (title) title.textContent="注册"; dlg?.showModal(); }

  // 渲染“未登录”右上角
  function renderAnon(){
    if (!area) return;
    area.innerHTML = `
      <button id="btnLogin" class="px-4 py-2 rounded-xl border">登录</button>
      <button id="btnRegister" class="px-4 py-2 rounded-xl bg-indigo-600 text-white">注册</button>
    `;
    area.querySelector("#btnLogin")?.addEventListener("click", openLogin);
    area.querySelector("#btnRegister")?.addEventListener("click", openRegister);
  }

  // 渲染“已登录”右上角
  function renderAuthed(user){
    if (!area) return;
    const name = user.email || "用户";
    area.innerHTML = `
      <div class="text-sm">你好，${name}</div>
      <button id="btnLogout" class="px-3 py-1.5 rounded-xl border">退出</button>
    `;
    area.querySelector("#btnLogout")?.addEventListener("click", async ()=>{
      try { await signOut(auth); toast("已退出登录"); }
      catch (e){ toast("退出失败：" + formatAuthError(e)); }
    });
  }

  // 绑定“确定”提交（登录/注册）
  submit?.addEventListener("click", async (e)=>{
    e.preventDefault();
    const email = emailI?.value.trim();
    const pass  = passI?.value;
    if (!email || !pass) { toast("请输入邮箱和密码"); return; }
    try{
      if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email, pass);
        toast("注册成功");
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
        toast("登录成功");
      }
      dlg?.close();
      // 清空输入
      if (emailI) emailI.value = "";
      if (passI)  passI.value = "";
    } catch (err){
      toast((mode==="register"?"注册":"登录") + "失败：" + formatAuthError(err));
    }
  });

  // 登录态监听：根据用户状态重绘右上角按钮
  onAuthStateChanged(auth, user => {
    if (user) renderAuthed(user);
    else renderAnon();
  });

  // 首次渲染（未登录）
  renderAnon();
}

main().catch(err => console.error("[GF auth-ui] init failed:", err));
