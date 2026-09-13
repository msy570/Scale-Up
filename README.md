# Scale Up — V0

Prototype jouable d'un roguelike de startup.

## Jouer localement

Le projet est volontairement sans build pour cette première version.

1. Clone le dépôt.
2. Ouvre `index.html` dans ton navigateur.

Tu peux aussi lancer un petit serveur local :

```bash
python -m http.server 8000
```

Puis ouvre `http://localhost:8000`.

## Boucle actuelle

- départ avec 1 000 € ;
- événements à choix ;
- cash, utilisateurs, réputation et valorisation ;
- faillite si le cash passe sous 0 ou si la réputation tombe à 0 ;
- victoire à 1 M€ de valorisation ;
- journal des décisions ;
- interface responsive mobile.

## Objectif de la V0

Tester uniquement une chose : est-ce que les décisions donnent envie de relancer une partie ?

Les prochaines itérations pourront ajouter des événements conditionnels, des builds, des employés, des revenus récurrents, des événements rares et un vrai système de score.
