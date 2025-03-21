-- Script de création de la base de données pour un système de gestion de dépenses avec support des factures
-- Compatible avec PostgreSQL

-- Table Users
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table Tags
CREATE TABLE Tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20),
    created_by INTEGER REFERENCES Users(user_id),
    is_system BOOLEAN NOT NULL, -- Pas de valeur par défaut pour forcer un choix explicite
    is_active BOOLEAN DEFAULT TRUE, -- Permet de désactiver un tag au lieu de le supprimer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Contrainte: un tag système ne doit pas avoir de créateur
    CONSTRAINT tags_system_tag_check CHECK (
        (is_system = TRUE AND created_by IS NULL) OR
        (is_system = FALSE AND created_by IS NOT NULL)
    ),
    -- Contrainte: un tag système doit toujours être actif
    CONSTRAINT tags_system_always_active CHECK (
        is_system = FALSE OR is_active = TRUE
    )
);

-- Table UserFavoriteTags
CREATE TABLE UserFavoriteTags (
    user_id INTEGER REFERENCES Users(user_id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES Tags(tag_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, tag_id)
);

-- NOUVELLE TABLE: Invoices (Factures)
CREATE TABLE Invoices (
    invoice_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    vendor_name VARCHAR(255),
    invoice_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    receipt_image_path VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Expenses (modifiée pour inclure la référence à Invoice)
CREATE TABLE Expenses (
    expense_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    invoice_id INTEGER REFERENCES Invoices(invoice_id) ON DELETE CASCADE, -- NOUVEAU: référence à la facture
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL,
    description VARCHAR(255),
    default_tag_id INTEGER NOT NULL REFERENCES Tags(tag_id) ON DELETE RESTRICT,
    user_tag_id INTEGER REFERENCES Tags(tag_id) ON DELETE RESTRICT,
    is_recurring BOOLEAN DEFAULT FALSE,
    receipt_image_path VARCHAR(255), -- Peut être NULL si la dépense fait partie d'une facture
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Contrainte: si user_tag_id est spécifié, il doit être différent de default_tag_id
    CONSTRAINT expenses_tag_coherence_check CHECK (
        user_tag_id IS NULL OR user_tag_id <> default_tag_id
    ),
    -- NOUVELLE CONTRAINTE: si invoice_id est spécifié, certains champs utilisent les valeurs de la facture
    CONSTRAINT expenses_invoice_coherence_check CHECK (
        (invoice_id IS NULL) OR 
        (invoice_id IS NOT NULL AND receipt_image_path IS NULL)
    )
);

-- Création des index pour optimiser les performances
CREATE INDEX idx_expenses_user_id ON Expenses(user_id);
CREATE INDEX idx_expenses_date ON Expenses(expense_date);
CREATE INDEX idx_expenses_default_tag_id ON Expenses(default_tag_id);
CREATE INDEX idx_expenses_user_tag_id ON Expenses(user_tag_id);
CREATE INDEX idx_user_favorite_tags_user_id ON UserFavoriteTags(user_id);
CREATE INDEX idx_tags_is_active ON Tags(is_active);
-- NOUVEAUX INDEX
CREATE INDEX idx_expenses_invoice_id ON Expenses(invoice_id);
CREATE INDEX idx_invoices_user_id ON Invoices(user_id);
CREATE INDEX idx_invoices_date ON Invoices(invoice_date);

-- Fonction pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour la mise à jour automatique des champs updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON Users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON Tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON Expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- NOUVEAU TRIGGER
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON Invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour vérifier qu'un user_tag_id fait référence à un tag accessible et actif
CREATE OR REPLACE FUNCTION check_user_tag_access()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_tag_id IS NOT NULL THEN
        -- Vérifie si le tag est un tag système ou appartient à l'utilisateur et est actif
        IF NOT EXISTS (
            SELECT 1 FROM Tags 
            WHERE tag_id = NEW.user_tag_id 
              AND (is_system = TRUE OR created_by = NEW.user_id)
              AND is_active = TRUE
        ) THEN
            RAISE EXCEPTION 'L''utilisateur n''a pas accès à ce tag ou le tag est inactif';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expenses_user_tag_access_check BEFORE INSERT OR UPDATE ON Expenses
    FOR EACH ROW EXECUTE FUNCTION check_user_tag_access();

-- Fonction pour la "suppression logique" d'un tag
CREATE OR REPLACE FUNCTION deactivate_tag()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si c'est un tag système
    IF OLD.is_system = TRUE THEN
        RAISE EXCEPTION 'Les tags système ne peuvent pas être désactivés';
    END IF;
    
    -- Au lieu de supprimer le tag, on le désactive
    UPDATE Tags SET is_active = FALSE WHERE tag_id = OLD.tag_id;
    
    -- Empêcher la suppression physique
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour intercepter la suppression d'un tag et le désactiver à la place
CREATE TRIGGER tag_delete_trigger
BEFORE DELETE ON Tags
FOR EACH ROW
WHEN (OLD.is_system = FALSE)
EXECUTE FUNCTION deactivate_tag();

-- La fonction et le trigger de synchronisation de date ont été supprimés
-- car nous gardons uniquement la date de création de la facture/dépense

-- NOUVELLE FONCTION: Mettre à jour le montant total de la facture
CREATE OR REPLACE FUNCTION update_invoice_total_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        -- Mise à jour du montant total après modification/suppression
        UPDATE Invoices
        SET total_amount = (
            SELECT COALESCE(SUM(amount), 0)
            FROM Expenses
            WHERE invoice_id = OLD.invoice_id
        )
        WHERE invoice_id = OLD.invoice_id;
    END IF;
    
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Mise à jour du montant total après ajout/modification
        UPDATE Invoices
        SET total_amount = (
            SELECT COALESCE(SUM(amount), 0)
            FROM Expenses
            WHERE invoice_id = NEW.invoice_id
        )
        WHERE invoice_id = NEW.invoice_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- NOUVEAU TRIGGER: Mettre à jour le montant total de la facture
CREATE TRIGGER update_invoice_total_trigger
AFTER INSERT OR UPDATE OR DELETE ON Expenses
FOR EACH ROW
WHEN (OLD.invoice_id IS NOT NULL OR NEW.invoice_id IS NOT NULL)
EXECUTE FUNCTION update_invoice_total_amount();

-- Insertion des tags système par défaut
INSERT INTO Tags (name, color, is_system) VALUES
('Alimentation', '#4CAF50', TRUE),
('Logement', '#2196F3', TRUE),
('Transport', '#FF9800', TRUE),
('Santé', '#F44336', TRUE),
('Loisirs', '#9C27B0', TRUE),
('Alcool', '#795548', TRUE),
('Boisson', '#03A9F4', TRUE),
('Restaurant', '#E91E63', TRUE),
('Vêtements', '#607D8B', TRUE),
('Technologie', '#00BCD4', TRUE),
('Éducation', '#3F51B5', TRUE),
('Factures', '#FFC107', TRUE);

-- Vue pour faciliter l'analyse des dépenses par tag (mise à jour pour inclure l'information de facture)
CREATE VIEW expense_analysis AS
SELECT 
    e.expense_id,
    e.user_id,
    e.amount,
    e.expense_date,
    e.description,
    e.is_recurring,
    e.invoice_id, -- NOUVEAU: ID de la facture
    dt.tag_id AS display_tag_id,
    dt.name AS display_tag_name,
    dt.color AS display_tag_color,
    dt.is_active AS display_tag_is_active,
    CASE 
        WHEN e.user_tag_id IS NULL OR ut.is_active = FALSE 
        THEN TRUE 
        ELSE FALSE 
    END AS using_default_tag,
    deft.tag_id AS default_tag_id,
    deft.name AS default_tag_name,
    -- NOUVELLES COLONNES pour les informations de facture
    inv.vendor_name AS invoice_vendor,
    inv.total_amount AS invoice_total
FROM 
    Expenses e
JOIN 
    Tags deft ON e.default_tag_id = deft.tag_id
LEFT JOIN 
    Tags ut ON e.user_tag_id = ut.tag_id
LEFT JOIN 
    Invoices inv ON e.invoice_id = inv.invoice_id
CROSS JOIN LATERAL (
    SELECT 
        CASE 
            WHEN ut.tag_id IS NULL OR ut.is_active = FALSE 
            THEN deft.tag_id 
            ELSE ut.tag_id 
        END AS tag_id,
        CASE 
            WHEN ut.tag_id IS NULL OR ut.is_active = FALSE 
            THEN deft.name 
            ELSE ut.name 
        END AS name,
        CASE 
            WHEN ut.tag_id IS NULL OR ut.is_active = FALSE 
            THEN deft.color 
            ELSE ut.color 
        END AS color,
        CASE 
            WHEN ut.tag_id IS NULL 
            THEN deft.is_active 
            ELSE ut.is_active 
        END AS is_active
) dt;

-- Vue pour dépenses par semaine et par tag (inchangée)
CREATE VIEW expense_weekly_by_tag AS
SELECT 
    user_id,
    DATE_TRUNC('week', expense_date) AS week_start,
    display_tag_id,
    display_tag_name,
    display_tag_color,
    SUM(amount) AS total_amount,
    COUNT(*) AS transaction_count
FROM expense_analysis
GROUP BY user_id, DATE_TRUNC('week', expense_date), display_tag_id, display_tag_name, display_tag_color
ORDER BY user_id, week_start DESC, total_amount DESC;

-- Vue pour dépenses par mois et par tag (inchangée)
CREATE VIEW expense_monthly_by_tag AS
SELECT 
    user_id,
    DATE_TRUNC('month', expense_date) AS month_start,
    display_tag_id,
    display_tag_name,
    display_tag_color,
    SUM(amount) AS total_amount,
    COUNT(*) AS transaction_count
FROM expense_analysis
GROUP BY user_id, DATE_TRUNC('month', expense_date), display_tag_id, display_tag_name, display_tag_color
ORDER BY user_id, month_start DESC, total_amount DESC;

-- Vue pour dépenses par année et par tag (inchangée)
CREATE VIEW expense_yearly_by_tag AS
SELECT 
    user_id,
    DATE_TRUNC('year', expense_date) AS year_start,
    display_tag_id,
    display_tag_name,
    display_tag_color,
    SUM(amount) AS total_amount,
    COUNT(*) AS transaction_count
FROM expense_analysis
GROUP BY user_id, DATE_TRUNC('year', expense_date), display_tag_id, display_tag_name, display_tag_color
ORDER BY user_id, year_start DESC, total_amount DESC;

-- Vue pour lister les tags actifs disponibles pour un utilisateur (inchangée)
CREATE VIEW user_available_tags AS
SELECT 
    t.tag_id,
    t.name,
    t.color,
    t.is_system,
    t.created_by,
    CASE 
        WHEN uf.tag_id IS NOT NULL THEN TRUE
        ELSE FALSE
    END AS is_favorite
FROM 
    Tags t
LEFT JOIN 
    UserFavoriteTags uf ON t.tag_id = uf.tag_id
WHERE 
    t.is_active = TRUE
ORDER BY 
    t.is_system DESC,
    t.name ASC;

-- NOUVELLE VUE: Pour obtenir un résumé des factures avec leurs articles
CREATE VIEW invoice_details AS
SELECT
    i.invoice_id,
    i.user_id,
    i.vendor_name,
    i.invoice_date,
    i.total_amount,
    i.receipt_image_path,
    i.notes,
    COUNT(e.expense_id) AS item_count,
    i.created_at,
    i.updated_at
FROM
    Invoices i
LEFT JOIN
    Expenses e ON i.invoice_id = e.invoice_id
GROUP BY
    i.invoice_id
ORDER BY
    i.invoice_date DESC;

-- Commentaires explicatifs sur le modèle
COMMENT ON TABLE Tags IS 'Stocke les catégories de dépenses, avec distinction entre tags système et personnalisés';
COMMENT ON COLUMN Tags.is_system IS 'Indique si le tag est prédéfini (TRUE) ou créé par un utilisateur (FALSE)';
COMMENT ON COLUMN Tags.is_active IS 'Indique si le tag est actif (TRUE) ou désactivé (FALSE)';
COMMENT ON TABLE Invoices IS 'Stocke les factures qui peuvent contenir plusieurs dépenses';
COMMENT ON COLUMN Invoices.vendor_name IS 'Nom du commerçant ou du fournisseur';
COMMENT ON COLUMN Invoices.total_amount IS 'Montant total de la facture, calculé automatiquement';
COMMENT ON COLUMN Expenses.default_tag_id IS 'Tag suggéré par le système, obligatoire';
COMMENT ON COLUMN Expenses.user_tag_id IS 'Tag choisi par l''utilisateur, NULL si l''utilisateur accepte le tag par défaut';
COMMENT ON COLUMN Expenses.invoice_id IS 'Référence à la facture dont cette dépense fait partie, NULL pour dépenses individuelles';
COMMENT ON TABLE UserFavoriteTags IS 'Stocke les tags préférés de chaque utilisateur pour un accès rapide';
COMMENT ON VIEW expense_analysis IS 'Vue qui simplifie l''analyse des dépenses en présentant le tag effectif (utilisateur ou par défaut)';
COMMENT ON VIEW user_available_tags IS 'Vue qui présente les tags actifs disponibles pour un utilisateur, avec indication des favoris';
COMMENT ON VIEW invoice_details IS 'Vue qui présente un résumé des factures avec le nombre d''articles qu''elles contiennent';