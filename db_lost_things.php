<?php
include "db_connect.php";

$data = json_decode(file_get_contents("php://input"));
$category = $dbhandle->real_escape_string($data->category);
if($category!=-1){
    $query = "SELECT nickname,itemName,category,description,latitude,longitude FROM lostthings WHERE  category='$category' ";
}else{
    $query = "SELECT nickname,itemName,category,description,latitude,longitude FROM lostthings";
}

    $count=0;

    $do_search=mysqli_query($dbhandle, $query);
     while ($row = mysqli_fetch_array($do_search))
     {
         echo $row['latitude'];
         echo ',';
         echo $row['longitude'];
         echo ',';
         echo $row['nickname'];
         echo ',';
         echo $row['itemName'];
         echo ',';
         echo $row['category'];
         echo ',';
         echo $row['description'];
         echo '|';
     }
    $dbhandle->close();

?>