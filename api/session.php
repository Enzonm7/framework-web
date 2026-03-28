<?php
// ============================================================
//  Helpers de session et réponses JSON
// ============================================================

/**
 * Démarre une session sécurisée avec des cookies httpOnly.
 */
function startSecureSession(): void
{
    if (session_status() !== PHP_SESSION_NONE) return;

    session_set_cookie_params([
        'lifetime' => 0,           // session expire à la fermeture du navigateur
        'path'     => '/',
        'secure'   => false,       // mettre TRUE en production (HTTPS obligatoire)
        'httponly' => true,        // inaccessible depuis JavaScript (protection XSS)
        'samesite' => 'Lax',       // protection CSRF basique
    ]);

    session_start();
}

/**
 * Vérifie que l'utilisateur est authentifié.
 * Arrête l'exécution avec 401 si ce n'est pas le cas.
 *
 * @return array ['id' => int, 'username' => string]
 */
function requireAuth(): array
{
    startSecureSession();

    if (empty($_SESSION['user_id'])) {
        jsonResponse(['error' => 'Non authentifié. Veuillez vous connecter.'], 401);
    }

    return [
        'id'       => (int) $_SESSION['user_id'],
        'username' => (string) $_SESSION['username'],
    ];
}

/**
 * Envoie une réponse JSON et termine le script.
 */
function jsonResponse(array $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Lit et décode le corps JSON de la requête entrante.
 */
function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}
