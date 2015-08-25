## Load Extentions.
MediumEditorAnchorExtension = require('../../dist/medium-editor-custom-anchor.js')
MediumEditorAnchorPreviewExtension = require('../../dist/medium-editor-custom-anchor-preview.js')

# Set Up
anchor = new MediumEditorAnchorExtension({
  template: """
    <form name="blockImageAnchorForm" novalidate="novalidate" class="medium-editor-anchor-form pure-form" onsubmit="return false;">
      <fieldset>
        <input class="medium-editor-toolbar-input" type="url" id="url" name="link" />
        <label class="" for="checkbox-1">
          <input type="checkbox" id="checkbox-1" class="medium-editor-toolbar-anchor-target" checked />
          <span class="">New Window</span>
        </label>
        <section class="toolbar">
        <button type="button" class="medium-editor-toolbar-close">Cancel</button>
        <button type="button" class="medium-editor-toolbar-save">OK</button>
        </section>
      </fieldset
    </form>
  """
})

anchorPreview = new MediumEditorAnchorPreviewExtension({
  removeLabel: 'Delete'
  editLabel: 'Edit'
})

# Create Mediume Editor with plugins.
editor = new MediumEditor('.editable', {
    buttonLabels: 'fontawesome'
    extensions:
      anchor: anchor
      'anchor-preview': anchorPreview
})
