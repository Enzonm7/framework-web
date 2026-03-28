<?php
// ============================================================
//  Gestion CORS pour le développement local
//  En production : remplacez par votre domaine réel
// ============================================================

$allowedOrigins = [
    'http://localhost:5173',  // Vite dev server (port par défaut)
    'http://localhost:3000',
    'http://127.0.0.1:5173',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // En production, on peut aussi mettre votre domaine fixe ici
    // header('Access-Control-Allow-Origin: https://votre-domaine.com');
}

header('Access-Control-Allow-Credentials: true');   // nécessaire pour les cookies de session
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');            // cache preflight 24h

// Répondre immédiatement aux requêtes preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
