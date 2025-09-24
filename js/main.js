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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let todosRegistros = [];

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
      const agora = new Date();
      const local = agora.toLocaleString("sv-SE", { hour12: false }).replace(" ", "T");
      document.getElementById("dataHora").value = local.slice(0,16);
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

  const semSintomasG = document.getElementById("semSintomasGlicemia");
  if (semSintomasG) {
    semSintomasG.addEventListener("change", e => {
      const field = document.getElementById("glicemiaSintomas");
      if (e.target.checked) {
        field.value = "Sem sintomas";
        field.disabled = true;
      } else {
        field.value = "";
        field.disabled = false;
      }
    });
  }
  const semSintomasP = document.getElementById("semSintomasPressao");
  if (semSintomasP) {
    semSintomasP.addEventListener("change", e => {
      const field = document.getElementById("pressaoSintomas");
      if (e.target.checked) {
        field.value = "Sem sintomas";
        field.disabled = true;
      } else {
        field.value = "";
        field.disabled = false;
      }
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
      momento: document.getElementById("glicemiaMomento").value,
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
  const registrosRef = ref(db, 'registros');
  onValue(registrosRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    todosRegistros = Object.values(data);
    renderTabela(todosRegistros);
  });
}

function aplicarFiltros() {
  const nome = document.getElementById("filtroNome").value.toLowerCase();
  const inicio = document.getElementById("filtroInicio").value;
  const fim = document.getElementById("filtroFim").value;

  const filtrados = todosRegistros.filter(r => {
    const nomeOk = !nome || (r.nome && r.nome.toLowerCase().includes(nome));
    const dataOk = (!inicio || r.dataHora >= inicio) && (!fim || r.dataHora <= fim+"T23:59");
    return nomeOk && dataOk;
  });

  renderTabela(filtrados);
}

function resetarFiltros() {
  document.getElementById("filtroNome").value = "";
  document.getElementById("filtroInicio").value = "";
  document.getElementById("filtroFim").value = "";
  renderTabela(todosRegistros);
}

function renderTabela(lista) {
  const tabelaGlicemia = document.getElementById("tabelaGlicemia");
  const tabelaPressao = document.getElementById("tabelaPressao");
  if (tabelaGlicemia) tabelaGlicemia.innerHTML = "<tr><th>Nome</th><th>Data/Hora</th><th>Valor</th><th>Momento</th><th>Sintomas</th></tr>";
  if (tabelaPressao) tabelaPressao.innerHTML = "<tr><th>Nome</th><th>Data/Hora</th><th>PAS</th><th>PAD</th><th>FC</th><th>Sintomas</th></tr>";

  lista.forEach(r => {
    if (r.tipo === "glicemia" && tabelaGlicemia) {
      let row = tabelaGlicemia.insertRow();
      row.insertCell(0).innerText = r.nome;
      row.insertCell(1).innerText = r.dataHora;
      row.insertCell(2).innerText = r.valor;
      row.insertCell(3).innerText = r.momento || "";
      row.insertCell(4).innerText = r.sintomas;
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
}
