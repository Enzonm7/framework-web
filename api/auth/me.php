<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../session.php';

// Endpoint GET — vérifie la session courante et retourne les infos de l'utilisateur
$user = requireAuth();

try {
    $db   = getDB();
    $stmt = $db->prepare('SELECT id, username, email FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$user['id']]);
    $data = $stmt->fetch();

    if (!$data) {
        // L'utilisateur a été supprimé mais sa session existe encore
        session_destroy();
        jsonResponse(['error' => 'Compte introuvable'], 404);
    }

    jsonResponse([
        'id'       => (int) $data['id'],
        'username' => $data['username'],
        'email'    => $data['email'],
    ]);

} catch (PDOException $e) {
    error_log('me.php PDOException: ' . $e->getMessage());
    jsonResponse(['error' => 'Erreur serveur interne'], 500);
}
