<?php
include "db_connect.php";

$data = json_decode(file_get_contents("php://input"));
$email = $dbhandle->real_escape_string($data->email);
$password = $dbhandle->real_escape_string($data->password);

$query = "SELECT nickname FROM users WHERE email='$email' AND password='$password'";
$result = $dbhandle->query($query);
$row = $result->fetch_assoc();
if($row === null) echo"wrong";
echo $row["nickname"];

$dbhandle->close();

?>