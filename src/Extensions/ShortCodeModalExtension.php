<?php
/**
 * Created by priyashantha@silverstripers.com
 * Date: 3/27/19
 * Time: 4:08 PM
 */

namespace Silverstripe\Shortcodable;

use SilverStripe\Core\Extension;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Forms\Form;
use Silverstripe\Shortcodable\Forms\ShortCodeFormFactory;

class ShortCodeModalExtension extends Extension
{
    private static $allowed_actions = array(
        'shortCodeEditForm',
    );

    public function shortCodeEditForm()
    {
        $type = $this->owner->getRequest()->requestVar('type');
        return Injector::inst()->get(ShortCodeFormFactory::class)
            ->getForm(
                $this->getOwner(),
                'shortCodeEditForm',
                ['type' => $type]
            );
    }

}