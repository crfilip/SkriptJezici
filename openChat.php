<?php

include "db_connect.php";

$data = json_decode(file_get_contents("php://input"));
$user = $dbhandle->real_escape_string($data->user);
$finder= $dbhandle->real_escape_string($data->finder);

$query = "INSERT INTO chat (user1,user2) VALUES ('$user', '$finder')";

$dbhandle->query($query);
if($dbhandle->error){
    echo "Baza ne radi";
}else{
    echo "Success";
}
$dbhandle->close();

?>