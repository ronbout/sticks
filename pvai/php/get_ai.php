<?php
/* quick routine to create api for returning
	 ai.dat, a table for reinforcement learning
	 in the game Sticks */

	 $filename = 'ai.dat';

	 if ( !($return_ai = @file($filename, FILE_IGNORE_NEW_LINES) ) )  {
		 $return_ai = array(
			'1',
			'1,2',
			'1,2,3',
			'1,2,3',
			'1,2,3',
			'1,2,3',
			'1,2,3',
			'1,2,3',
			'1,2,3',
			'1,2,3',
			'1,2,3',
			'1,2,3',
			'1,2,3',
			'1,2,3',
			'1,2,3',
			'1,2,3',
			'1,2,3',
			'1,2,3',
			'1,2,3',
			'1,2,3',
		);
	 }

	 $outer_data = array('data' => $return_ai);
	 $return_json = json_encode($outer_data);
	 header('Content-type: application/json');
	 echo $return_json;