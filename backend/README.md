# EventFlow — Backend API

## Instalação e arranque

```bash
cd backend
npm install
npm run seed      # popula a BD com dados de demonstração
npm start         # arranca o servidor em http://localhost:3000
# ou em dev:
npm run dev       # reinicia automaticamente ao editar ficheiros
```

## Contas de demonstração

| Papel       | Email                            | Password |
|-------------|----------------------------------|----------|
| Admin       | admin@eventflow.co.mz            | admin123 |
| Utilizador  | carlos.fumo@email.com            | user123  |
| Organizador | info@mozambiquelive.co.mz        | org123   |

## Endpoints principais

| Método | Rota                        | Descrição                        | Auth     |
|--------|-----------------------------|----------------------------------|----------|
| POST   | /api/auth/register          | Criar conta                      | Público  |
| POST   | /api/auth/login             | Login → devolve JWT              | Público  |
| GET    | /api/auth/me                | Dados do utilizador autenticado  | JWT      |
| GET    | /api/events                 | Listar eventos (filtros: q, cat, city, free, sort, page) | Público |
| GET    | /api/events/:id             | Detalhe de evento + reviews      | Público  |
| POST   | /api/events                 | Criar evento                     | Organizer/Admin |
| PUT    | /api/events/:id             | Editar evento                    | Organizer/Admin |
| DELETE | /api/events/:id             | Eliminar evento                  | Organizer/Admin |
| POST   | /api/tickets/purchase       | Comprar bilhete                  | JWT      |
| GET    | /api/tickets/my             | Os meus bilhetes                 | JWT      |
| GET    | /api/users/me/stats         | Estatísticas do perfil           | JWT      |
| PUT    | /api/users/me               | Atualizar perfil                 | JWT      |
| GET    | /api/users/me/history       | Histórico de compras             | JWT      |
| GET    | /api/notifications          | Listar notificações              | JWT      |
| PATCH  | /api/notifications/read-all | Marcar todas como lidas          | JWT      |
| GET    | /api/favorites              | Eventos favoritos                | JWT      |
| POST   | /api/favorites/:eventId     | Adicionar favorito               | JWT      |
| DELETE | /api/favorites/:eventId     | Remover favorito                 | JWT      |
| POST   | /api/reviews                | Submeter avaliação               | JWT      |
| GET    | /api/organizer/stats        | KPIs do organizador              | Organizer |
| GET    | /api/organizer/events       | Eventos do organizador           | Organizer |
| GET    | /api/admin/stats            | Estatísticas globais             | Admin    |
| GET    | /api/admin/users            | Gerir utilizadores               | Admin    |
| PATCH  | /api/admin/events/:id/approve | Aprovar evento               | Admin    |

## Autenticação

Todas as rotas protegidas requerem o header:
```
Authorization: Bearer <token>
```

O token é devolvido no login/register e válido por 7 dias.

## Base de dados

SQLite em `backend/eventflow.db` (criado automaticamente no primeiro arranque).
Para reiniciar os dados: `npm run seed`
