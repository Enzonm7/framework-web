<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../session.php';

startSecureSession();

// Vider les données de session
$_SESSION = [];

// Supprimer le cookie de session côté client
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(), '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

session_destroy();

jsonResponse(['success' => true]);
