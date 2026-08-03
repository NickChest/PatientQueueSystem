<?php
include "../../global/connection.php";
session_start();

header("Content-Type: application/json");

// check if user is logged in before doing anything
if (!isset($_SESSION["username"])) {
  http_response_code(401);
  echo json_encode(["success" => false, "error" => "Not logged in."]);
  exit();
}

$department = $_SESSION["viewing_department"] ?? $_SESSION["user_department"];

if (empty($department)) {
  http_response_code(400);
  echo json_encode(["success" => false, "error" => "Missing department."]);
  exit();
}

$page = $_GET["page"];

$offset = isset($_GET["offset"]) ? (int)$_GET["offset"] : 0;

// !!! by default it's for the tbl_completed !!!

$table = "tbl_completed";

$date_clause = "AND marked_time_and_date >= CURDATE() AND marked_time_and_date < CURDATE() + INTERVAL 1 DAY";
$user_clause = "";
$order_clause = "marked_time_and_date";

if ($_SESSION["privileges"] === "admin") {
  $date_clause = "";
  $user_clause = ", marked_by, DATE(marked_time_and_date) AS only_date, TIME_FORMAT(marked_time_and_date, '%h:%i %p') AS Time12";
}

$sql_query = "";
$params = "";
$values = [];
// if query isn't blank
$query = isset($_GET["query"]) ? $_GET["query"] : null;

if ($query) {
  // make it the values for wildcard search
  $query = $_GET["query"];

  // searches for matches on both sides of string
  $wildcard_string = "%" . $query . "%";

  // three params for three identical wildcard strings
  $sql_query = "(queue_id LIKE ? OR patient_id LIKE ? OR patient_name LIKE ?)";
  $params = "sss";
  $values = [$wildcard_string, $wildcard_string, $wildcard_string];
}


if ($page === 'completed_pm_page') {

  // !!! ----------------------------------- !!!
  //            TBL_COMPLETED STUFF
  // !!! ----------------------------------- !!!

  // if there is date
  // include it in the sql

  if (isset($_GET["date"])) {
    $sql_query .= "AND (marked_time_and_date >= ? AND 
                   marked_time_and_date < ? + INTERVAL 1 DAY)";
    $params .= "ss";
    $dates = [$_GET["date"], $_GET["date"]];
    $values = array_merge($values, $dates);
  }

  if (!$query) {
    // if query is blank
    // make only date be basis
    if ($_SESSION["privileges"] === "admin" && isset($_GET["date"])) {
      $sql_query = "(marked_time_and_date >= ? AND 
                  marked_time_and_date < ? + INTERVAL 1 DAY)";
      $params = "ss";
      $values = [$_GET["date"], $_GET["date"]];
    }
  }
} elseif ($page === 'removed_pm_page') {

  // !!! ----------------------------------- !!!
  //             TBL_REMOVED STUFF
  // !!! ----------------------------------- !!!

  $date_clause = "AND removed_time_and_date >= CURDATE() AND removed_time_and_date < CURDATE() + INTERVAL 1 DAY AND reason != 'Auto-flushed: Day has passed'";
  $user_clause = ", reason, TIME_FORMAT(removed_time_and_date, '%h:%i %p') AS Time12";
  $order_clause = "removed_time_and_date";


  if ($_SESSION["privileges"] === "admin") {
    $date_clause = "";
    $user_clause = ", reason, removed_by, removed_time_and_date, DATE(removed_time_and_date) AS only_date, TIME_FORMAT(removed_time_and_date, '%h:%i %p') AS Time12";
  }

  $table = "tbl_removed";
  $reason = $_GET["reason"];

  $removed_query = "";

  // check if the reason is all
  // this can be an equal one and not LIKE because it's a dropdown

  if ($query) {
    if ($reason !== "all") {
      // add reason if not all
      $removed_query .= " AND reason = ?";

      // if the query is not blank, include it in the final sql
      $sql_query .= $removed_query;

      // add one param for the reason
      $params .= "s";
      // and value
      array_push($values, $reason);
    }
  } else {
    // if it is blank
    // just return ones that match the reason
    $sql_query = "reason = ?";

    // only one param needed now
    $params = "s";
    // and only one value
    $values = [$reason];
  }
}

//add offset to end
array_push($values, $offset);


$sql = "SELECT queue_id, patient_id, patient_name $user_clause FROM $table WHERE department = ? AND $sql_query $date_clause ORDER BY $order_clause DESC LIMIT 50 OFFSET ? ";
// echo json_encode(["sql" => $sql, "query" => $query, "sql_query" => $sql_query, "params" => $params, "values" => $values], JSON_PRETTY_PRINT);
$stmt = $conn->prepare($sql);
$stmt->bind_param("s" . $params . "i", $department, ...$values);
$stmt->execute();
$result = $stmt->get_result();

$search_data = [];
if ($result) {
  while ($row = $result->fetch_assoc()) {
    if (isset($row["only_date"])) {
      $date = new DateTime($row["only_date"]);
      $row["only_date"] = $date->format('F j, Y');
      $row["sql"] = $sql;
    }

    if ($page === "removed_pm_page") {
      if ($_SESSION["privileges"] === "admin") {
        $db_date = new DateTimeImmutable($row["removed_time_and_date"]);
        $today = new DateTimeImmutable("today");

        $db_date_midnight = $db_date->setTime(0, 0, 0);

        $row["is_today"] = ($db_date_midnight == $today);

        $date = new DateTime($row["only_date"]);
      } else {
        $row["is_today"] = true;
      }
    }
    $search_data[] = $row;
  }
}

$stmt->close();
$conn->close();

echo json_encode($search_data);
