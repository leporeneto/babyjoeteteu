// COLE AQUI SUA URL DO WEBAPP (Google Apps Script publicado como Web App)
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxVotG0Eetd49db31mASRMB56ATB7Q67Zk2garkE1AYAcW4U3KtI_wuAHRW_KHAv8KQ/exec";

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
      alert("Registro enviado!");
      form.reset();
    });
  }

  carregarHistorico();
});

async function salvarRegistro() {
  const nome = document.getElementById("nome").value;
  const dataHora = document.getElementById("dataHora").value;
  const tipo = document.getElementById("tipo").value;

  let payload;

  if (tipo === "glicemia") {
    payload = {
      tipo,
      nome,
      dataHora,
      valor: document.getElementById("glicemiaValor").value,
      sintomas: document.getElementById("glicemiaSintomas").value
    };
  } else {
    payload = {
      tipo,
      nome,
      dataHora,
      pas: document.getElementById("pas").value,
      pad: document.getElementById("pad").value,
      fc: document.getElementById("fc").value,
      sintomas: document.getElementById("pressaoSintomas").value
    };
  }

  await fetch(WEBAPP_URL, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {"Content-Type": "application/json"}
  });
}

async function carregarHistorico() {
  const tabelaGlicemia = document.getElementById("tabelaGlicemia");
  const tabelaPressao = document.getElementById("tabelaPressao");
  if (!tabelaGlicemia && !tabelaPressao) return;

  const resp = await fetch(WEBAPP_URL);
  const dados = await resp.json();

  if (tabelaGlicemia) {
    dados.glicemia.forEach(r => {
      let row = tabelaGlicemia.insertRow();
      row.insertCell(0).innerText = r.nome;
      row.insertCell(1).innerText = r.dataHora;
      row.insertCell(2).innerText = r.valor;
      row.insertCell(3).innerText = r.sintomas;
    });
  }

  if (tabelaPressao) {
    dados.pressao.forEach(r => {
      let row = tabelaPressao.insertRow();
      row.insertCell(0).innerText = r.nome;
      row.insertCell(1).innerText = r.dataHora;
      row.insertCell(2).innerText = r.pas;
      row.insertCell(3).innerText = r.pad;
      row.insertCell(4).innerText = r.fc;
      row.insertCell(5).innerText = r.sintomas;
    });
  }
}
