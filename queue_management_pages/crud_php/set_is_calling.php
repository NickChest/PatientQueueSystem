<?php
include "../../global/connection.php";
header("Content-Type: application/json");

$raw_data = file_get_contents("php://input");
$record_id_data = json_decode($raw_data, true);
if (!$record_id_data) {
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