<?php

include "db_connect.php";

$data = json_decode(file_get_contents("php://input"));
$user = $dbhandle->real_escape_string($data->user);

$query = "SELECT * FROM chat WHERE user1='$user' OR user2='$user'";
$result = $dbhandle->query($query);
$rows = $result->fetch_all(MYSQLI_NUM);

foreach ($rows as $row){
    if($row[0]!==$user){
        echo $row[0];
        echo "|";
    }else {
        echo $row[1];
        echo "|";
    }
}
$dbhandle->close();

?>