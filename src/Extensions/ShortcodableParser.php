<?php

namespace Sheadawson\Shortcodable\Extensions;
use SilverStripe\View\Parsers\ShortcodeParser;


/**
 * ShortcodableParser - temporary measure, based on wordpress parser
 * This parser is only used to parse tags in the html editor field for editing in the popup window.
 *
 * @todo update SS ShortcodeParser to offer a public api for converting a shortcode to a data array, and use that instead.
 */
class ShortcodableParser extends ShortcodeParser
{

    private $nest = true;

    public function setNest($nest = false)
    {
        $this->nest = $nest;
        return $this;
    }

    public static function register_code($shortcode, $callback)
    {
        $inst = ShortcodeParser::get('shortcodable')->register($shortcode, $callback);
    }

    public function parse($content)
    {

        $content = parent::parse($content);

        if($this->nest) {
            $content = ShortcodeParser::get('shortcodable')
                ->setNest(false)
                ->parse($content);
        }

        return $content;

    }

}
