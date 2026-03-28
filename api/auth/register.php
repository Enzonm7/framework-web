<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Méthode non autorisée'], 405);
}

startSecureSession();
$body = getJsonBody();

// --- Validation des champs ---
$username = trim($body['username'] ?? '');
$email    = trim($body['email']    ?? '');
$password =       $body['password'] ?? '';

if (mb_strlen($username) < 3 || mb_strlen($username) > 50) {
    jsonResponse(['error' => 'Nom d\'utilisateur invalide (3 à 50 caractères)'], 422);
}
if (!preg_match('/^[a-zA-Z0-9_\-\.]+$/', $username)) {
    jsonResponse(['error' => 'Nom d\'utilisateur : seuls les lettres, chiffres, _, - et . sont autorisés'], 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => 'Adresse email invalide'], 422);
}
if (mb_strlen($password) < 8) {
    jsonResponse(['error' => 'Mot de passe trop court (minimum 8 caractères)'], 422);
}

try {
    $db = getDB();

    // Vérifier l'unicité (email ET username)
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1');
    $stmt->execute([$email, $username]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'Cet email ou ce nom d\'utilisateur est déjà utilisé'], 409);
    }

    // Hachage sécurisé du mot de passe (bcrypt, coût 12)
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

    // Créer l'utilisateur
    $stmt = $db->prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
    $stmt->execute([$username, $email, $hash]);
    $userId = (int) $db->lastInsertId();

    // Initialiser les statistiques vides
    $db->prepare('INSERT INTO user_stats (user_id) VALUES (?)')->execute([$userId]);

    // Ouvrir la session
    session_regenerate_id(true);
    $_SESSION['user_id']  = $userId;
    $_SESSION['username'] = $username;

    jsonResponse([
        'id'       => $userId,
        'username' => $username,
        'email'    => $email,
    ], 201);

} catch (PDOException $e) {
    error_log('register.php PDOException: ' . $e->getMessage());
    jsonResponse(['error' => 'Erreur serveur interne'], 500);
}
