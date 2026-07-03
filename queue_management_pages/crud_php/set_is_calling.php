<?php
include "../../global/connection.php";
header("Content-Type: application/json");
session_start();

// check if user is logged in before doing anything
if (!isset($_SESSION["username"])) {
  http_response_code(401);
  echo json_encode(["success" => false, "error" => "Not logged in."]);
  exit();
}

$raw_data = file_get_contents("php://input");
$record_id_data = json_decode($raw_data, true);

if (empty($record_id_data)) {
  http_response_code(400);
  echo json_encode(["success" => false, "error" => "No record data received."]);
  exit();
}

$sql = "UPDATE tbl_queues SET is_calling = 1 WHERE ID = ?";

$stmt = $conn->prepare($sql);
if (!$stmt) {
  echo json_encode(["success" => false, "error" => "Database error:" . $conn->error]);
  exit();
}

$stmt->bind_param("i", $record_id_data["record_id"]);
$stmt->execute();

$stmt->close();
$conn->close();

echo json_encode(["success" => true]);
