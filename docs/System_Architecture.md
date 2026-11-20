# System Architecture
## CareConnect360 – VirtualCare Telemedicine Platform

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React.js + Vite)"]
        UI["React SPA & Bootstrap 5 UI"]
        AuthCtx["AuthContext & JWT Storage"]
        AxiosClient["Axios Interceptor (Bearer Token)"]
        Jitsi["Jitsi Meet WebRTC IFrame"]
    end

    subgraph API_Gateway["Django Backend (REST APIs)"]
        JWTAuth["SimpleJWT Authentication & Permissions"]
        AccApp["Accounts Module (Auth & Profiles)"]
        ApptApp["Appointments Module (Booking & Jitsi)"]
        RxApp["Prescriptions Module (E-Prescriptions)"]
        CommApp["Communication Module (Messaging)"]
        BillApp["Billing Module (Invoicing & Checkout)"]
    end

    subgraph Database["MySQL 8.0 Storage"]
        DB[(careconnect360_db)]
    end

    subgraph VideoProvider["Video Conferencing Gateway"]
        JitsiServer["meet.jit.si (Encrypted WebRTC)"]
    end

    UI --> AuthCtx
    UI --> AxiosClient
    UI --> Jitsi
    Jitsi <--> JitsiServer

    AxiosClient --> JWTAuth
    JWTAuth --> AccApp
    JWTAuth --> ApptApp
    JWTAuth --> RxApp
    JWTAuth --> CommApp
    JWTAuth --> BillApp

    AccApp --> DB
    ApptApp --> DB
    RxApp --> DB
    CommApp --> DB
    BillApp --> DB
```

### Architectural Principles:
1. **Separation of Concerns:** Independent Django apps (`accounts`, `appointments`, `prescriptions`, `communication`, `billing`) handle distinct domain boundaries.
2. **Stateless API Services:** Django REST Framework endpoints utilize stateless JWT Bearer authorization.
3. **Decoupled Video Layer:** Video streams do not choke application bandwidth; authenticated tokens pass encrypted room identifiers to the Jitsi WebRTC gateway.
