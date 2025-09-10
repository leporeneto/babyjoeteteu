import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDVYfkxe7-7IZ_57hbv5mnczwmv-YG3rfQ",
  authDomain: "babyjoeteteu.firebaseapp.com",
  databaseURL: "https://babyjoeteteu-default-rtdb.firebaseio.com",
  projectId: "babyjoeteteu",
  storageBucket: "babyjoeteteu.firebasestorage.app",
  messagingSenderId: "678197642263",
  appId: "1:678197642263:web:9db5a939a76c4d4c050852"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  const tipoSelect = document.getElementById("tipo");
  const glicemiaFields = document.getElementById("glicemiaFields");
  const pressaoFields = document.getElementById("pressaoFields");
  const agoraBtn = document.getElementById("agoraBtn");
  const form = document.getElementById("registroForm");

  if (tipoSelect) {
    tipoSelect.addEventListener("change", () => {
      glicemiaFields.style.display = (tipoSelect.value === "glicemia") ? "block" : "none";
      pressaoFields.style.display = (tipoSelect.value === "pressao") ? "block" : "none";
    });
  }

  if (agoraBtn) {
    agoraBtn.addEventListener("click", () => {
      document.getElementById("dataHora").value = new Date().toISOString().slice(0,16);
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await salvarRegistro();
      alert("Registro salvo no Firebase!");
      form.reset();
    });
  }

  carregarHistorico();
});

async function salvarRegistro() {
  const nome = document.getElementById("nome").value;
  const dataHora = document.getElementById("dataHora").value;
  const tipo = document.getElementById("tipo").value;

  let registro;

  if (tipo === "glicemia") {
    registro = {
      tipo,
      nome,
      dataHora,
      valor: document.getElementById("glicemiaValor").value,
      sintomas: document.getElementById("glicemiaSintomas").value
    };
  } else {
    registro = {
      tipo,
      nome,
      dataHora,
      pas: document.getElementById("pas").value,
      pad: document.getElementById("pad").value,
      fc: document.getElementById("fc").value,
      sintomas: document.getElementById("pressaoSintomas").value
    };
  }

  const registrosRef = ref(db, 'registros');
  await push(registrosRef, registro);
}

async function carregarHistorico() {
  const tabelaGlicemia = document.getElementById("tabelaGlicemia");
  const tabelaPressao = document.getElementById("tabelaPressao");

  if (!tabelaGlicemia && !tabelaPressao) return;

  const registrosRef = ref(db, 'registros');
  onValue(registrosRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    if (tabelaGlicemia) {
      tabelaGlicemia.innerHTML = "<tr><th>Nome</th><th>Data/Hora</th><th>Valor</th><th>Sintomas</th></tr>";
    }
    if (tabelaPressao) {
      tabelaPressao.innerHTML = "<tr><th>Nome</th><th>Data/Hora</th><th>PAS</th><th>PAD</th><th>FC</th><th>Sintomas</th></tr>";
    }

    Object.values(data).forEach(r => {
      if (r.tipo === "glicemia" && tabelaGlicemia) {
        let row = tabelaGlicemia.insertRow();
        row.insertCell(0).innerText = r.nome;
        row.insertCell(1).innerText = r.dataHora;
        row.insertCell(2).innerText = r.valor;
        row.insertCell(3).innerText = r.sintomas;
      } else if (r.tipo === "pressao" && tabelaPressao) {
        let row = tabelaPressao.insertRow();
        row.insertCell(0).innerText = r.nome;
        row.insertCell(1).innerText = r.dataHora;
        row.insertCell(2).innerText = r.pas;
        row.insertCell(3).innerText = r.pad;
        row.insertCell(4).innerText = r.fc;
        row.insertCell(5).innerText = r.sintomas;
      }
    });
  });
}
