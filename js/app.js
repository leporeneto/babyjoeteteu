(function(){
<td>${escapeHtml(r.nome)}</td>
<td>${r.tipo === 'pressao' ? 'Pressão' : 'Glicemia'}</td>
<td>${escapeHtml(r.valor)}</td>
<td>${escapeHtml(r.obs||'')}</td>
</tr>`).join('');
tbody.innerHTML = rows || `<tr><td colspan="5">Sem registros ainda.</td></tr>`;
}


// Results page
function initResults(){
if (!document.getElementById('resultsTable')) return;
const filterForm = document.getElementById('filterForm');
const resetBtn = document.getElementById('resetFiltros');
document.getElementById('exportBtn2')?.addEventListener('click', exportJSON);


filterForm.addEventListener('submit', ev=>{ ev.preventDefault(); renderResults(); });
resetBtn.addEventListener('click', ()=>{ filterForm.reset(); renderResults(); });


renderResults();
}


function renderResults(){
const table = document.getElementById('resultsTable');
if (!table) return;
const tbody = table.querySelector('tbody');


const fNome = (document.getElementById('fNome')?.value || '').toLowerCase().trim();
const fTipo = (document.getElementById('fTipo')?.value || '').trim();
const fIni = document.getElementById('fIni')?.value;
const fFim = document.getElementById('fFim')?.value;


let data = loadAll();
if (fNome) data = data.filter(r => r.nome.toLowerCase().includes(fNome));
if (fTipo) data = data.filter(r => r.tipo === fTipo);
if (fIni){ const d = new Date(fIni+'T00:00'); data = data.filter(r => new Date(r.datetime) >= d); }
if (fFim){ const d = new Date(fFim+'T23:59'); data = data.filter(r => new Date(r.datetime) <= d); }


const rows = data.map(r=>`
<tr>
<td>${fmtDate(r.datetime)}</td>
<td>${escapeHtml(r.nome)}</td>
<td>${r.tipo === 'pressao' ? 'Pressão' : 'Glicemia'}</td>
<td>${escapeHtml(r.valor)}</td>
<td>${escapeHtml(r.obs||'')}</td>
</tr>`).join('');
tbody.innerHTML = rows || `<tr><td colspan="5">Nada encontrado com os filtros.</td></tr>`;
}


function escapeHtml(str){
return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]));
}


// Boot
document.addEventListener('DOMContentLoaded', ()=>{
initIndex();
initResults();


// Hook export/import on index already set; also attach on results
const importEl = document.getElementById('importFile');
if (importEl){ /* index only */ }
});
})();
