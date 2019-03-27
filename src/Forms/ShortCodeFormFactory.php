<?php
/**
 * Created by priyashantha@silverstripers.com
 * Date: 3/27/19
 * Time: 3:30 PM
 */

namespace Silverstripe\Shortcodable\Forms;

use SilverStripe\Forms\FormFactory;
use SilverStripe\Control\RequestHandler;
use SilverStripe\Core\Config\Configurable;
use SilverStripe\Core\Extensible;
use SilverStripe\Core\Injector\Injectable;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\FormAction;
use SilverStripe\Forms\TextField;


class ShortCodeFormFactory implements FormFactory
{
    use Extensible;
    use Injectable;
    use Configurable;

    /**
     * @param RequestHandler $controller
     * @param string $name
     * @param array $context
     * @return Form
     */
    public function getForm(RequestHandler $controller = null, $name = FormFactory::DEFAULT_NAME, $context = [])
    {
        // Validate context
        foreach ($this->getRequiredContext() as $required) {
            if (!isset($context[$required])) {
                throw new InvalidArgumentException("Missing required context $required");
            }
        }

        $fields = $this->getFormFields($controller, $name, $context);
        $actions = $this->getFormActions($controller, $name, $context);
        $validator = $this->getValidator($controller, $name, $context);
        /** @var Form $form */
        $form = Form::create($controller, $name, $fields, $actions, $validator);
        $form->addExtraClass('form--no-dividers');

        return $form;
    }

    protected function getFormFields($controller, $name, $context)
    {
        return FieldList::create(array(
            // todo
        ));
    }

    protected function getFormActions($controller, $name, $context)
    {
        $actions = FieldList::create([
            FormAction::create('add', 'Add')
                ->setSchemaData(['data' => ['buttonStyle' => 'primary']]),
        ]);

        return $actions;
    }

    protected function getValidator($controller, $name, $context)
    {
        return null;
    }

    public function getRequiredContext()
    {
        return [];
    }
}