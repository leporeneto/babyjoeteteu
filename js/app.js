const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxoxx6tLGa5OEEi_WYUQx0Z6fuVV6z01QmCow3LMGgfXXdMhhOmqKAll6taLNhP0S8zag/exec";

document.addEventListener("DOMContentLoaded", () => {
  const tipo = document.getElementById("tipo");
  if(tipo) {
    tipo.addEventListener("change", () => {
      document.getElementById("pressaoFields").hidden = tipo.value !== "pressao";
      document.getElementById("glicemiaFields").hidden = tipo.value !== "glicemia";
    });
  }

  const form = document.getElementById("entryForm");
  if(form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const body = {
        id: "id-" + Date.now(),
        nome: document.getElementById("nome").value,
        tipo: document.getElementById("tipo").value,
        pas: document.getElementById("pas")?.value,
        pad: document.getElementById("pad")?.value,
        fc: document.getElementById("fc")?.value,
        mgdl: document.getElementById("mgdl")?.value,
        contexto: document.getElementById("ctx")?.value,
        obs: document.getElementById("obs").value,
        datetime: new Date().toISOString()
      };
      await fetch(WEBAPP_URL, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" }
      });
      alert("Registro salvo!");
      form.reset();
    });
  }

  const table = document.getElementById("resultsTable");
  if(table) {
    fetch(WEBAPP_URL)
      .then(r=>r.json())
      .then(data=>{
        const tbody = table.querySelector("tbody");
        tbody.innerHTML = "";
        data.forEach(r=>{
          const tr = document.createElement("tr");
          const val = r.tipo==="pressao" ? `${r.pas}/${r.pad} (FC ${r.fc})` : `${r.mgdl} mg/dL (${r.contexto})`;
          tr.innerHTML = `<td>${r.datetime}</td><td>${r.nome}</td><td>${r.tipo}</td><td>${val}</td><td>${r.obs}</td>`;
          tbody.appendChild(tr);
        });
        drawCharts(data);
      });
  }
});

function drawCharts(data) {
  const ctxPA = document.getElementById("chartPA");
  const ctxGlic = document.getElementById("chartGlic");
  const dPA = data.filter(r=>r.tipo==="pressao");
  const dG = data.filter(r=>r.tipo==="glicemia");

  if(ctxPA && dPA.length) {
    new Chart(ctxPA, {
      type: 'line',
      data: {
        labels: dPA.map(r=>r.datetime),
        datasets: [
          { label:'PAS', data: dPA.map(r=>Number(r.pas)) },
          { label:'PAD', data: dPA.map(r=>Number(r.pad)) },
          { label:'FC', data: dPA.map(r=>Number(r.fc)) }
        ]
      }
    });
  }

  if(ctxGlic && dG.length) {
    new Chart(ctxGlic, {
      type: 'line',
      data: {
        labels: dG.map(r=>r.datetime),
        datasets: [
          { label:'Glicemia (mg/dL)', data: dG.map(r=>Number(r.mgdl)) }
        ]
      }
    });
  }
}
