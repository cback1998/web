// web/_shared/auth-ui.js
// 登录/注册 UI 与 Firebase Auth 绑定（依赖 web/_shared/firebase.js 暴露的 window.__GF__.auth）

"use strict";

(function () {
  // --------- 保护性检查 ----------
  const GF = window.__GF__ || {};
  const auth = GF.auth || null;
  if (!auth) {
    console.warn("[auth-ui] 未检测到 window.__GF__.auth。请确认先引入 /_shared/firebase.js 且路径正确。");
  }

  // --------- 便捷选择器 ----------
  const $  = (s, root = document) => root.querySelector(s);

  // 可能有的元素（有些子页面可能没有登录对话框）
  const authArea   = $("#authArea");
  const authModal  = $("#authModal");
  const form       = authModal ? $("form", authModal) : null;
  const titleEl    = authModal ? $("#authTitle", authModal) : null;
  const emailEl    = authModal ? $("#authEmail", authModal) : null;
  const passEl     = authModal ? $("#authPass", authModal) : null;
  const submitBtn  = authModal ? $("#authSubmit", authModal) : null;

  // --------- 小工具 ----------
  function toast(msg) {
    const d = document.createElement("div");
    d.className =
      "fixed z-[1000] bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-sm px-3 py-2 rounded-xl";
    d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1400);
  }

  function openDialog(mode /* 'login' | 'register' */) {
    if (!authModal) return;
    authModal.dataset.mode = mode;
    if (titleEl) titleEl.textContent = mode === "register" ? "注册" : "登录";
    if (submitBtn) submitBtn.textContent = "确定";
    if (emailEl) emailEl.value = "";
    if (passEl) passEl.value = "";
    try {
      authModal.showModal();
    } catch {
      // 某些老浏览器不支持 <dialog>：退化为显示
      authModal.setAttribute("open", "");
      authModal.style.display = "block";
    }
  }

  function closeDialog() {
    if (!authModal) return;
    try {
      authModal.close();
    } catch {
      authModal.removeAttribute("open");
      authModal.style.display = "none";
    }
    if (emailEl) emailEl.value = "";
    if (passEl) passEl.value = "";
  }

  function renderHeader(user) {
    if (!authArea) return;
    if (user) {
      authArea.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-700">已登录：${user.email || "用户"}</span>
          <button id="btnLogout" class="px-3 py-1.5 rounded-xl border">退出</button>
        </div>
      `;
    } else {
      // 恢复“登录/注册”占位（用相同的 id，事件用委托绑定）
      authArea.innerHTML = `
        <button id="btnLogin" class="px-4 py-2 rounded-xl border">登录</button>
        <button id="btnRegister" class="px-4 py-2 rounded-xl bg-indigo-600 text-white">注册</button>
      `;
    }
  }

  // 错误码翻译
  function explainAuthError(code) {
    const map = {
      "auth/invalid-email": "邮箱格式不正确",
      "auth/user-disabled": "该账号已被禁用",
      "auth/user-not-found": "用户不存在",
      "auth/wrong-password": "密码错误",
      "auth/email-already-in-use": "该邮箱已被注册",
      "auth/weak-password": "密码太弱（至少 6 位）",
      "auth/too-many-requests": "尝试次数过多，请稍后再试",
      "auth/network-request-failed": "网络错误，请检查网络",
    };
    return map[code] || "认证失败，请重试";
  }

  function setWorking(working) {
    if (!submitBtn) return;
    submitBtn.disabled = working;
    submitBtn.classList.toggle("opacity-60", working);
    submitBtn.textContent = working ? "处理中…" : "确定";
  }

  // --------- 事件委托（避免 DOM 被重渲染后丢失监听） ----------
  document.addEventListener("click", async (e) => {
    const t = e.target;

    // 打开：登录 / 注册
    if (t.closest?.("#btnLogin")) {
      e.preventDefault();
      openDialog("login");
      return;
    }
    if (t.closest?.("#btnRegister")) {
      e.preventDefault();
      openDialog("register");
      return;
    }

    // 取消：仅关闭，不触发校验
    if (t.closest?.("#authCancel")) {
      e.preventDefault();
      closeDialog();
      return;
    }

    // 退出登录
    if (t.closest?.("#btnLogout")) {
      e.preventDefault();
      if (!auth) {
        toast("未初始化 Firebase");
        return;
      }
      try {
        const { signOut } = await import(
          "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js"
        );
        await signOut(auth);
        toast("已退出");
      } catch (err) {
        console.error(err);
        toast("退出失败");
      }
      return;
    }
  });

  // --------- 表单提交（登录 / 注册） ----------
  if (form && submitBtn) {
    // 用 submit 事件统一处理（可保留浏览器原生的 required 提示）
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!auth) {
        toast("未初始化 Firebase");
        return;
      }
      // 手动跑一次原生校验提示（无效则直接返回）
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const mode = authModal?.dataset.mode || "login";
      const email = emailEl?.value.trim() || "";
      const pass  = passEl?.value || "";

      setWorking(true);
      try {
        const {
          signInWithEmailAndPassword,
          createUserWithEmailAndPassword,
        } = await import(
          "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js"
        );

        if (mode === "register") {
          await createUserWithEmailAndPassword(auth, email, pass);
          toast("注册成功，已自动登录");
        } else {
          await signInWithEmailAndPassword(auth, email, pass);
          toast("登录成功");
        }
        closeDialog();
      } catch (err) {
        console.error(err);
        const msg = explainAuthError(err?.code);
        toast(msg);
      } finally {
        setWorking(false);
      }
    });

    // 为了兼容某些浏览器，把“确定”按钮也拦一下（避免被视为原生提交导致对话框关闭）
    submitBtn.addEventListener("click", (e) => {
      // 让 form 的 submit 事件统一处理
      e.preventDefault();
      form.requestSubmit?.(); // 现代浏览器
    });
  }

  // --------- 监听登录态，刷新头部 ----------
  (async function watchAuth() {
    if (!auth || !authArea) return;
    const { onAuthStateChanged } = await import(
      "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js"
    );
    onAuthStateChanged(auth, (user) => {
      renderHeader(user || null);
    });
  })();

  // --------- 暴露调试入口 ----------
  window.__GF__ = Object.assign({}, GF, {
    ui: {
      openLogin: () => openDialog("login"),
      openRegister: () => openDialog("register"),
      closeAuth: () => closeDialog(),
    },
  });
})();
