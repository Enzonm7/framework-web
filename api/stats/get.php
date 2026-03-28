<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../session.php';

// GET — statistiques de l'utilisateur connecté
$user = requireAuth();

try {
    $db   = getDB();
    $stmt = $db->prepare(
        'SELECT search_count, artworks_viewed, sources_explored
         FROM user_stats
         WHERE user_id = ?
         LIMIT 1'
    );
    $stmt->execute([$user['id']]);
    $row = $stmt->fetch();

    if (!$row) {
        // Ligne absente : renvoyer des zéros (ne devrait pas arriver après register)
        jsonResponse(['searchCount' => 0, 'artworksViewed' => 0, 'sourcesExplored' => 0]);
    }

    $sources = json_decode($row['sources_explored'] ?? '[]', true);
    $sources = is_array($sources) ? $sources : [];

    jsonResponse([
        'searchCount'     => (int) $row['search_count'],
        'artworksViewed'  => (int) $row['artworks_viewed'],
        'sourcesExplored' => count($sources),
    ]);

} catch (PDOException $e) {
    error_log('stats/get.php PDOException: ' . $e->getMessage());
    jsonResponse(['error' => 'Erreur serveur interne'], 500);
}
