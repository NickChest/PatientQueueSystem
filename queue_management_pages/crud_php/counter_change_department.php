<?php
header("Content-Type: application/json");
session_start();

// claude fixes: change department to be based on "viewing_department", and if null, default to user department
// check if user is logged in before doing anything
if (!isset($_SESSION["username"])) {
  http_response_code(401);
  echo json_encode(["success" => false, "error" => "Not logged in."]);
  exit();
}

// check if they are actually counter role
if ($_SESSION["user_department"] !== "Counter") {
  http_response_code(403);
  echo json_encode(["success" => false, "error" => "Not authorized."]);
  exit();
}

$raw_data = file_get_contents("php://input");
$selected_department_data = json_decode($raw_data, true);

if (empty($selected_department_data["selected_department"])) {
  http_response_code(400);
  echo json_encode(["success" => false, "error" => "Missing department."]);
  exit();
}

// overwrite session
$_SESSION["viewing_department"] = $selected_department_data["selected_department"];

echo json_encode(["success" => true]);