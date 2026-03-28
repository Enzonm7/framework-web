<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../session.php';

// GET — liste des favoris de l'utilisateur connecté
$user = requireAuth();

try {
    $db   = getDB();
    $stmt = $db->prepare(
        'SELECT
            artwork_id     AS id,
            artwork_source AS source,
            title,
            artist,
            thumbnail,
            artwork_date   AS date
         FROM favorites
         WHERE user_id = ?
         ORDER BY created_at DESC'
    );
    $stmt->execute([$user['id']]);

    jsonResponse($stmt->fetchAll());

} catch (PDOException $e) {
    error_log('favorites/get.php PDOException: ' . $e->getMessage());
    jsonResponse(['error' => 'Erreur serveur interne'], 500);
}
