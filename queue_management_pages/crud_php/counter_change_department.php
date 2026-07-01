<?php
header("Content-Type: application/json");
session_start();

$raw_data = file_get_contents("php://input");
$selected_department_data = json_decode($raw_data, true);

// overwrite session
$_SESSION["user_department"] = $selected_department_data["selected_department"];

echo json_encode(["success" => true]);