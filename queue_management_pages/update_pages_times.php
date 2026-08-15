<?php
include "../global/connection.php";
session_start();
header("Content-Type: application/json");

// check if user is logged in before doing anything
if (!isset($_SESSION["username"])) {
  http_response_code(401);
  echo json_encode(["success" => false, "error" => "Not logged in."]);
  exit();
}

$user_department = $_SESSION["viewing_department"] ?? $_SESSION["user_department"];

if (empty($user_department)) {
  http_response_code(400);
  echo json_encode(["success" => false, "error" => "Missing department."]);
  exit();
}

$raw_data = file_get_contents("php://input");
$current_page_data = json_decode($raw_data, true);
$current_page_name = $current_page_data["current_page_name"];

$time_column = "time_last_updated_$current_page_name";

$sql = "SELECT $time_column FROM tbl_last_page_updates WHERE department = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
  header("Content-Type: application/json");
  echo json_encode(["error" => "Database error: " . $conn->error]);
  exit();
}

$stmt->bind_param("s", $user_department);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
  $row = $result->fetch_assoc();
  echo json_encode(["success" => true, "fetched_time" => $row[$time_column]]);
} else {
  // first time department is added to the table
  $current_datetime = date('Y-m-d H:i:s');
  $sql_insert = "INSERT INTO tbl_last_page_updates (department, $time_column) VALUES (?, ?)";
  $stmt_insert = $conn->prepare($sql_insert);

  if (! $stmt_insert) {
    header("Content-Type: application/json");
    echo json_encode(["error" => "Database error: " . $conn->error]);
    exit();
  }

  $stmt_insert->bind_param("ss", $user_department, $current_datetime);
  $stmt_insert->execute();
  $stmt_insert->close();

  echo json_encode(["success" => true, "fetched_time" => $current_datetime]);
}

$result->close();
$conn->close();
