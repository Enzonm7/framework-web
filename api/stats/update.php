<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Méthode non autorisée'], 405);
}

$user = requireAuth();
$body = getJsonBody();

$type   = (string) ($body['type']   ?? '');
$source = (string) ($body['source'] ?? '');

$validSources = ['met', 'harvard', 'europeana', ''];

try {
    $db = getDB();

    switch ($type) {

        case 'search':
            $db->prepare(
                'UPDATE user_stats SET search_count = search_count + 1 WHERE user_id = ?'
            )->execute([$user['id']]);
            break;

        case 'view':
            // Lire, puis mettre à jour atomiquement avec le nouveau tableau JSON
            $stmt = $db->prepare('SELECT sources_explored FROM user_stats WHERE user_id = ?');
            $stmt->execute([$user['id']]);
            $row     = $stmt->fetch();
            $sources = json_decode($row['sources_explored'] ?? '[]', true);
            $sources = is_array($sources) ? $sources : [];

            // Ajouter la source si valide et pas encore enregistrée
            if ($source && in_array($source, ['met', 'harvard', 'europeana'], true)
                        && !in_array($source, $sources, true)) {
                $sources[] = $source;
            }

            $db->prepare(
                'UPDATE user_stats
                 SET artworks_viewed = artworks_viewed + 1,
                     sources_explored = ?
                 WHERE user_id = ?'
            )->execute([json_encode($sources), $user['id']]);
            break;

        default:
            jsonResponse(['error' => 'Type invalide (attendu: search | view)'], 422);
    }

    jsonResponse(['success' => true]);

} catch (PDOException $e) {
    error_log('stats/update.php PDOException: ' . $e->getMessage());
    jsonResponse(['error' => 'Erreur serveur interne'], 500);
}
