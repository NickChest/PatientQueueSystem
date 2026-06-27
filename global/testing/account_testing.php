<?php
include "connection.php";

$username = "user1";
$plain_password = "amongus123";
$department = "Hemodialysis";
$staff_name = "Stellman, Jay";
$privileges = "admin";

$password_hash = password_hash($plain_password, PASSWORD_DEFAULT);

$sql = "INSERT INTO tbl_users (username, password_hash, department, privileges, staff_name)
        VALUES (?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssss", $username, $password_hash, $department, $privileges, $staff_name);

if (!$stmt) {
  die("Database error: " . $conn->error);
}

if ($stmt->execute()) {
  echo "<h1>created account:</h1>";
  echo "<h2>username: {$username}</h2>";
  echo "<h2>password: {$plain_password}</h2>";
} else {
  echo "<h1>error:</h1>";
  echo "<p>" . $stmt->error . "</p>";
}

$stmt->close();
$conn->close();