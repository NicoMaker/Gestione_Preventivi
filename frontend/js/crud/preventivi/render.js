// ==================== PREVENTIVI: RENDER ====================
// File: js/crud/preventivi/render.js
// Scopo: rendering della tabella preventivi (con pulsanti contatto,
//        badge ricontatto/contratto e note).
// Stato condiviso: ordini (config.js)

function renderOrdini() {
  const tbody = document.getElementById("ordiniTableBody");

  if (ordini.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" class="text-center">
          <div style="padding:40px 20px;color:var(--text-secondary);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 style="width:48px;height:48px;margin:0 auto 16px;display:block;opacity:0.5;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <p style="font-size:16px;font-weight:600;margin-bottom:8px;"> Nessun preventivo presente</p>
            <p style="font-size:14px;">Clicca su <strong>Nuovo Preventivo</strong> per iniziare</p>
          </div>
         </td></tr>`;
    return;
  }

  tbody.innerHTML = ordini.map(rigaOrdine).join("");
}

// Genera l'HTML di una riga preventivo
function rigaOrdine(o) {
  const telefono = o.cliente_tel || "No Cell";
  const email = o.cliente_email || "No Mail";
  const dataPassaggio = o.cliente_data_passaggio || "";
  const flagRicontatto = o.cliente_flag_ricontatto || 0;
  const noteCliente = o.cliente_note || "";

  return `
       <tr>
        <td>${formatDate(o.data_movimento)}</td>
        <td style="min-width:180px;max-width:280px;">
          <strong>${o.cliente_nome}</strong>
        </td>
        <td>
          ${
            telefono !== "No Cell"
              ? `
            <div class="contact-buttons">
              <a href="tel:${telefono}" class="btn-contact btn-phone" title="Chiama ${formatPhoneNumber(telefono)}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                ${formatPhoneNumber(telefono)}
              </a>
              <a href="https://wa.me/${telefono.replace(/[^0-9]/g, "")}" class="btn-contact btn-whatsapp" target="_blank" title="WhatsApp con ${o.cliente_nome}">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </a>
              <a href="sms:${telefono}" class="btn-contact btn-sms" title="SMS a ${o.cliente_nome}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Messaggio
              </a>
            </div>
          `
              : "No Cell"
          }
        </td>
        <td>
          ${
            email !== "No Mail"
              ? `<a href="mailto:${email}" class="btn-contact btn-email" title="Email a ${email}">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                   <polyline points="22,6 12,13 2,6"/>
                 </svg>
                 ${email}
               </a>`
              : "No Mail"
          }
        </td>
        <td>
          <input
            type="date"
            class="inline-date-input"
            value="${dataPassaggio}"
            onchange="updateClienteDataPassaggio(${o.cliente_id}, this.value)"
            title="Modifica data passaggio"
          />
        </td>
        <td class="text-center">
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
            <button class="badge-ricontatto ${flagRicontatto ? "si" : "no"}"
              onclick="updateClienteFlagRicontatto(${o.cliente_id}, ${!flagRicontatto})"
              title="Cambia stato ricontatto">
              ${flagRicontatto ? "📱 Ricontattato" : "⏳ Da ricontattare"}
            </button>
            <button class="badge-contratto ${o.contratto_finito ? "si" : "no"}"
              onclick="updateContrattoFinito(${o.id}, ${!o.contratto_finito})"
              title="Cambia stato contratto">
              ${o.contratto_finito ? "✅ concluso" : "🔴 Non concluso"}
            </button>
          </div>
         </td>
        <td>${o.marca_nome || "-"}</td>
        <td>${o.modello_nome || "-"}</td>
        <td style="min-width:200px;max-width:300px;">
          ${
            o.note
              ? `<span style="font-size:13px;color:#334155;display:block;white-space:pre-wrap;line-height:1.5;cursor:help;" title="${(o.note || "").replace(/"/g, "&quot;")}">${o.note}</span>`
              : `<span style="font-size:13px;color:#94a3b8;font-style:italic;">Nessuna nota</span>`
          }
         </td>
        <td style="min-width:220px;max-width:320px;">
          ${
            noteCliente
              ? `<span title="${noteCliente.replace(/"/g, "&quot;")}" style="font-size:13px;color:#334155;font-weight:500;display:block;white-space:pre-wrap;line-height:1.5;">${noteCliente}</span>`
              : `<span style="font-size:13px;color:#94a3b8;font-style:italic;">Nessuna nota</span>`
          }
         </td>
        <td class="text-right">
          <button class="btn-icon" onclick="editOrdine(${o.id})" title="Modifica preventivo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn-icon" onclick="deleteOrdine(${o.id})" title="Elimina preventivo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
         </td>
       </tr>
    `;
}

window.renderOrdini = renderOrdini;
