# Registro de Saúde

Projeto simples para registrar **Glicemia** e **Pressão Arterial**, com dados salvos em **Google Sheets** via **Google Apps Script**.

## 🚀 Como configurar

1. Crie uma planilha no Google Sheets com duas abas:
   - **Glicemia** → colunas: `Nome | DataHora | Valor | Sintomas`
   - **Pressao** → colunas: `Nome | DataHora | PAS | PAD | FC | Sintomas`

2. Em **Extensões > Apps Script**, cole o seguinte código:

```javascript
function doPost(e) {
  let data = JSON.parse(e.postData.contents);
  let sheet = SpreadsheetApp.getActiveSpreadsheet();

  if (data.tipo === "glicemia") {
    let aba = sheet.getSheetByName("Glicemia");
    aba.appendRow([data.nome, data.dataHora, data.valor, data.sintomas]);
  } else if (data.tipo === "pressao") {
    let aba = sheet.getSheetByName("Pressao");
    aba.appendRow([data.nome, data.dataHora, data.pas, data.pad, data.fc, data.sintomas]);
  }

  return ContentService.createTextOutput(JSON.stringify({status:"ok"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet();
  let dados = { glicemia: [], pressao: [] };

  let gVals = sheet.getSheetByName("Glicemia").getDataRange().getValues();
  for (let i = 1; i < gVals.length; i++) {
    dados.glicemia.push({
      nome: gVals[i][0], dataHora: gVals[i][1], valor: gVals[i][2], sintomas: gVals[i][3]
    });
  }

  let pVals = sheet.getSheetByName("Pressao").getDataRange().getValues();
  for (let i = 1; i < pVals.length; i++) {
    dados.pressao.push({
      nome: pVals[i][0], dataHora: pVals[i][1], pas: pVals[i][2], pad: pVals[i][3], fc: pVals[i][4], sintomas: pVals[i][5]
    });
  }

  return ContentService.createTextOutput(JSON.stringify(dados))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Vá em **Implantar > Nova implantação > Aplicativo da Web**:
   - Executar como: **Você (sua conta)**
   - Quem tem acesso: **Qualquer pessoa com o link**
   - Copie a URL gerada

4. No arquivo `js/main.js`, edite a linha:
```javascript
const WEBAPP_URL = "https://script.google.com/macros/s/SEU_ID/exec";
```
e cole sua URL.

5. Publique no GitHub Pages:
   - Vá em **Configurações > Pages > Branch: main**  
   - O GitHub vai gerar a URL do site.

Pronto! ✅ Agora você já tem um sistema simples de registro e histórico online.
