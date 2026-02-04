# **Strategischer Architektur-Bericht: Modernisierung des Hubs-Ökosystems**

Datum: 24\. Oktober 2025  
Thema: Rewrite-Strategie für Reticulum, Hubs und Spoke  
Zielsetzung: Performance, Skalierbarkeit und Zukunftssicherheit unter Beibehaltung der Web-Kompatibilität.

## **1\. Executive Summary**

Das Alleinstellungsmerkmal (USP) des Hubs-Ökosystems ist seine Barrierefreiheit: High-Fidelity-Social-VR direkt im Browser, ohne Installationshürden. Ein Rewrite, der diese Eigenschaft opfert (z. B. durch reine Native-Clients), wird als strategischer Fehler bewertet.

Dieser Bericht empfiehlt eine **hybride Modernisierungsstrategie**:

* **Frontend (Hubs & Spoke UI):** TypeScript mit React Three Fiber (R3F) für maximale Entwicklergeschwindigkeit und Modularität.  
* **Backend & Infrastruktur (Reticulum & Spoke Core):** Rust für kompromisslose Performance, Concurrency und Speichersicherheit.

Diese Kombination adressiert die aktuellen Engpässe (Rendering-Performance, Server-Last, Speicherverbrauch) und bereitet die Plattform auf kommende Web-Standards (WebGPU, WebTransport) vor.

## **2\. Analyse des Status Quo & Problemdarstellung**

Die aktuelle Architektur leidet unter technischer Schuld und Limitierungen der ursprünglichen Technologiewahl.

| Komponente | Aktueller Stack | Identifizierte Probleme |
| :---- | :---- | :---- |
| **Hubs (Client)** | A-Frame, Legacy JS | **Abstraktions-Overhead:** A-Frame ist hervorragend für Prototyping, skaliert aber schlecht bei komplexen Szenen. DOM-Manipulationen für 3D-Objekte kosten Performance. |
| **Reticulum (Backend)** | Node.js (Elixir/Python Reste) | **Single-Threaded Bottleneck:** Die Node.js Event-Loop blockiert bei hoher Last. WebRTC-Signaling und State-Synchronisation erzeugen "Garbage Collection Pauses", die zu Lags führen. |
| **Spoke (Editor)** | Electron, React | **Ressourcenhunger:** Electron bringt eine komplette Chromium-Instanz mit. Dies führt zu riesigen Binaries (\>200MB) und hohem RAM-Verbrauch, selbst bei einfachen Szenen. |

## **3\. Zielarchitektur: Der "Performance-Hybrid" Stack**

Wir schlagen einen Wechsel zu einem typisierten, kompilierten und modularen Ansatz vor.

### **A. Hubs Client: TypeScript & React Three Fiber**

Der Client verbleibt im Web-Ökosystem, wird aber professionalisiert.

* **Sprache:** **TypeScript**. Strikte Typisierung ist unverzichtbar für die Wartbarkeit einer komplexen 3D-Engine.  
* **Framework:** Wechsel von A-Frame zu **React Three Fiber (R3F)**.  
  * *Warum?* R3F erlaubt deklarativen Code (wie A-Frame), nutzt aber Reacts effizienten Reconciler direkt auf dem Three.js Szenengraphen, ohne den DOM zu belasten.  
* **Rendering:** Vorbereitung auf **WebGPU**.  
  * Der Wechsel von WebGL zu WebGPU wird die Zeichenleistung drastisch erhöhen (Compute Shaders, bessere API). Ein moderner Stack (Three.js r160+) ist hierfür Voraussetzung.

### **B. Reticulum Backend: Rust Microservices**

Das Rückgrat der Plattform muss extrem effizient sein.

* **Sprache:** **Rust**.  
* **Vorteile:**  
  * **Memory Safety ohne GC:** Keine unvorhersehbaren Pausen durch Garbage Collection – kritisch für Echtzeit-VR.  
  * **Concurrency:** Mit tokio oder actix können Tausende gleichzeitige WebSocket/WebTransport-Verbindungen auf minimaler Hardware gehalten werden.  
* **Architektur:** Aufbrechen des Monolithen in spezialisierte Services (Auth, Spatial Audio Processing, Physics, Presence).

### **C. Spoke Editor: Rust & Tauri**

Der Editor wird leichter, schneller und sicherer.

* **Framework:** **Tauri** statt Electron.  
* **Funktionsweise:** Tauri nutzt den nativen Webview des Betriebssystems (WebView2 unter Windows, WebKit unter macOS/Linux). Das Backend läuft in Rust.  
* **Ergebnis:** Die App-Größe sinkt von ca. 200 MB auf \<20 MB. Der Startvorgang ist fast instantan. Die UI bleibt in React/TypeScript, was Code-Sharing mit dem Hubs-Client ermöglicht.

### **D. Netzwerk-Layer: WebTransport**

* **Aktuell:** WebSockets & UDP Patches.  
* **Neu:** **WebTransport** & **gRPC**.  
  * WebTransport bietet Low-Latency-Kommunikation über HTTP/3 und ist der moderne Nachfolger für Gaming-Netzwerkverkehr im Browser.

## **4\. Szenario-Vergleich**

Warum genau diese Kombination? Ein Vergleich mit Alternativen.

### **Szenario 1: Der empfohlene "Performance-Hybrid" (Rust \+ TS)**

* **Backend:** Rust  
* **Frontend:** TypeScript  
* **Bewertung:** **Optimal.** Nutzt die Stärken beider Welten. Rust für rohe Rechenleistung, TypeScript für flexible UI-Entwicklung.  
* **Risiko:** Lernkurve für Rust im Backend-Team.

### **Szenario 2: Der "Web-Purist" (Fullstack TS)**

* **Backend:** Node.js (oder Bun/Deno)  
* **Frontend:** TypeScript  
* **Bewertung:** **Konservativ.** Einfacheres Staffing, da nur eine Sprache benötigt wird. Performance-Probleme im Backend (Single Threading) bleiben jedoch bestehen, auch wenn Runtimes wie Bun dies abmildern.

### **Szenario 3: Der "Konsequente Wechsel" (Full Rust / Wasm)**

* **Backend:** Rust  
* **Frontend:** Rust (kompiliert zu WebAssembly via Frameworks wie Leptos/Yew)  
* **Bewertung:** **Risikoreich.** Die DOM-Interaktion in Wasm ist noch umständlich. UI-Entwicklung in Rust ist langsamer als in React. Das Ökosystem für 3D im Web (Three.js) ist primär JS/TS-fokussiert.

## **5\. Migrationsstrategie**

Ein "Big Bang" Rewrite ist riskant. Wir empfehlen das **"Strangler Fig" Pattern**:

1. **Phase 1 (Infrastruktur):** Implementierung eines WebTransport-Gateways in Rust, das vor dem alten Node.js Server sitzt. Schrittweises Ersetzen von "heißen" Pfaden (z.B. Positions-Updates) durch Rust-Services.  
2. **Phase 2 (Editor):** Portierung von Spoke auf Tauri. Da die UI (React) weitgehend wiederverwendet werden kann, ist dies ein "Low Hanging Fruit" für schnelle Performance-Gewinne.  
3. **Phase 3 (Client Core):** Aufbau eines neuen "Core"-Renderers in R3F/TypeScript. Koexistenz mit dem alten Client über Feature-Flags, bis Parität erreicht ist.

## **6\. Fazit**

Der "Sweet Spot" für die nächste Generation von Hubs ist die Kombination aus einem modularen **TypeScript-Frontend** (um das Web-Ökosystem nicht zu verlieren) und einem Hochleistungs-**Rust-Backend**. Dies sichert die Wettbewerbsfähigkeit in Bezug auf Performance, ohne den strategischen Vorteil der Browser-Lauffähigkeit aufzugeben.