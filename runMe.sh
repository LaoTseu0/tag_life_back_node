#!/bin/bash

# Couleurs pour le texte
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages avec un style cohérent
print_message() {
    echo -e "${BLUE}===========================================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${BLUE}===========================================================${NC}"
}

# Vérifier si Docker est en cours d'exécution
if ! docker info > /dev/null 2>&1; then
    print_message "⚠️  Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop."
    exit 1
fi

# Options du menu
start_postgres() {
    print_message "🚀 Démarrage de PostgreSQL..."
    docker-compose up -d
    if [ $? -eq 0 ]; then
        print_message "✅ PostgreSQL est maintenant disponible sur localhost:5432\n   Utilisateur: postgres\n   Base de données: dev_database"
    else
        print_message "❌ Erreur lors du démarrage de PostgreSQL."
    fi
}

stop_postgres() {
    print_message "🛑 Arrêt de PostgreSQL..."
    docker-compose down
    if [ $? -eq 0 ]; then
        print_message "✅ PostgreSQL a été arrêté avec succès."
    else
        print_message "❌ Erreur lors de l'arrêt de PostgreSQL."
    fi
}

restart_postgres() {
    print_message "🔄 Redémarrage de PostgreSQL..."
    docker-compose restart
    if [ $? -eq 0 ]; then
        print_message "✅ PostgreSQL a été redémarré avec succès."
    else
        print_message "❌ Erreur lors du redémarrage de PostgreSQL."
    fi
}

view_logs() {
    print_message "📋 Affichage des logs de PostgreSQL..."
    docker-compose logs
    echo ""
    read -p "Appuyez sur Entrée pour revenir au menu..."
}

check_status() {
    print_message "📊 Statut de PostgreSQL..."
    if docker-compose ps | grep -q "postgres-dev"; then
        echo -e "${GREEN}PostgreSQL est en cours d'exécution${NC}"
        docker-compose ps
    else
        echo -e "${RED}PostgreSQL n'est pas en cours d'exécution${NC}"
    fi
    echo ""
    read -p "Appuyez sur Entrée pour revenir au menu..."
}

# Menu principal
show_menu() {
    clear
    print_message "🐘 Gestionnaire PostgreSQL Docker"
    echo "1) Démarrer PostgreSQL"
    echo "2) Arrêter PostgreSQL"
    echo "3) Redémarrer PostgreSQL"
    echo "4) Voir les logs"
    echo "5) Vérifier le statut"
    echo "0) Quitter"
    echo ""
    read -p "Choisissez une option [0-5]: " choice
    echo ""

    case $choice in
        1) start_postgres ;;
        2) stop_postgres ;;
        3) restart_postgres ;;
        4) view_logs ;;
        5) check_status ;;
        0) exit 0 ;;
        *) print_message "⚠️  Option invalide. Veuillez réessayer." ;;
    esac

    echo ""
    read -p "Appuyez sur Entrée pour continuer..."
    show_menu
}

# Démarrer le menu
cd "$(dirname "$0")"  # Se positionner dans le répertoire du script
show_menu