# FlowLance

CRM intelligent conçu pour les freelances. Centralise clients, projets
et factures en un seul outil avec des rappels automatiques.

## Stack technique

- **Frontend** : React 18 + Vite + React Router
- **Backend** : Django 5 + Django REST Framework
- **Auth** : JWT (SimpleJWT)
- **Base de données** : SQLite (dev) / PostgreSQL (prod)

## Fonctionnalités

- Authentification sécurisée (register / login / JWT)
- Gestion complète des clients (CRUD)
- Gestion des projets avec statuts (lead → en cours → terminé)
- Facturation avec numérotation automatique (FAC-2024-001)
- Dashboard avec chiffre d'affaires en temps réel
- Rappels intelligents : factures en retard, clients inactifs

## Installation locale

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur http://localhost:5173

## Organisation

Projet réalisé avec Git (versioning) et Trello (gestion des tâches).
