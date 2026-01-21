<?php
session_start();

if (!isset($_SESSION['usuario']) || !isset($_SESSION["rol"])) {
    header("Location: ../index.html");
    exit;
}

require_once "utilidades/LimpiarDatos.php";
header('Content-Type: application/json; charset=utf-8');

$ruta = LimpiarDatos::limpiarRuta($_GET['ruta'] ?? '');
//$accion = LimpiarDatos::limpiarParametro($_GET['accion'] ?? 'index');

define("BASE_PATH", realpath(__DIR__ . "/../../..") . "/gestionDepartamento/");


switch ($ruta) {
    case 'admin':
        require_once BASE_PATH . "frontend/admin/controlador/admin.php";
        break;

    case 'secretario':
        require_once BASE_PATH . "frontend/secretario/controlador/secretario.php";
        break;

    case 'profesor':
        require_once BASE_PATH . "frontend/profesor/controlador/profesor.php";
        break;

    case 'estudiante':
        require_once BASE_PATH . "frontend/estudiante/controlador/estudiante.php";
        break;
    case 'global':
        require_once BASE_PATH  . "frontend/global/index.php";
        break;

    default:
        header("Location: ../index.html");
        exit;
}