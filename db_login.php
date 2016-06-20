<?php
echo "aa";
include "db_connect.php";

$data = json_decode(file_get_contents("php://input"));
$email = $dbhandle->real_escape_string($data->email);
$password = $dbhandle->real_escape_string($data->password);

$query = "SELECT * FROM users WHERE email='$email' AND password='$password'";
$row = mysql_fetch_array($query);
echo $row['email'];

?>