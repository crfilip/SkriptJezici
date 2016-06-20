<?php

define("HOSTNAME","localhost");
define("USERNAME","root");
define("PASSWORD","");
define("DATABASE","lostandfound");
// Create connection
$dbhandle = new mysqli(HOSTNAME, USERNAME, PASSWORD, DATABASE) or die("unable to connect");


?>