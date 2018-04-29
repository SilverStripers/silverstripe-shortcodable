<?php

namespace Sheadawson\Shortcodable\Extensions;

use SilverStripe\Core\Extension;

use Sheadawson\Shortcodable\Shortcodable;

class ShortcodableHtmlEditorField extends Extension
{
    public function onBeforeRender()
    {
        $this->owner->setAttribute(
            'data-placeholderclasses',
            implode(',', Shortcodable::get_shortcodable_classes_with_placeholders())
        );
    }
}
