// ==================== STAMPA CLIENTI ====================
// File: js/crud/stampa-clienti.js
// Dipende da: config.js, ui.js

let companyInfoPrintCacheClienti = null;

async function loadCompanyInfoForPrintClienti() {
    try {
        if (companyInfoPrintCacheClienti) return companyInfoPrintCacheClienti;
        if (typeof companyInfo !== "undefined" && companyInfo && companyInfo.company) {
            companyInfoPrintCacheClienti = companyInfo;
            return companyInfoPrintCacheClienti;
        }
        const response = await fetch("company-info.json");
        if (!response.ok) throw new Error(`Errore caricamento: ${response.status}`);
        companyInfoPrintCacheClienti = await response.json();
        return companyInfoPrintCacheClienti;
    } catch (error) {
        console.error("Errore caricamento company-info.json:", error);
        return { company: { address: "", cap: "", city: "", province: "", country: "Italia", piva: "", email: "", phone: "" } };
    }
}

// Funzione per ottenere i filtri attuali dalla sezione clienti
function getCurrentClientiFilters() {
    return {
        searchTerm: document.getElementById("filterClienti")?.value?.toLowerCase() || "",
        dataPassaggio: document.getElementById("filterDataPassaggio")?.value || "",
        ricontattato: document.getElementById("filterClientiRicontattato")?.value || "tutti"
    };
}

// Applica gli stessi filtri della UI per ottenere i clienti da stampare
function getFilteredClientiForPrint(allClientiData) {
    const filters = getCurrentClientiFilters();
    return allClientiData.filter((c) => {
        const matchText =
            !filters.searchTerm ||
            c.nome.toLowerCase().includes(filters.searchTerm) ||
            (c.num_tel && c.num_tel.toLowerCase().includes(filters.searchTerm)) ||
            (c.email && c.email.toLowerCase().includes(filters.searchTerm)) ||
            (c.data_passaggio && c.data_passaggio.includes(filters.searchTerm)) ||
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

function generatePrintHeaderClienti(companyData) {
    const company = companyData.company || companyData;
    const logoPath = company.logo || "img/Logo.png";
    const fullAddress = [company.address, company.cap, company.city, company.province, company.country].filter(Boolean).join(", ");
    return `
    <div class="print-header" style="text-align:center;margin-bottom:30px;border-bottom:3px solid #333;padding-bottom:25px;">
      <img src="${logoPath}" alt="Logo Azienda" style="max-width:200px;height:auto;margin-bottom:15px;display:block;margin-left:auto;margin-right:auto;" />
      <h1 style="margin:10px 0 5px 0;font-size:26px;font-weight:bold;color:#2c3e50;">Elenco Clienti</h1>
      <p style="margin:3px 0;font-size:13px;color:#555;">${fullAddress}</p>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #ddd;">
        <p style="margin:3px 0;font-size:11px;color:#666;"><strong>P.IVA:</strong> ${company.piva || ""}</p>
        <p style="margin:3px 0;font-size:11px;color:#666;"><strong>Tel:</strong> ${formatPhoneNumber(company.phone) || ""} | <strong>Email:</strong> ${company.email || ""}</p>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatPhoneNumberForPrint(phone) {
    if (!phone) return "No";
    return phone;
}

function generateClientiPrintDocument(clientiList, companyWrapper) {
    if (!clientiList || clientiList.length === 0) {
        return `<html><body><h1>Nessun cliente da stampare con i filtri correnti.</h1></body></html>`;
    }

    const company = companyWrapper.company || companyWrapper;
    
    // Ordina i clienti per nome
    const sortedClienti = [...clientiList].sort((a, b) => a.nome.localeCompare(b.nome, "it"));

    const header = generatePrintHeaderClienti(company);
    
    const bodyClienti = sortedClienti.map((c, index) => {
        const isEven = index % 2 === 0;
        return `
        <div class="cliente-card" style="margin-bottom:25px;page-break-inside:avoid;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:${isEven ? '#ffffff' : '#fafbfc'};">
            <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:16px 20px;color:white;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                    <h2 style="margin:0;font-size:18px;font-weight:bold;">${escapeHtml(c.nome)}</h2>
                    <span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;background:rgba(255,255,255,0.2);">
                        📄 Preventivi: ${c.ordini_count || 0}
                    </span>
                </div>
            </div>
            <div style="padding:20px;">
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin-bottom:20px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;color:#64748b;">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                        </svg>
                        <div>
                            <div style="font-size:11px;color:#64748b;font-weight:600;">Telefono</div>
                            <div style="font-size:14px;font-weight:500;">${c.num_tel ? formatPhoneNumberForPrint(c.num_tel) : "—"}</div>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;color:#64748b;">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        <div>
                            <div style="font-size:11px;color:#64748b;font-weight:600;">Email</div>
                            <div style="font-size:14px;font-weight:500;">${c.email ? escapeHtml(c.email) : "—"}</div>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;color:#64748b;">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <div>
                            <div style="font-size:11px;color:#64748b;font-weight:600;">Data Passaggio/Ricontatto</div>
                            <div style="font-size:14px;font-weight:500;">${c.data_passaggio ? formatDate(c.data_passaggio) : "—"}</div>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;color:#64748b;">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                        </svg>
                        <div>
                            <div style="font-size:11px;color:#64748b;font-weight:600;">Stato Ricontatto</div>
                            <div>
                                <span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;${c.flag_ricontatto == 1 ? "background:#ede9fe;color:#4c1d95;" : "background:#f1f5f9;color:#475569;"}">
                                    ${c.flag_ricontatto == 1 ? "📱 Ricontattato" : "⏳ Da ricontattare"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                ${c.note ? `
                <div style="margin-top:16px;padding:12px;background:#f8fafc;border-radius:8px;border-left:3px solid #667eea;">
                    <div style="font-size:11px;color:#64748b;font-weight:600;margin-bottom:6px;">📝 Note Cliente</div>
                    <div style="font-size:13px;color:#334155;line-height:1.5;">${escapeHtml(c.note)}</div>
                </div>
                ` : ''}
                ${c.ordini_count > 0 ? `
                <div style="margin-top:16px;padding:12px;background:#fefce8;border-radius:8px;border-left:3px solid #eab308;">
                    <div style="font-size:11px;color:#64748b;font-weight:600;margin-bottom:6px;">📊 Statistiche</div>
                    <div style="font-size:13px;color:#334155;">Questo cliente ha <strong>${c.ordini_count}</strong> preventivo${c.ordini_count !== 1 ? 'i' : ''} associato${c.ordini_count !== 1 ? 'i' : ''}</div>
                </div>
                ` : ''}
            </div>
        </div>
        `;
    }).join("");

    return `
    <!DOCTYPE html>
    <html lang="it">
      <head>
        <meta charset="UTF-8" />
        <title>Stampa Elenco Clienti</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background: white;
            }
            .print-container {
                max-width: 210mm;
                margin: 0 auto;
                padding: 20mm;
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                }
                .print-container {
                    max-width: 100%;
                    padding: 0;
                    margin: 0;
                }
                .cliente-card {
                    page-break-inside: avoid;
                    break-inside: avoid;
                    margin-bottom: 20px;
                }
            }
            @page {
                size: A4;
                margin: 15mm;
            }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${header}
          ${bodyClienti}
          <div style="margin-top:30px;text-align:center;font-size:10px;color:#999;border-top:1px solid #ddd;padding-top:15px;">
            Documento generato il: ${new Date().toLocaleString("it-IT")}<br>
            Totale clienti: <strong>${sortedClienti.length}</strong>
          </div>
        </div>
      </body>
    </html>
  `;
}

async function printClientiDiretta() {
    try {
        // Controlla se i dati globali dei clienti sono caricati
        if (typeof allClienti === "undefined" || !allClienti || allClienti.length === 0) {
            showNotification(
                "Nessun cliente da stampare. Caricamento dati in corso...",
                "warning"
            );
            return;
        }

        // Ottieni i clienti filtrati in base allo stato corrente dell'UI
        const dataToPrint = getFilteredClientiForPrint(allClienti);

        if (dataToPrint.length === 0) {
            showNotification(
                "Nessun cliente da stampare con i filtri correnti.",
                "warning"
            );
            return;
        }

        // Carica le informazioni dell'azienda per l'intestazione
        const companyData = await loadCompanyInfoForPrintClienti();

        // Genera il documento HTML per la stampa
        const htmlPrint = generateClientiPrintDocument(dataToPrint, companyData);

        // Crea un iframe invisibile per la stampa
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

        showNotification(`Stampa avviata per ${dataToPrint.length} cliente${dataToPrint.length !== 1 ? 'i' : ''}!`, "success");
    } catch (err) {
        console.error("Errore durante la stampa clienti:", err);
        showNotification("Errore nella generazione della stampa: " + err.message, "error");
    }
}

// Rendi la funzione disponibile globalmente
window.printClientiDiretta = printClientiDiretta;