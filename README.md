1. Descrierea tehnologiilor folosite și modul lor de integrare: 

Aplicația AE-BDSA este o platformă web pentru cumpararea zborurilor, realizată în arhitectură client–server.
Proiectul este împărțit în două părți principale:

Backend (server) – construit în Node.js + Express + Sequelize + SQLite

Frontend (client) – construit în React + Vite + Redux Toolkit 

   Backend

Node.js – mediu de execuție JavaScript pentru server.

Express.js – framework minimal pentru crearea rutelor REST API.

Sequelize ORM – interfață între Node.js și baza de date (SQLite).

SQLite3 – bază de date locală, rapidă și ușor de gestionat.

JWT (jsonwebtoken) – autentificare prin token.

bcrypt – criptarea parolelor utilizatorilor.

dotenv – configurarea variabilelor de mediu (TOKEN_SECRET, PORT etc.).

morgan – logger HTTP pentru debugging.

cors – permite comunicarea dintre frontend și backend.

nodemon – repornește automat serverul la modificări.

  Frontend

React.js – framework pentru construirea interfeței utilizator.

Vite – builder modern și rapid pentru aplicații React.



Redux Toolkit – gestionarea stării aplicației (autentificare, utilizator).

Redux Persist – persistă datele Redux în localStorage.

React Router DOM – navigare între pagini fără reîncărcare completă.

Fetch API – comunicare între client și server.

   Integrarea componentelor

Fluxul aplicației:

Utilizatorul se autentifică sau își creează cont în aplicație (prin /auth/login sau /auth/register).

Datele sunt trimise către backend (Express) și salvate în baza de date SQLite prin Sequelize.

Parola este criptată cu bcrypt, iar utilizatorul primește un token JWT.

Tokenul este stocat în localStorage, asigurând sesiunea activă.

Utilizatorul introduce destinația si data sau  în formularul de căutare.

Frontend-ul trimite cererea către backend (/flights/search).

Backend-ul apelează API-ul extern de zboruri (RapidAPI) folosind fetch, trimite parametrii primiți și primește lista zborurilor disponibile.

Rezultatele sunt afișate în React, iar zborurile se adauga în baza de date locală pentru consultări ulterioare.

Utilizatorul poate adăuga un zbor în coș (/cart) sau plasa o comandă (/bookings).

Aceste informații sunt salvate în baza de date și pot fi vizualizate ulterior în paginile „Coșul meu” sau „Comenzile mele”.

User normal: poate căuta zboruri, adăuga în coș, vizualiza și plasa comenzi.

Admin: are drepturi suplimentare pentru a modifica informațiile despre utilizatori și zboruri (CRUD complet).

Rolul este stabilit în baza de date și validat prin middleware-ul verifyToken.


2. Instrucțiuni de pornire a proiectului

Deschidere a terminalului în folderul server/.
Rulare npm run dev.

Deschidere a terminalului în folderul client/.
Rulare npm run dev.

