// ==================== STAMPA PREVENTIVI PER CLIENTE ====================
// File: js/crud/stampa.js
// Dipende da: config.js, ui.js

let companyInfoPrintCache = null;

async function loadCompanyInfoForPrint() {
  try {
    if (companyInfoPrintCache) return companyInfoPrintCache;
    if (typeof companyInfo !== "undefined" && companyInfo) {
      companyInfoPrintCache = companyInfo;
      return companyInfoPrintCache;
    }
    const response = await fetch("company-info.json");
    if (!response.ok) throw new Error(`Errore caricamento: ${response.status}`);
    companyInfoPrintCache = await response.json();
    return companyInfoPrintCache;
  } catch (error) {
    console.error("Errore caricamento company-info.json:", error);
    return companyInfoPrintCache;
  }
}

function groupOrdiniByCliente(list) {
  return list.reduce((groups, ordine) => {
    const id = ordine.cliente_id;
    if (!groups[id]) groups[id] = [];
    groups[id].push(ordine);
    return groups;
  }, {});
}

function sortOrdiniByDateDesc(list) {
  return [...list].sort(
    (a, b) => new Date(b.data_movimento) - new Date(a.data_movimento),
  );
}

function generatePrintHeader(company) {
  const logoPath = company.logo || "img/Logo.png";
  return `
    <div class="print-header" style="text-align:center;margin-bottom:30px;border-bottom:3px solid #333;padding-bottom:25px;">
      <img src="${logoPath}" alt="Logo Azienda" style="max-width:200px;height:auto;margin-bottom:15px;display:block;margin-left:auto;margin-right:auto;" />
      <h1 style="margin:10px 0 5px 0;font-size:26px;font-weight:bold;color:#2c3e50;">${company.name || "Riepilogo Preventivi"}</h1>
      <p style="margin:3px 0;font-size:13px;color:#555;">${company.address || ""}, ${company.cap || ""} ${company.city || ""} (${company.province || ""})</p>
      <p style="margin:3px 0;font-size:12px;color:#555;">${company.country || "Italia"}</p>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #ddd;">
        <p style="margin:3px 0;font-size:11px;color:#666;"><strong>P.IVA:</strong> ${company.piva || ""}</p>
        <p style="margin:3px 0;font-size:11px;color:#666;"><strong>Tel:</strong> ${formatPhoneNumber(company.phone) || ""} | <strong>Email:</strong> ${company.email || ""}</p>
      </div>
    </div>
  `;
}

function generateClienteSection(cliente, ordiniCliente) {
  const sorted = sortOrdiniByDateDesc(ordiniCliente);

  // Prendi le note cliente dal primo ordine (sono le stesse per tutti)
  const noteCliente =
    sorted.length > 0 ? sorted[0].cliente_note || "" : cliente.note || "";

  return `
    <div class="cliente-section" style="margin-bottom:30px;page-break-inside:avoid;">
      <div style="background:#f5f5f5;padding:15px;border-radius:6px;margin-bottom:15px;border-left:5px solid #2980b9;">
        <h2 style="margin:0 0 8px 0;font-size:17px;color:#2980b9;font-weight:bold;">${cliente.nome || "N/A"}</h2>
        <p style="margin:4px 0;font-size:12px;color:#555;"><strong>📱 Cell:</strong> ${cliente.num_tel ? formatPhoneNumber(cliente.num_tel) : "No"}</p>
        <p style="margin:4px 0;font-size:12px;color:#555;"><strong>✉️ Email:</strong> ${cliente.email || "No"}</p>
        <p style="margin:4px 0;font-size:12px;color:#555;"><strong>📅 Data Passaggio/Ricontatto:</strong> ${cliente.data_passaggio ? formatDate(cliente.data_passaggio) : "No"}</p>
        <p style="margin:4px 0;font-size:12px;color:#555;"><strong>🔖 Stato cliente:</strong>
          <span style="display:inline-block;padding:3px 12px;border-radius:99px;font-size:11px;font-weight:700;margin-left:4px;${cliente.flag_ricontatto == 1 ? "background:#ede9fe;color:#4c1d95;border:1px solid #c4b5fd;" : "background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;"}">
            ${cliente.flag_ricontatto == 1 ? "✅ Ricontattato" : "⏳ Da ricontattare"}
          </span>
        </p>
        <p style="margin:4px 0;font-size:12px;color:#555;"><strong>📝 Note cliente:</strong> ${noteCliente ? noteCliente : "No"}</p>
        <p style="margin:4px 0;font-size:12px;color:#555;"><strong>📋 Totale preventivi:</strong> ${sorted.length}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <thead>
          <tr style="background:#ecf0f1;border-bottom:2px solid #34495e;">
            <th style="padding:10px;text-align:left;border:1px solid #bdc3c7;">Data Preventivo</th>
            <th style="padding:10px;text-align:left;border:1px solid #bdc3c7;">Marca</th>
            <th style="padding:10px;text-align:left;border:1px solid #bdc3c7;">Modello</th>
            <th style="padding:10px;text-align:center;border:1px solid #bdc3c7;">Contratto</th>
            <th style="padding:10px;text-align:left;border:1px solid #bdc3c7;">Note preventivo</th>
          </tr>
        </thead>
        <tbody>
          ${sorted
            .map(
              (o, i) => `
            <tr style="border-bottom:1px solid #ecf0f1;${i % 2 === 0 ? "background:#fafafa;" : ""}">
              <td style="padding:10px;border:1px solid #ecf0f1;font-weight:bold;white-space:nowrap;">${formatDate(o.data_movimento)}</td>
              <td style="padding:10px;border:1px solid #ecf0f1;">${o.marca_nome || "-"}</td>
              <td style="padding:10px;border:1px solid #ecf0f1;">${o.modello_nome || "-"}</td>
              <td style="padding:10px;border:1px solid #ecf0f1;text-align:center;">
                <span style="display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;${o.contratto_finito ? "background:#d1fae5;color:#065f46;border:1px solid #6ee7b7;" : "background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;"}">
                  ${o.contratto_finito ? "✅ concluso" : "🔴 Non concluso"}
                </span>
              </td>
              <td style="padding:10px;border:1px solid #ecf0f1;">${o.note || "-"}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function generatePrintDocumentOrdiniPerCliente(list, companyWrapper) {
  const company = companyWrapper.company || companyWrapper;
  const gruppi = groupOrdiniByCliente(list);
  const clientiUnici = Array.from(
    new Set(
      list.map((o) =>
        JSON.stringify({
          id: o.cliente_id,
          nome: o.cliente_nome,
          num_tel: o.cliente_tel,
          email: o.cliente_email,
          data_passaggio: o.cliente_data_passaggio,
          flag_ricontatto: o.cliente_flag_ricontatto,
          note: o.cliente_note || "",
        }),
      ),
    ),
  )
    .map((s) => JSON.parse(s))
    .sort((a, b) => a.nome.localeCompare(b.nome, "it"));

  const header = generatePrintHeader(company);
  const bodyClienti = clientiUnici
    .map((c) => generateClienteSection(c, gruppi[c.id] || []))
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="it">
      <head>
        <meta charset="UTF-8" />
        <title>Stampa Preventivi per Cliente</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
          .print-container { max-width: 210mm; margin: 0 auto; padding: 20mm; }
          @media print {
            body { margin: 0; padding: 0; }
            .print-container { max-width: 100%; padding: 0; margin: 0; }
            .cliente-section { page-break-inside: avoid; margin-bottom: 40px; }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${header}
          ${bodyClienti}
          <div style="margin-top:20px;text-align:center;font-size:10px;color:#999;border-top:1px solid #ddd;padding-top:10px;">
            Documento generato il: ${new Date().toLocaleString("it-IT")}
          </div>
        </div>
      </body>
    </html>
  `;
}

async function printOrdiniDiretta() {
  try {
    if (!ordini || !ordini.length) {
      showNotification(
        "Nessun preventivo da stampare. Controlla i filtri applicati.",
        "warning",
      );
      return;
    }

    companyInfo = await loadCompanyInfoForPrint();
    const htmlPrint = generatePrintDocumentOrdiniPerCliente(
      ordini,
      companyInfo,
    );

    const printFrame = document.createElement("iframe");
    printFrame.style.cssText =
      "position:absolute;left:-9999px;width:0;height:0;border:0;";
    document.body.appendChild(printFrame);

    printFrame.contentDocument.open();
    printFrame.contentDocument.write(htmlPrint);
    printFrame.contentDocument.close();

    printFrame.onload = () => {
      setTimeout(() => {
        printFrame.contentWindow.print();
        setTimeout(() => document.body.removeChild(printFrame), 1000);
      }, 250);
    };

    showNotification("Dialog stampa aperto!", "success");
  } catch (err) {
    console.error("Errore stampa:", err);
    showNotification("Errore nella stampa", "error");
  }
}

window.printOrdiniDiretta = printOrdiniDiretta;
