-- Pour exécuter ce script, connectez-vous d'abord à une base de données autre que 'tag_life'
-- Par exemple: psql -d postgres -f destroy_db.sql

-- Fermer toutes les connexions actives à la base de données tag_life
/* SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'tag_life'
AND pid <> pg_backend_pid(); */

-- Supprimer la base de données
DROP DATABASE IF EXISTS tag_life;