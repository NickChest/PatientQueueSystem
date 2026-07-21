<?php
include "../global/connection.php";

$sql = "SELECT ID, place, queue_id, department, is_calling FROM tbl_queues 
        WHERE place = 1
        AND added_time_and_date >= CURDATE() 
        AND added_time_and_date < CURDATE() + INTERVAL 1 DAY
        ORDER BY called_time_and_date DESC";

$stmt = $conn->prepare($sql);

if (!$stmt) {
  header("Content-Type: application/json");
  echo json_encode(["error" => "Database error: " . $conn->error]);
  exit();
}

$stmt->execute();
$result = $stmt->get_result();

$queues_data = [];

if ($result) {
  while ($row = $result->fetch_assoc()) {
    $department = $row["department"];
    $waiting = 0;
    $count_sql = "SELECT COUNT(queue_id) FROM tbl_queues 
                  WHERE department = ? 
                  AND added_time_and_date >= CURDATE() 
                  AND added_time_and_date < CURDATE() + INTERVAL 1 DAY";

    $count_stmt = $conn->prepare($count_sql);
    $count_stmt->bind_param("s", $department);
    $count_stmt->execute();
    $count_stmt->bind_result($waiting);
    $count_stmt->fetch();
    $count_stmt->close();

    $row["waiting"] = $waiting - 1;
    $queues_data[] = $row;
    }
  $result->free();
}
$stmt->close();
$conn->close();

header("Content-Type: application/json");
echo json_encode($queues_data);
