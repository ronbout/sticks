<?php
/* quick routine to create api for writing
	 ai.dat, a table for reinforcement learning
	 in the game Sticks */

$filename = '../../ai.dat';

// get data from $_POST
$ai = $_POST['moves'];

$result = file_put_contents($filename, implode(PHP_EOL, $ai));

echo $result;

die();
