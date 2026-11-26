# FoodExpress

## Démarrage local

Dans un premier terminal, démarrez l’API :

```powershell
cd ..\backend
npm install
npm run dev
```

Dans un second terminal, démarrez Angular :

```powershell
npm install
npm start
```

L’application est disponible sur `http://127.0.0.1:4200/` et l’API sur `http://localhost:3000/`.

## Photos des restaurants et des plats

Un administrateur peut importer la photo d’un restaurant depuis **Administration > Restaurants**. Un restaurateur peut importer la photo de son restaurant et de ses plats depuis **Gestion > Plats**.

Les formats JPEG, PNG et WEBP sont acceptés jusqu’à 5 Mo. Les fichiers sont stockés dans `backend/uploads/`; le champ `image` de MongoDB contient leur chemin public. Le dossier est ignoré par Git afin de ne pas versionner les photos téléversées.

## Compilation

```powershell
npm run build
```
