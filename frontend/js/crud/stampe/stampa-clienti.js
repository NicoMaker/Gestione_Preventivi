// ==================== STAMPA CLIENTI (GRAFICA UI) ====================
// File: js/crud/stampa-clienti.js

let companyInfoPrintCacheClienti = null;

async function loadCompanyInfoForPrintClienti() {
    try {
        if (companyInfoPrintCacheClienti) return companyInfoPrintCacheClienti;
        if (typeof companyInfo !== "undefined" && companyInfo) {
            companyInfoPrintCacheClienti = companyInfo;
            return companyInfoPrintCacheClienti;
        }
        const response = await fetch("company-info.json");
        if (!response.ok) throw new Error(`Errore caricamento: ${response.status}`);
        companyInfoPrintCacheClienti = await response.json();
        return companyInfoPrintCacheClienti;
    } catch (error) {
        console.error("Errore caricamento company-info.json:", error);
        return { name: "Anagrafica Clienti", country: "Italia" };
    }
}

function getCurrentClientiFilters() {
    return {
        searchTerm: document.getElementById("filterClienti")?.value?.toLowerCase() || "",
        dataPassaggio: document.getElementById("filterDataPassaggio")?.value || "",
        ricontattato: document.getElementById("filterClientiRicontattato")?.value || "tutti"
    };
}

function getFilteredClientiForPrint(allClientiData) {
    const filters = getCurrentClientiFilters();
    return allClientiData.filter((c) => {
        const matchText =
            !filters.searchTerm ||
            c.nome.toLowerCase().includes(filters.searchTerm) ||
            (c.num_tel && c.num_tel.toLowerCase().includes(filters.searchTerm)) ||
            (c.email && c.email.toLowerCase().includes(filters.searchTerm)) ||
            (c.note && c.note.toLowerCase().includes(filters.searchTerm));

        const matchDataPassaggio =
            !filters.dataPassaggio ||
            (c.data_passaggio && c.data_passaggio.startsWith(filters.dataPassaggio));

        const matchRicontattato =
            filters.ricontattato === "tutti" ||
            (filters.ricontattato === "si" && c.flag_ricontatto == 1) ||
            (filters.ricontattato === "no" && !c.flag_ricontatto);

        return matchText && matchDataPassaggio && matchRicontattato;
    });
}

function generatePrintHeaderClienti(company) {
    const logoPath = company.logo || "img/Logo.png";
    return `
    <div class="print-header" style="text-align:center;margin-bottom:40px;border-bottom:3px solid #333;padding-bottom:25px;">
      <img src="${logoPath}" alt="Logo Azienda" style="max-width:200px;height:auto;margin-bottom:15px;display:block;margin-left:auto;margin-right:auto;" />
      <h1 style="margin:10px 0 5px 0;font-size:26px;font-weight:bold;color:#2c3e50;">${company.name || "Elenco Clienti"}</h1>
      <p style="margin:3px 0;font-size:13px;color:#555;">${company.address || ""}, ${company.cap || ""} ${company.city || ""} (${company.province || ""})</p>
      <p style="margin:3px 0;font-size:12px;color:#555;">${company.country || "Italia"}</p>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #ddd;">
        <p style="margin:3px 0;font-size:11px;color:#666;"><strong>P.IVA:</strong> ${company.piva || ""}</p>
        <p style="margin:3px 0;font-size:11px;color:#666;"><strong>Tel:</strong> ${company.phone || ""} | <strong>Email:</strong> ${company.email || ""}</p>
      </div>
    </div>
  `;
}

function generateClientiPrintDocument(clientiList, companyWrapper) {
    const company = companyWrapper.company || companyWrapper;
    const sortedClienti = [...clientiList].sort((a, b) => a.nome.localeCompare(b.nome, "it"));
    const header = generatePrintHeaderClienti(company);

    const bodyClienti = sortedClienti.map(c => `
        <div class="cliente-row" style="margin-bottom:30px; padding: 10px 20px; border-left: 5px solid #2980b9; page-break-inside: avoid;">
            <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #2980b9; font-weight: bold;">${c.nome}</h2>
            
            <p style="margin: 6px 0; font-size: 14px; color: #333;">
                <span style="margin-right: 8px;">📱</span><strong>Cell:</strong> ${c.num_tel || "No"}
            </p>
            
            <p style="margin: 6px 0; font-size: 14px; color: #333;">
                <span style="margin-right: 8px;">✉️</span><strong>Email:</strong> ${c.email || "No"}
            </p>
            
            <p style="margin: 6px 0; font-size: 14px; color: #333;">
                <span style="margin-right: 8px;">📅</span><strong>Data Passaggio/Ricontatto:</strong> ${c.data_passaggio ? formatDate(c.data_passaggio) : "No"}
            </p>
            
            <div style="margin: 12px 0;">
                <span style="display: inline-block; padding: 5px 15px; border-radius: 15px; font-size: 13px; font-weight: bold; border: 1px solid #c4b5fd; background: #ede9fe; color: #4c1d95;">
                    <span style="margin-right: 5px;">📱</span>${c.flag_ricontatto == 1 ? "Ricontattato" : "Da ricontattare"}
                </span>
            </div>
            
            <p style="margin: 12px 0 6px 0; font-size: 14px; color: #333;">
                <span style="margin-right: 8px;">📝</span><strong>Note cliente:</strong> ${c.note || "Nessuna nota"}
            </p>
            
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #666; font-style: italic;">
                Totale preventivi: <strong>${c.ordini_count || 0}</strong>
            </p>
        </div>
    `).join("");

    return `
    <!DOCTYPE html>
    <html lang="it">
      <head>
        <meta charset="UTF-8" />
        <title>Stampa Elenco Clienti</title>
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; color: #333; }
          .print-container { max-width: 210mm; margin: 0 auto; padding: 20mm; }
          @media print {
            body { margin: 0; padding: 0; }
            .print-container { max-width: 100%; padding: 10mm; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${header}
          ${bodyClienti}
          <div style="margin-top:30px; text-align:center; font-size:10px; color:#999; border-top:1px solid #ddd; padding-top:10px;">
            Documento generato il: ${new Date().toLocaleString("it-IT")}
          </div>
        </div>
      </body>
    </html>
  `;
}

async function printClientiDiretta() {
    try {
        if (typeof allClienti === "undefined" || !allClienti || allClienti.length === 0) {
            showNotification("Nessun cliente da stampare.", "warning");
            return;
        }

        const dataToPrint = getFilteredClientiForPrint(allClienti);
        const companyData = await loadCompanyInfoForPrintClienti();
        const htmlPrint = generateClientiPrintDocument(dataToPrint, companyData);

        const printFrame = document.createElement("iframe");
        printFrame.style.cssText = "position:absolute;left:-9999px;width:0;height:0;border:0;";
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

window.printClientiDiretta = printClientiDiretta;