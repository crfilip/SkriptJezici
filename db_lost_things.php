<?php
include "db_connect.php";

    $count=0;
    $query = "SELECT nickname,itemName,category,description,latitude,longitude FROM lostthings";
    $do_search=mysqli_query($dbhandle, $query);
     while ($row = mysqli_fetch_array($do_search))
     {
         echo $row['latitude'];
         echo ',';
         echo $row['longitude'];
         echo '|';
     }
    $dbhandle->close();

?>