# 🎪 EventFlow

**Plataforma #1 de Eventos em Moçambique** — Trabalho Semestral de Tecnologia de Internet  
UCM · 3.º Ano · 2025/2026

---

## Estrutura do Projeto

```
t.semestral/
├── frontend/               ← Aplicação web (client-side)
│   ├── html/               ← 17 páginas HTML
│   ├── css/                ← 16 folhas de estilo
│   ├── js/                 ← 16 scripts JavaScript + api.js
│   └── assets/
│       ├── images/         ← Imagens de eventos/organizadores
│       └── icons/          ← Favicon e ícones
│
├── backend/                ← API REST (Node.js + Express)
│   ├── config/
│   │   └── database.js     ← Schema SQLite + conexão
│   ├── middleware/
│   │   ├── auth.js         ← Verificação JWT
│   │   └── roles.js        ← Controlo de acesso por papel
│   ├── routes/             ← 9 grupos de endpoints
│   │   ├── auth.js         ← Autenticação (register, login, /me)
│   │   ├── events.js       ← CRUD de eventos + filtros
│   │   ├── tickets.js      ← Compra e gestão de bilhetes
│   │   ├── users.js        ← Perfil e histórico
│   │   ├── notifications.js← Centro de notificações
│   │   ├── favorites.js    ← Favoritos
│   │   ├── reviews.js      ← Avaliações
│   │   ├── organizer.js    ← Dashboard do organizador
│   │   └── admin.js        ← Painel de administração
│   ├── uploads/            ← Imagens carregadas pelos utilizadores
│   ├── server.js           ← Ponto de entrada do servidor
│   ├── seed.js             ← Dados de demonstração
│   └── package.json
│
├── .gitignore
├── .env.example            ← Template de variáveis de ambiente
└── README.md               ← Este ficheiro
```

---

## Instalação e Arranque

### Pré-requisitos
- [Node.js](https://nodejs.org/) v18 ou superior

### 1. Instalar dependências
```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente
```bash
# Na raiz do projeto:
cp .env.example .env
# Edita .env com os teus valores
```

### 3. Popular a base de dados com dados de demonstração
```bash
cd backend
npm run seed
```

### 4. Arrancar o servidor
```bash
# Produção
npm start

# Desenvolvimento (reinicia ao guardar)
npm run dev
```

O servidor arranca em **http://localhost:3000**  
A homepage é servida em **http://localhost:3000/html/eventflow_homepage.html**

---

## Páginas do Frontend

| Página | Ficheiro |
|--------|----------|
| Splash Screen | `html/eventflow_splash_screen.html` |
| Login / Registo | `html/eventflow_login_register.html` |
| Homepage | `html/eventflow_homepage.html` |
| Listagem de Eventos | `html/eventflow_events.html` |
| Detalhe de Evento + Checkout | `html/eventflow_event_detail_checkout.html` |
| Categorias | `html/eventflow_categories.html` |
| Organizadores | `html/eventflow_organizers.html` |
| Perfil do Utilizador | `html/eventflow_profile.html` |
| Dashboard do Organizador | `html/eventflow_organizer_dashboard.html` |
| Criar Evento | `html/eventflow_create_event.html` |
| Dashboard Admin | `html/eventflow_admin_dashboard.html` |
| Notificações | `html/eventflow_notifications.html` |
| Recuperar Password | `html/eventflow_forgot_password.html` |
| Sobre | `html/eventflow_about.html` |
| Termos de Serviço | `html/eventflow_terms.html` |
| Política de Privacidade | `html/eventflow_privacy.html` |

---

## API — Endpoints Principais

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/register` | Criar conta | Público |
| POST | `/api/auth/login` | Login → JWT | Público |
| GET | `/api/auth/me` | Utilizador autenticado | JWT |
| GET | `/api/events` | Listar eventos (filtros, paginação) | Público |
| GET | `/api/events/:id` | Detalhe completo do evento | Público |
| POST | `/api/events` | Criar evento | Organizer/Admin |
| PUT | `/api/events/:id` | Editar evento | Organizer/Admin |
| POST | `/api/tickets/purchase` | Comprar bilhete (transação atómica) | JWT |
| GET | `/api/tickets/my` | Os meus bilhetes | JWT |
| GET | `/api/notifications` | Notificações | JWT |
| GET | `/api/favorites` | Favoritos | JWT |
| POST | `/api/favorites/:id` | Adicionar favorito | JWT |
| GET | `/api/organizer/stats` | KPIs do organizador | Organizer |
| GET | `/api/admin/stats` | Estatísticas globais | Admin |

Ver [backend/README.md](backend/README.md) para a lista completa.

---

## Contas de Demonstração

| Papel | Email | Password |
|-------|-------|----------|
| 👑 Admin | admin@eventflow.co.mz | admin123 |
| 🎟️ Utilizador | carlos.fumo@email.com | user123 |
| 🎪 Organizador | info@mozambiquelive.co.mz | org123 |

---

## Tecnologias

**Frontend**
- HTML5, CSS3, JavaScript (ES6+) — Vanilla, sem frameworks
- Fontes: Bebas Neue + Outfit (Google Fonts)
- Design: Dark theme com gradients animados

**Backend**
- Node.js + Express.js
- SQLite (`better-sqlite3`) — base de dados em ficheiro único
- JWT (`jsonwebtoken`) — autenticação stateless
- bcryptjs — hash de passwords

---

## Fluxos de Utilizador

```
Splash → Login/Registo → Homepage → Eventos → Detalhe → Checkout → Perfil
                    ↓
              [Organizador] → Dashboard Org → Criar Evento
                    ↓
                [Admin] → Dashboard Admin → Gerir Tudo
```
