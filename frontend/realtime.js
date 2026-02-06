// realtime.js - Gestione Socket.IO e notifiche real-time

// Connessione Socket.IO
let socket = null;
let ignoreNextUpdate = false;

// Inizializza Socket.IO
function initSocket() {
  const socketUrl = window.location.origin;

  socket = io(socketUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('✅ Connesso al server real-time');
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnesso dal server real-time');
  });

  socket.on('connect_error', (error) => {
    console.error('Errore connessione Socket.IO:', error);
  });

  // Eventi marche
  socket.on('marca_aggiunta', () => {
    if (!ignoreNextUpdate && typeof loadMarche === 'function') {
      loadMarche();
    }
  });

  socket.on('marca_modificata', () => {
    if (!ignoreNextUpdate) {
      if (typeof loadMarche === 'function') loadMarche();
      if (typeof loadProdotti === 'function') loadProdotti();
    }
  });

  socket.on('marca_eliminata', () => {
    if (!ignoreNextUpdate) {
      if (typeof loadMarche === 'function') loadMarche();
      if (typeof loadProdotti === 'function') loadProdotti();
    }
  });

  socket.on('marche_aggiornate', () => {
    if (!ignoreNextUpdate && typeof loadMarche === 'function') {
      loadMarche();
    }
  });

  // Eventi modelli
  socket.on('modello_aggiunto', () => {
    if (!ignoreNextUpdate && typeof loadModelli === 'function') {
      loadModelli();
    }
  });

  socket.on('modello_modificato', () => {
    if (!ignoreNextUpdate && typeof loadModelli === 'function') {
      loadModelli();
    }
  });

  socket.on('modello_eliminato', () => {
    if (!ignoreNextUpdate && typeof loadModelli === 'function') {
      loadModelli();
    }
  });

  socket.on('modelli_aggiornati', () => {
    if (!ignoreNextUpdate && typeof loadModelli === 'function') {
      loadModelli();
    }
  });

  // Eventi preventivi (ex ordini)
  socket.on('ordine_aggiunto', () => {
    if (!ignoreNextUpdate && typeof loadOrdini === 'function') {
      loadOrdini();
    }
  });

  socket.on('ordine_modificato', () => {
    if (!ignoreNextUpdate && typeof loadOrdini === 'function') {
      loadOrdini();
    }
  });

  socket.on('ordine_eliminato', () => {
    if (!ignoreNextUpdate && typeof loadOrdini === 'function') {
      loadOrdini();
    }
  });

  socket.on('ordini_aggiornati', () => {
    if (!ignoreNextUpdate && typeof loadOrdini === 'function') {
      loadOrdini();
    }
  });

  socket.on('dati_aggiornati', () => {
    if (!ignoreNextUpdate && typeof loadOrdini === 'function') {
      loadOrdini();
    }
  });

  // Eventi clienti
  socket.on('cliente_aggiunto', () => {
    if (!ignoreNextUpdate && typeof loadClienti === 'function') {
      loadClienti();
    }
  });

  socket.on('cliente_modificato', () => {
    if (!ignoreNextUpdate && typeof loadClienti === 'function') {
      loadClienti();
    }
  });

  socket.on('cliente_eliminato', () => {
    if (!ignoreNextUpdate && typeof loadClienti === 'function') {
      loadClienti();
    }
  });

  socket.on('clienti_aggiornati', () => {
    if (!ignoreNextUpdate && typeof loadClienti === 'function') {
      loadClienti();
    }
  });

  // 🔥 GESTIONE UTENTI - LOGOUT MULTIPLO
  socket.on('utente_modificato', (data) => {
    const currentUsername = localStorage.getItem('nomeUtente');
    
    // Se l'utente modificato è quello loggato, fai logout
    if (data.oldNome && currentUsername === data.oldNome) {
      forceLogout('Il tuo account è stato modificato. Effettua di nuovo il login.');
      return;
    }
    
    if (!ignoreNextUpdate && typeof loadUtenti === 'function') {
      loadUtenti();
    }
  });

  socket.on('utente_eliminato', (data) => {
    const currentUsername = localStorage.getItem('nomeUtente');
    
    // Se l'utente eliminato è quello loggato, fai logout
    if (data.nomeUtente && currentUsername === data.nomeUtente) {
      forceLogout('Il tuo account è stato eliminato.');
      return;
    }
    
    if (!ignoreNextUpdate && typeof loadUtenti === 'function') {
      loadUtenti();
    }
  });

  socket.on('utente_aggiunto', () => {
    if (!ignoreNextUpdate && typeof loadUtenti === 'function') {
      loadUtenti();
    }
  });

  socket.on('utenti_aggiornati', () => {
    if (!ignoreNextUpdate && typeof loadUtenti === 'function') {
      loadUtenti();
    }
  });
}

// 🚪 LOGOUT FORZATO
function forceLogout(message) {
  // Mostra alert moderno
  showAlertModal(
    message || 'Sei stato disconnesso.',
    'Sessione Terminata',
    'warning'
  );
  
  // Aspetta 2 secondi e redirect
  setTimeout(() => {
    localStorage.removeItem('nomeUtente');
    localStorage.removeItem('utenteId');
    localStorage.removeItem('activeSection');
    window.location.href = 'index.html';
  }, 2000);
}

// Sistema di notifiche moderne
function showNotification(message, type = 'info', duration = 4000) {
  const container = document.getElementById('notificationContainer');
  if (!container) return;

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  let icon = '';
  switch(type) {
    case 'success':
      icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
      break;
    case 'error':
      icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
      break;
    case 'warning':
      icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
      break;
    default:
      icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }

  notification.innerHTML = `
    <div class="notification-icon">${icon}</div>
    <div class="notification-content">
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;

  container.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  if (duration > 0) {
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, duration);
  }
}

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSocket);
} else {
  initSocket();
}

// Funzione per ignorare il prossimo aggiornamento
function ignoreNextSocketUpdate(duration = 2000) {
  ignoreNextUpdate = true;
  setTimeout(() => {
    ignoreNextUpdate = false;
  }, duration);
}

// Esporta per uso globale
window.showNotification = showNotification;
window.ignoreNextSocketUpdate = ignoreNextSocketUpdate;
window.forceLogout = forceLogout;

// ==================== MODALI MODERNE ====================

function showConfirmModal(message, title = 'Conferma') {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    const msgElem = document.getElementById('confirmMessage');
    const titleElem = modal.querySelector('.modal-header h2');
    const confirmBtn = document.getElementById('confirmButton');
    const cancelBtn = modal.querySelector('.btn-secondary');
    const closeBtn = modal.querySelector('.modal-close');
    const iconContainer = document.getElementById('confirmIcon');

    msgElem.innerHTML = message;
    titleElem.textContent = title;

    if (title.toLowerCase().includes('elimina')) {
      confirmBtn.style.background = 'var(--danger)';
      iconContainer.innerHTML = '🗑️';
      iconContainer.style.background = 'rgba(239, 68, 68, 0.1)';
      iconContainer.style.color = 'var(--danger)';
    } else {
      confirmBtn.style.background = 'var(--primary)';
      iconContainer.innerHTML = '❓';
      iconContainer.style.background = 'rgba(99, 102, 241, 0.1)';
      iconContainer.style.color = 'var(--primary)';
    }

    modal.classList.add('show');

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      modal.classList.remove('show');
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      closeBtn.removeEventListener('click', handleCancel);
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleCancel);
  });
}

function closeConfirmModal(alreadyResolved = false) {
  const modal = document.getElementById('confirmModal');
  modal.classList.remove('active', 'show');
  
  if (window.confirmModalBackdropHandler) {
    modal.removeEventListener('click', window.confirmModalBackdropHandler);
    delete window.confirmModalBackdropHandler;
  }
  
  if (window.confirmModalCloseHandler) {
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.onclick = null;
    }
    delete window.confirmModalCloseHandler;
  }
}

function showAlertModal(message, title = 'Informazione', type = 'info') {
  const modal = document.getElementById('alertModal');
  const titleEl = document.getElementById('alertModalTitle');
  const messageEl = document.getElementById('alertMessage');
  const iconEl = document.getElementById('alertIcon');

  titleEl.textContent = title;

  let iconSvg = '';
  switch(type) {
    case 'success':
      iconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      `;
      iconEl.className = 'alert-icon success';
      break;
    case 'error':
      iconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `;
      iconEl.className = 'alert-icon error';
      break;
    case 'warning':
      iconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      `;
      iconEl.className = 'alert-icon warning';
      break;
    default:
      iconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
      iconEl.className = 'alert-icon info';
  }

  iconEl.innerHTML = iconSvg;

  if (message.includes('\n') || message.length > 200) {
    const lines = message.split('\n');
    let formattedMessage = '';
    
    lines.forEach(line => {
      if (line.trim().startsWith('━━')) {
        formattedMessage += `<hr style="margin: 8px 0; border: none; border-top: 1px solid var(--border);">`;
      } else if (line.trim().startsWith('✅') || line.trim().startsWith('⚠️') || line.trim().startsWith('❌')) {
        formattedMessage += `<div style="margin: 8px 0; font-weight: 600;">${escapeHtml(line)}</div>`;
      } else if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        formattedMessage += `<div style="margin: 4px 0; padding-left: 16px;">${escapeHtml(line)}</div>`;
      } else if (line.trim() === '') {
        formattedMessage += '<br>';
      } else {
        formattedMessage += `<div style="margin: 4px 0;">${escapeHtml(line)}</div>`;
      }
    });
    
    messageEl.innerHTML = formattedMessage;
  } else {
    messageEl.textContent = message;
  }

  modal.classList.add('active', 'show');
  
  const okBtn = document.getElementById('alertModalOkBtn');
  if (okBtn) {
    okBtn.onclick = (e) => {
      e.stopPropagation();
      closeAlertModal();
    };
  }
  
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      closeAlertModal();
    };
  }
  
  const handleBackdropClick = (e) => {
    if (e.target === modal) {
      closeAlertModal();
    }
  };
  modal.addEventListener('click', handleBackdropClick);
  window.alertModalBackdropHandler = handleBackdropClick;
  
  const modalContent = modal.querySelector('.modal-content');
  if (modalContent) {
    modalContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
}

function closeAlertModal() {
  const modal = document.getElementById('alertModal');
  modal.classList.remove('active', 'show');
  
  if (window.alertModalBackdropHandler) {
    modal.removeEventListener('click', window.alertModalBackdropHandler);
    delete window.alertModalBackdropHandler;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

const originalAlert = window.alert;
const originalConfirm = window.confirm;

window.alert = function(message) {
  let type = 'info';
  let title = 'Informazione';
  
  const msgLower = message.toLowerCase();
  
  if (message.includes('✅') || msgLower.includes('successo') || msgLower.includes('creato') || 
      msgLower.includes('aggiornato') || msgLower.includes('registrato') || msgLower.includes('salvato')) {
    type = 'success';
    title = 'Successo';
  } else if (message.includes('❌') || msgLower.includes('errore') || msgLower.includes('error')) {
    type = 'error';
    title = 'Errore';
  } else if (message.includes('⚠️') || msgLower.includes('attenzione') || msgLower.includes('warning') ||
             msgLower.includes('compila') || msgLower.includes('obbligatorio') || msgLower.includes('seleziona')) {
    type = 'warning';
    title = 'Attenzione';
  }
  
  showAlertModal(message, title, type);
};

window.confirm = function(message) {
  return showConfirmModal(message, 'Conferma eliminazione');
};

window.showConfirmModal = showConfirmModal;
window.closeConfirmModal = closeConfirmModal;
window.showAlertModal = showAlertModal;
window.closeAlertModal = closeAlertModal;