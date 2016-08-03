<?php
session_start();
include "db_connect.php";

$data = json_decode(file_get_contents("php://input"));
$user = $dbhandle->real_escape_string($data->user);
$nickname = $dbhandle->real_escape_string($data->nickname);
$itemName = $dbhandle->real_escape_string($data->itemName);
$category = $dbhandle->real_escape_string($data->category);
$description = $dbhandle->real_escape_string($data->description);
$latitude = $dbhandle->real_escape_string($data->latitude);
$longitude = $dbhandle->real_escape_string($data->longitude);

if($_SESSION['user']===$user){
    $query = "INSERT INTO lostthings (nickname,itemName,category,description,latitude,longitude) VALUES ('$nickname','$itemName','$category','$description','$latitude','$longitude')";
    $dbhandle->query($query);
    $dbhandle->close();
}else{
    echo "wrong";
}
?>