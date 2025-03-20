# Modèle de données refactorisé - Système de gestion de dépenses

## 1. Table Users

| Champ           | Type                                | Justification                                                    |
| --------------- | ----------------------------------- | ---------------------------------------------------------------- |
| `user_id`       | SERIAL PRIMARY KEY                  | Identifiant auto-incrémenté pour garantir l'unicité.             |
| `email`         | VARCHAR(100) NOT NULL UNIQUE        | Contrainte d'unicité pour éviter les doublons d'utilisateurs.    |
| `password_hash` | VARCHAR(255) NOT NULL               | Dimensionné pour les algorithmes de hachage modernes.            |
| `created_at`    | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Permet le suivi des modifications.                               |
| `updated_at`    | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Permet le suivi des modifications.                               |
| `is_active`     | BOOLEAN DEFAULT TRUE                | Permet la désactivation temporaire d'un compte sans suppression. |

## 2. Table Tags

| Champ        | Type                                | Justification                                                                                                                   |
| ------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `tag_id`     | SERIAL PRIMARY KEY                  | Identifiant unique pour chaque tag.                                                                                             |
| `code`       | VARCHAR(20) UNIQUE NOT NULL         | Identifiant métier unique facilitant l'intégration.                                                                             |
| `name`       | VARCHAR(50) NOT NULL                | Nom du tag affiché à l'utilisateur.                                                                                             |
| `color`      | VARCHAR(20)                         | Support de la personnalisation visuelle.                                                                                        |
| `icon`       | VARCHAR(50)                         | Support de la personnalisation visuelle.                                                                                        |
| `created_by` | INTEGER REFERENCES Users(user_id)   | Référence vers l'utilisateur créateur, NULL pour les tags système.                                                              |
| `is_system`  | BOOLEAN NOT NULL                    | Différencie les tags prédéfinis (TRUE) des tags personnalisés (FALSE). Pas de valeur par défaut pour forcer un choix explicite. |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Horodatage de création.                                                                                                         |
| `updated_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Horodatage de dernière modification.                                                                                            |

## 3. Table UserFavoriteTags

| Champ        | Type                                                | Justification                                                                    |
| ------------ | --------------------------------------------------- | -------------------------------------------------------------------------------- |
| `user_id`    | INTEGER REFERENCES Users(user_id) ON DELETE CASCADE | Identifiant de l'utilisateur.                                                    |
| `tag_id`     | INTEGER REFERENCES Tags(tag_id) ON DELETE CASCADE   | Identifiant du tag favori.                                                       |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                 | Date d'ajout aux favoris, utile pour analyses.                                   |
| PRIMARY KEY  | (user_id, tag_id)                                   | Assure qu'un utilisateur ne peut ajouter un tag qu'une seule fois à ses favoris. |

## 4. Table Expenses

| Champ                | Type                                                         | Justification                                                                   |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `expense_id`         | SERIAL PRIMARY KEY                                           | Identifiant unique de la dépense.                                               |
| `user_id`            | INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE | Identifiant de l'utilisateur propriétaire.                                      |
| `amount`             | DECIMAL(10,2) NOT NULL CHECK (amount > 0)                    | Type numérique précis pour les valeurs monétaires.                              |
| `expense_date`       | DATE NOT NULL                                                | Date de la dépense (peut différer de la date d'enregistrement).                 |
| `description`        | VARCHAR(255)                                                 | Description de la dépense.                                                      |
| `default_tag_id`     | INTEGER NOT NULL REFERENCES Tags(tag_id)                     | Tag par défaut suggéré par le système.                                          |
| `user_tag_id`        | INTEGER REFERENCES Tags(tag_id)                              | Tag choisi par l'utilisateur (NULL si l'utilisateur accepte le tag par défaut). |
| `payment_method`     | VARCHAR(50)                                                  | Méthode de paiement pour analyses et réconciliation.                            |
| `is_recurring`       | BOOLEAN DEFAULT FALSE                                        | Indicateur pour les dépenses régulières.                                        |
| `receipt_image_path` | VARCHAR(255)                                                 | Chemin vers la pièce justificative.                                             |
| `created_at`         | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                          | Horodatage de création.                                                         |
| `updated_at`         | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                          | Horodatage de dernière modification.                                            |

## 5. Index et optimisations

| Index                            | Justification                                                              |
| -------------------------------- | -------------------------------------------------------------------------- |
| `idx_expenses_user_id`           | Optimise les requêtes filtrant par utilisateur.                            |
| `idx_expenses_date`              | Accélère les recherches et rapports par période.                           |
| `idx_expenses_default_tag_id`    | Améliore les performances pour les requêtes basées sur le tag par défaut.  |
| `idx_expenses_user_tag_id`       | Améliore les performances pour les requêtes basées sur le tag utilisateur. |
| `idx_user_favorite_tags_user_id` | Optimise la récupération des tags favoris d'un utilisateur.                |

## 6. Contraintes et validation

| Contrainte                     | Justification                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `tags_system_tag_check`        | Assure qu'un tag système (`is_system=TRUE`) a toujours `created_by=NULL`.         |
| `expenses_tag_coherence_check` | Vérifie que le tag utilisateur est différent du tag par défaut s'il est spécifié. |
