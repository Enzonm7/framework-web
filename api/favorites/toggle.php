<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Méthode non autorisée'], 405);
}

$user = requireAuth();
$body = getJsonBody();

// --- Validation ---
$artworkId     = (string) ($body['id']     ?? '');
$artworkSource = (string) ($body['source'] ?? '');
$validSources  = ['met', 'harvard', 'europeana'];

if ($artworkId === '' || !in_array($artworkSource, $validSources, true)) {
    jsonResponse(['error' => 'Données invalides (id ou source manquant/incorrect)'], 422);
}

try {
    $db = getDB();

    // Vérifier si déjà en favori
    $stmt = $db->prepare(
        'SELECT id FROM favorites
         WHERE user_id = ? AND artwork_id = ? AND artwork_source = ?
         LIMIT 1'
    );
    $stmt->execute([$user['id'], $artworkId, $artworkSource]);
    $existing = $stmt->fetch();

    if ($existing) {
        // --- Supprimer le favori ---
        $stmt = $db->prepare(
            'DELETE FROM favorites
             WHERE user_id = ? AND artwork_id = ? AND artwork_source = ?'
        );
        $stmt->execute([$user['id'], $artworkId, $artworkSource]);

        jsonResponse(['action' => 'removed', 'isFavorite' => false]);

    } else {
        // --- Ajouter le favori ---
        // Sanitize les champs optionnels (longueur max correspondant au schéma SQL)
        $title     = mb_substr((string) ($body['title']     ?? ''), 0, 500);
        $artist    = mb_substr((string) ($body['artist']    ?? ''), 0, 255);
        $thumbnail = (string) ($body['thumbnail'] ?? '');
        $date      = mb_substr((string) ($body['date']      ?? ''), 0, 100);

        $stmt = $db->prepare(
            'INSERT INTO favorites
                (user_id, artwork_id, artwork_source, title, artist, thumbnail, artwork_date)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$user['id'], $artworkId, $artworkSource, $title, $artist, $thumbnail, $date]);

        jsonResponse(['action' => 'added', 'isFavorite' => true]);
    }

} catch (PDOException $e) {
    error_log('favorites/toggle.php PDOException: ' . $e->getMessage());
    jsonResponse(['error' => 'Erreur serveur interne'], 500);
}
