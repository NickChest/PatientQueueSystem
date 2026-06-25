<?php
session_start();
include "../global/connection.php";
if (!isset($_SESSION["user_department"])) {
  header("Content-Type: application/json");
  echo json_encode(["error" => "Session expired or department not set."]);
  exit();
}
$user_department = $_SESSION["user_department"];

// get only the records for today if not admin
$date_clause = "AND removed_time_and_date >= CURDATE() AND removed_time_and_date < CURDATE() + INTERVAL 1 DAY";
if ($_SESSION["privileges"] === "admin") {
  $date_clause = "";
}

$sql = "SELECT ID, queue_id, patient_id, patient_name, reason FROM tbl_removed WHERE department = ? $date_clause ORDER BY removed_time_and_date DESC";

$stmt = $conn->prepare($sql);

if (!$stmt) {
  header("Content-Type: application/json");
  echo json_encode(["error" => "Database error: " . $conn->error]);
}

$stmt->bind_param("s", $user_department);
$stmt->execute();
$result = $stmt->get_result();

$queue_data = [];

if ($result) {
  while ($row = $result->fetch_assoc()) {
    $queue_data[] = $row;
  }
  $result->free();
}

$conn->close();

header("Content-Type: application/json");
echo json_encode($queue_data);