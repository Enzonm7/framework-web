<?php
// ============================================================
//  Configuration de la base de données
//  MODIFIEZ ces valeurs selon votre configuration phpMyAdmin
// ============================================================

define('DB_HOST',    'localhost');
define('DB_NAME',    'artlens');
define('DB_USER',    'root'); 
define('DB_PASS',    '');       
define('DB_CHARSET', 'utf8mb4');

/**
 * Retourne une connexion PDO partagée (singleton).
 * Utilise des prepared statements et désactive l'émulation pour éviter les injections SQL.
 */
function getDB(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=%s',
            DB_HOST, DB_NAME, DB_CHARSET
        );
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false, // sécurité : vraies requêtes préparées
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // Ne jamais exposer les détails de connexion au client
            error_log('DB connection failed: ' . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Erreur serveur interne']);
            exit;
        }
    }

    return $pdo;
}
