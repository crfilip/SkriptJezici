<?php
include "db_connect.php";
$data = json_decode(file_get_contents("php://input"));
$email = $dbhandle->real_escape_string($data->email);
$password = $dbhandle->real_escape_string($data->password);
$nickname = $dbhandle->real_escape_string($data->nickname);

$query = "INSERT INTO users (email,password,nickname) VALUES ('$email', '$password', '$nickname')";

$dbhandle->query($query);
if($dbhandle->error){
    echo "Email in use";
}else{
    echo "Registration succesful";
}
$dbhandle->close();

?>