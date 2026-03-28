<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Méthode non autorisée'], 405);
}

startSecureSession();
$body = getJsonBody();

$email    = trim($body['email']    ?? '');
$password =       $body['password'] ?? '';

if (!$email || !$password) {
    jsonResponse(['error' => 'Email et mot de passe requis'], 422);
}

try {
    $db = getDB();

    $stmt = $db->prepare('SELECT id, username, email, password_hash FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // On renvoie intentionnellement le même message pour ne pas révéler
    // si l'email existe ou non (protection contre l'énumération d'emails)
    if (!$user || !password_verify($password, $user['password_hash'])) {
        jsonResponse(['error' => 'Email ou mot de passe incorrect'], 401);
    }

    // Régénérer l'ID de session pour éviter la fixation de session
    session_regenerate_id(true);
    $_SESSION['user_id']  = (int) $user['id'];
    $_SESSION['username'] = $user['username'];

    jsonResponse([
        'id'       => (int) $user['id'],
        'username' => $user['username'],
        'email'    => $user['email'],
    ]);

} catch (PDOException $e) {
    error_log('login.php PDOException: ' . $e->getMessage());
    jsonResponse(['error' => 'Erreur serveur interne'], 500);
}
