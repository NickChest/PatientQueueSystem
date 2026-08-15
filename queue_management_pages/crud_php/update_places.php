<?php
include "../../global/connection.php";
include "php_functions.php";
session_start();
header("Content-Type: application/json");

// check if user is logged in before doing anything
if (!isset($_SESSION["username"])) {
  http_response_code(401);
  echo json_encode(["success" => false, "error" => "Not logged in."]);
  exit();
}

$department = $_SESSION["viewing_department"] ?? $_SESSION["user_department"];

$raw_data = file_get_contents("php://input");
$new_order_data = json_decode($raw_data, true);

if ($new_order_data === null) {
  http_response_code(400);
  echo json_encode(["success" => false, "error" => "Invalid or missing order data."]);
  exit();
}

$sql = "UPDATE tbl_queues SET place = ?, called_time_and_date = ?, is_calling = ? WHERE ID = ? AND place != ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
  echo json_encode(["success" => false, "error" => "Database error:" . $conn->error]);
  exit();
}

$num_updated_records = 0;

foreach ($new_order_data as $order_data) {
  if (isset($order_data["new_place"]) && isset($order_data["record_id"])) {
    $place = (int)$order_data["new_place"];
    $primary_key = (int)$order_data["record_id"];
    $called_time_and_date = null;
    $is_calling = 0;

    if ($place === 1 || (count($order_data) === 1)) {
      $called_time_and_date = date('Y-m-d H:i:s');
      $is_calling = 1;
    }

    $stmt->bind_param("isiii", $place, $called_time_and_date, $is_calling, $primary_key, $place);

    if ($stmt->execute()) {
      $num_updated_records += $stmt->affected_rows;
    }
  }
}

updateTime($conn, "queue", $department);

$stmt->close();
$conn->close();

echo json_encode(["success" => true, "updated_rows" => $num_updated_records]);
