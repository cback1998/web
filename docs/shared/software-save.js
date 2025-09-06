<!-- docs/_shared/software-save.js -->
<script type="module">
import { auth, db } from "./firebase.js";
import {
  collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const LS_KEY = "gf_software_pick";
const $ = s => document.querySelector(s);
const btnSave = $("#btnSave");
const envName = $("#envName");

function toast(m){
  const d=document.createElement("div");
  d.className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-3 py-2 rounded-xl";
  d.textContent=m; document.body.appendChild(d);
  setTimeout(()=>d.remove(), 1200);
}

function getPick(){
  try { return JSON.parse(localStorage.getItem(LS_KEY)||"[]"); } catch{ return []; }
}

onAuthStateChanged(auth, (u)=>{
  if (!btnSave) return;
  btnSave.disabled = !u;
  btnSave.classList.toggle("opacity-50", !u);
});

btnSave?.addEventListener("click", async ()=>{
  const u = auth.currentUser;
  if (!u) return toast("请先登录");
  const items = getPick();
  if (!items.length) return toast("清单为空");
  try {
    const name = (envName?.value || "gf-env").trim();
    await addDoc(collection(db, "software_bundles"), {
      uid: u.uid, name, items,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    toast("已保存到账号");
  } catch (e) {
    toast("保存失败：" + (e?.message || e));
  }
});
</script>
