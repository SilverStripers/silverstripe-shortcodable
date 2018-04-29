<?php

use SilverStripe\Core\Config\Config;
use Sheadawson\Shortcodable\Shortcodable;
use SilverStripe\Forms\HTMLEditor\TinyMCEConfig;
use SilverStripe\Core\Manifest\ModuleLoader;

$module = ModuleLoader::inst()->getManifest()->getModule('sheadawson/silverstripe-shortcodable');

$htmlEditorNames = Config::inst()->get(Shortcodable::class, 'htmleditor_names');



if (is_array($htmlEditorNames)) {
	foreach ($htmlEditorNames as $htmlEditorName) {
		TinyMCEConfig::get($htmlEditorName)
			->enablePlugins([
				'shortcodable'		=> $module->getResource('client/javascript/editor_plugin.js')
			])
			->addButtonsToLine(1, 'shortcodable');
	}
}

Shortcodable::register_classes(Shortcodable::config()->get('shortcodable_classes'));
