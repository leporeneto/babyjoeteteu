const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyacpivpxwG1PRbtP-fhpTKLgD_7xfo7cARUGcFJUbp-QyMEWPOW-b_edA8NtDFiOPt4A/exec";

document.addEventListener("DOMContentLoaded", () => {
  const tipo = document.getElementById("tipo");
  if (tipo) {
    tipo.addEventListener("change", toggleFields);
  }

  const form = document.getElementById("entryForm");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }

  if (document.getElementById("resultsTable")) {
    const filterForm = document.getElementById("filterForm");
    const resetBtn = document.getElementById("resetFiltros");

    filterForm.addEventListener("submit", ev => {
      ev.preventDefault();
      loadResults();
    });

    resetBtn.addEventListener("click", () => {
      filterForm.reset();
      loadResults();
    });

    loadResults();
  }
});

function toggleFields() {
  const tipo = document.getElementById("tipo").value;
  document.getElementById("pressaoFields").hidden = (tipo !== "pressao");
  document.getElementById("glicemiaFields").hidden = (tipo !== "glicemia");
}

async function handleSubmit(e) {
  e.preventDefault();
  const body = {
    id: "id-" + Date.now(),
    nome: document.getElementById("nome").value,
    tipo: document.getElementById("tipo").value,
    pas: document.getElementById("pas")?.value || "",
    pad: document.getElementById("pad")?.value || "",
    fc: document.getElementById("fc")?.value || "",
    mgdl: document.getElementById("mgdl")?.value || "",
    contexto: document.getElementById("ctx")?.value || "",
    obs: document.getElementById("obs").value,
    datetime: document.getElementById("usarAgora").checked
      ? new Date().toISOString()
      : new Date(document.getElementById("datahora").value).toISOString()
  };

  const res = await fetch(WEBAPP_URL, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

  const result = await res.json();
  if (result.status === "ok") {{
    alert("Registro salvo!");
    e.target.reset();
    document.getElementById("usarAgora").checked = true;
  }} else {{
    alert("Erro ao salvar: " + result.message);
  }}
}

async function loadResults() {
  const table = document.getElementById("resultsTable");
  if (!table) return;
  const tbody = table.querySelector("tbody");

  const fNome = (document.getElementById("fNome")?.value || "").toLowerCase().trim();
    const fTipo = (document.getElementById("fTipo")?.value || "";
  const fIni = document.getElementById("fIni")?.value;
  const fFim = document.getElementById("fFim")?.value;

  const url = new URL(WEBAPP_URL);
  url.searchParams.set("action", "list");
  if (fNome) url.searchParams.set("nome", fNome);
  if (fTipo) url.searchParams.set("tipo", fTipo);
  if (fIni) url.searchParams.set("ini", fIni);
  if (fFim) url.searchParams.set("fim", fFim);

  const res = await fetch(url);
  const data = await res.json();

  const rows = data.map(r => {{
    const valor = r.tipo === "pressao"
      ? `${{r.pas}}/${{r.pad}} (FC: ${{r.fc}})`
      : `${{r.mgdl}} mg/dL (${{r.contexto}})`;
    return `<tr>
      <td>{{r.datetime}}</td>
      <td>{{r.nome}}</td>
      <td>{{r.tipo}}</td>
      <td>{{valor}}</td>
      <td>{{r.obs || ""}}</td>
    </tr>`;
  }}).join("");

  tbody.innerHTML = rows || `<tr><td colspan="5">Nenhum registro encontrado.</td></tr>`;

  // Desenhar gráficos
  drawCharts(data);
}

function toggleFields() {
  const tipo = document.getElementById("tipo").value;
  document.getElementById("pressaoFields").hidden = (tipo !== "pressao");
  document.getElementById("glicemiaFields").hidden = (tipo !== "glicemia");
}

function fmtDate(dstr) {
  if (!dstr) return "";
  const d = new Date(dstr);
  return d.toLocaleString("pt-BR");
}

function drawCharts(data) {
  const ctxPA = document.getElementById("chartPA");
  const ctxGlic = document.getElementById("chartGlic");
  if (!ctxPA || !ctxGlic) return;

  const dPA = data.filter(r=>r.tipo==="pressao");
  const dG = data.filter(r=>r.tipo==="glicemia");

  if (dPA.length) {{
    new Chart(ctxPA, {{
      type: 'line',
      data: {{
        labels: dPA.map(r=>fmtDate(r.datetime)),
        datasets: [
          {{ label:'PAS', data: dPA.map(r=>Number(r.pas)), borderColor:"#f87171", fill:false }},
          {{ label:'PAD', data: dPA.map(r=>Number(r.pad)), borderColor:"#60a5fa", fill:false }},
          {{ label:'FC',  data: dPA.map(r=>Number(r.fc)), borderColor:"#10b981", fill:false }}
        ]
      }},
      options: {{
        responsive:true,
        plugins: {{ legend: {{ position:"bottom" }} }},
        scales: {{
          y: {{ beginAtZero:false }}
        }}
      }}
    }});
  }}

  if (dG.length) {{
    new Chart(ctxGlic, {{
      type: 'line',
      data: {{
        labels: dG.map(r=>fmtDate(r.datetime)),
        datasets: [
          {{ label:'Glicemia (mg/dL)', data: dG.map(r=>Number(r.mgdl)), borderColor:"#f59e0b", fill:false }}
        ]
      }},
      options: {{
        responsive:true,
        plugins: {{ legend: {{ position:"bottom" }} }},
        scales: {{
          y: {{ beginAtZero:false }}
        }}
      }}
    }});
  }}
}
