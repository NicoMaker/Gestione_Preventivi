# Gestione Preventivi

Benvenuto nel sistema di gestione preventivi, uno strumento essenziale per monitorare e gestire clienti, marche, modelli e preventivi.

Questo documento ti guiderà attraverso le funzionalità principali dell'applicazione dal punto di vista dell'utente.

## Accesso al Sistema

### Pagina di Login

- Accedi all'applicazione tramite l'indirizzo fornito.
- Inserisci il tuo **Nome Utente** e la **Password** forniti dall'amministratore.
- Clicca sul pulsante **"Accedi"** per entrare nella dashboard principale.

### Dashboard Principale

Una volta effettuato l'accesso, verrai indirizzato alla dashboard, dove potrai navigare tra le diverse sezioni tramite la **barra laterale**. Il tuo nome utente sarà visibile nella parte inferiore della barra laterale.

## Sezioni e Funzionalità Principali

Il sistema è suddiviso nelle seguenti aree tematiche.

### 1. Clienti

Gestione dell'anagrafica dei clienti.

**Creazione di un nuovo cliente:**
1. Clicca sul bottone **Nuovo Cliente**.
2. Compila i campi obbligatori: **Nome**, **Telefono**, **Email**.
3. Opzionalmente, inserisci la **Data Passaggio** e spunta la casella **Ricontatto Cliente** se necessario.
4. Clicca su **Salva** per confermare.

**Ricerca e filtri:**
- Utilizza la barra di ricerca per cercare un cliente specifico per nome.
- Utilizza il filtro data per visualizzare i clienti in base alla data di passaggio.

**Modifica di un cliente:**
- Clicca sull'icona della matita nella riga del cliente che desideri modificare.
- Aggiorna i dati necessari e clicca su **Salva**.

**Eliminazione di un cliente:**
- Clicca sull'icona del cestino nella riga del cliente da eliminare.
- **Nota:** Un cliente può essere eliminato solo se non ha preventivi associati.

### 2. Marche

Gestione dell'anagrafica delle marche.

**Creazione di una nuova marca:**
1. Clicca sul bottone **Nuova Marca**.
2. Inserisci il **Nome** della marca (deve essere univoco).
3. Clicca su **Salva** per confermare.

**Ricerca:**
- Utilizza la barra di ricerca per cercare una marca specifica.

**Modifica di una marca:**
- Clicca sull'icona della matita per modificare il nome di una marca esistente.

**Eliminazione di una marca:**
- Clicca sull'icona del cestino per eliminare una marca.
- **Nota:** Una marca può essere eliminata solo se nessun modello è collegato ad essa.

### 3. Modelli

Gestione dell'anagrafica dei modelli.

**Creazione di un nuovo modello:**
1. Clicca sul bottone **Nuovo Modello**.
2. Compila i campi obbligatori: **Nome** (deve essere univoco) e **Marca**.
3. Opzionalmente, inserisci una **Descrizione**.
4. Clicca su **Salva** per confermare.

**Ricerca:**
- Utilizza la barra di ricerca per cercare un modello specifico.

**Modifica di un modello:**
- Clicca sull'icona della matita per modificare il nome, la marca o la descrizione di un modello esistente.

**Eliminazione di un modello:**
- Clicca sull'icona del cestino per eliminare un modello.
- **Nota:** Un modello può essere eliminato solo se non ha preventivi associati.

### 4. Preventivi

Questa sezione permette di creare e gestire i preventivi per i clienti.

**Creazione di un nuovo preventivo:**
1. Clicca sul bottone **Nuovo Preventivo**.
2. Compila i campi obbligatori:
   - **Cliente**: Inizia a digitare il nome del cliente e seleziona dalla lista.
   - **Data**: Seleziona la data del preventivo.
   - **Marca**: Inizia a digitare il nome della marca e seleziona dalla lista.
   - **Modello**: Inizia a digitare il nome del modello (filtrato in base alla marca selezionata) e seleziona dalla lista.
   - **Note**: Campo opzionale per annotazioni aggiuntive.
3. Clicca su **Salva** per confermare.

**Ricerca:**
- Utilizza la barra di ricerca per cercare un preventivo specifico.

**Stampa per cliente:**
- Clicca sul pulsante **"Stampa per Cliente"** per aprire la finestra di stampa.
- La stampa mostra tutti i preventivi raggruppati per cliente con i relativi dettagli.

**Modifica di un preventivo:**
- Clicca sull'icona della matita per modificare un preventivo esistente.

**Eliminazione di un preventivo:**
- Clicca sull'icona del cestino per eliminare un preventivo.

### 5. Utenti

Gestione degli account utente (accessibile agli utenti con privilegi amministrativi).

**Creazione di un nuovo utente:**
1. Clicca sul bottone **Nuovo Utente**.
2. Inserisci il **Nome Utente**.
3. Inserisci una **Password forte** (minimo 8 caratteri, almeno una lettera minuscola, una maiuscola e un numero).
4. Clicca su **Salva** per confermare.

**Modifica di un utente:**
- Clicca sull'icona della matita per modificare l'username o la password di un utente esistente.
- **Nota:** Quando modifichi un utente, il campo password è opzionale. Se lasciato vuoto, la password non verrà modificata.

**Eliminazione di un utente:**
- Clicca sull'icona del cestino per eliminare un utente.
- **Nota:** Non è possibile eliminare l'unico utente rimasto nel sistema.
- **Attenzione:** Se modifichi o elimini il nome utente con il quale sei attualmente connesso, il sistema ti disconnetterà automaticamente.

## Esci

Per uscire dal sistema in modo sicuro, clicca sul pulsante **"Esci"** nella barra laterale.


