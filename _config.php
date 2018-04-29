<?php

use SilverStripe\Core\Config\Config;
use Sheadawson\Shortcodable\Shortcodable;
use SilverStripe\Forms\HTMLEditor\TinyMCEConfig;

//if (!defined('SHORTCODABLE_DIR')) {
//    define('SHORTCODABLE_DIR', rtrim(basename(dirname(__FILE__))));
//}
//if (SHORTCODABLE_DIR != 'shortcodable') {
//    throw new Exception('The edit shortcodable module is not installed in correct directory. The directory should be named "shortcodable"');
//}


$htmlEditorNames = Config::inst()->get('Shortcodable', 'htmleditor_names');
if (is_array($htmlEditorNames)) {
	foreach ($htmlEditorNames as $htmlEditorName) {
		TinyMCEConfig::get($htmlEditorName)
			->enablePlugins([
				'shortcodable'		=> 'resources/sheadawson/silverstripe-shortcodable/client/javascript/editor_plugin.js'
			])
			->addButtonsToLine(1, 'shortcodable');
	}
}

Shortcodable::register_classes(Shortcodable::config()->get('shortcodable_classes'));

// enable shortcodable buttons and add to HtmlEditorConfig
//$htmlEditorNames = Config::inst()->get('Shortcodable', 'htmleditor_names');
//if (is_array($htmlEditorNames)) {
//    foreach ($htmlEditorNames as $htmlEditorName) {
//        TinyMCEConfig::get($htmlEditorName)->enablePlugins(array(
//            'shortcodable' => sprintf('../../../%s/javascript/editor_plugin.js', SHORTCODABLE_DIR)
//        ));
//        TinyMCEConfig::get($htmlEditorName)
//            ->addButtonsToLine(1, 'shortcodable');
//    }
//}

// register classes added via yml config
//Shortcodable::register_classes(Shortcodable::config()->get('shortcodable_classes'));
