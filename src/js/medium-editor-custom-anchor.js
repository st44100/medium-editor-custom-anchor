// ES6
'use strict'
/*
 * Util.getSelectionRange()
 * Util.isMetaCtrlKey(evt)
 * Util.keyCode.ENTER
 * Util.keyCode.ESCAPE
 * AnchorExtension = Util.derives(DefaultButton, AnchorDerived);
 *
 */

function extend(dest, src) {
  Object.keys(src).forEach((k) => {
    dsst[k] = src[k]
  });
}

let isMac = (window.navigator.platform.toUpperCase().indexOf('MAC') >= 0);

let Util = {
  getSelectionRange: (ownerDocument) => {
    var selection = ownerDocument.getSelection();
    if (selection.rangeCount == 0) {
      return null;
    }
    return selection.getRangeAt(0);
  },

  isMetaCtrlKey: function (event) {
    if ((this.isMac && event.metaKey) || (!this.isMac && event.ctrlKey)) {
      return true;
    }
    return false;
  },
  keyCode: {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    DELETE: 46
  },
  derives: (base, dist, src) => {
    var origPrototype = derived.prototype;
    function Proto() { }
    Proto.prototype = base.prototype;
    derived.prototype = new Proto();
    derived.prototype.constructor = base;
    derived.prototype = copyInto(false, derived.prototype, origPrototype);
    return derived;
  }
};




export default class MediumEditorAnchorExtension {

  constructor(id = null, instance) {
    // if this.parent = true, `this.base` become a reference to Medium Editor.
    this.parent = true;
    this.options = {
      name: 'anchor' ,
      action: 'createLink',
      aria: 'link',
      tagNames: ['a'],
      contentDefault:'<b>#</b>',
      contentFA: '<i class="fa fa-link"></i>'
    };
    this.name = 'anchor';
    this.hasForm = true;
    this.formSaveLabel = '&#10003;';
    this.formCloseLabel = '&times;';
  }

  // invoke from MediumEditor
  init (instance) {
      this.base = instance;

      this.button = this.createButton();
      this.base.on(this.button, 'click', this.handleClick.bind(this));
      if (this.options.key) {
          this.base.subscribe('editableKeydown', this.handleKeydown.bind(this));
      }
  }

  handleClick (evt) {
    evt.preventDefault();
    evt.stopPropagation();

    let selectedParentElement = this.base.getSelectedParentElement(Util.getSelectionRange(this.base.options.ownerDocument));
    if (selectedParentElement.tagName && selectedParentElement.tagName.toLowerCase() === 'a') {
      return this.base.execAction('unlink');
    }

    if (!this.isDisplayed()) {
      this.showForm();
    }
    return false;
  }

  handleKeydown (evt) {
    let key = String.fromCharCode(evt.which || evt.keyCode).toLowerCase();
    if (this.options.key === Util.isMetaCtrlKey(evt)) {
      evt.preventDefault();
      evt.stopPropagation();

      this.handleClick(evt);
    }
  }

  getForm () {
    if (!this.form) {
      this.form = this.createForm();
    }
    return this.form;
  }

  getTemplate () {
    let template = `
      <form name="blockImageAnchorForm" novalidate="novalidate" class="medium-editor-anchor-form">
        <section style="position:relative;" class="edit-box edit-box--narrow">
          <div class="edit-box__inner">
            <div class="edit-box__body">
              <div class="input input--xs">
                <div class="input__inner">
                  <input placeholder="http://" type="url" name="link" class="medium-editor-toolbar-input input__input js-block-image-anchor-input">
                </div>
              </div>
            </div>
          </div>
          <div class="edit-box__action edit-box__action--justify">
            <span class="checkbox">
              <input type="checkbox" id="target-blank" class="medium-editor-toolbar-anchor-target checkbox__item">
              <label for="target-blank" class="checkbox__mark"></label>
              <label for="target-blank" class="checkbox__label txt">新規ウィンドウ</label>
            </span>
            <span>
              <button type="button" class="medium-editor-toolbar-save btn btn--primary btn--xs">OK</button>
            </span>
          </div>
        </section>
      </form>
      <a href="#" class="medium-editor-toolbar-close"></a>
      `;

    let defaultTpl = `
      <input type="text" class="medium-editor-toolbar-input" placeholder="${this.base.options.anchorInputPlaceholder}">
      <a href="#" class="medium-editor-toolbar-save">${
        this.base.options.buttonLabels === 'fontawesome' ? '<i class="fa fa-check"></i>' : this.formSaveLabel
      }</a>
      <a href="#" class="medium-editor-toolbar-close">
      ${
        this.base.options.buttonLabels === 'fontawesome' ? '<i class="fa fa-times"></i>' : this.formCloseLabel
      }
      </a>
      `;

    // if (this.base.options.anchorTarget) {
    //   tempalte += `
    //     <input type="checkbox" class="medium-editor-toolbar-anchor-target">
    //     <label>${this.base.options.anchorInputCheckboxLabel}</label>
    //   `;
    // }

    if (this.base.options.anchorButton) {
      tempalte += `
        <input type="checkbox" class="medium-editor-toolbar-anchor-button">
        <label>Button</label>
      `;
    }
    return template;
  }

  isDisplayed () {
    return this.getForm().style.display === 'block';
  }

  hideForm () {
    this.getForm().style.display = 'none';
    this.getInput().value = '';
  }

  showForm (linkValue = '') {
    let input = this.getInput();

    this.base.saveSelection();
    //this.base.hideToolbarDefaultActions();
    this.getForm().style.display = 'block';
    this.base.setToolbarPosition();

    input.value = linkValue;
    input.focus();
  }

  deactivate () {
    if (!this.form) {
      return false;
    }

    if (this.form.parentNode) {
      this.form.parentNode.removeChild(this.form);
    }

    delete this.form;
  }

  getFormOpts () {
    let targetCheckbox = this.getForm().querySelector('.medium-editor-toolbar-anchor-target');
    let buttonCheckbox = this.getForm().querySelector('.medium-editor-toolbar-anchor-button');
    let opts = {
      url: this.getInput().value
    };
    if (this.base.options.checkLinkFormat) {
      opts.url = this.checkLinkFormat(opts.url);
    }

    if (targetCheckbox && targetCheckbox.checked) {
      opts.target = '_blank';
    } else {
      opts.target = '_self';
    }
    return opts;
  }

  doFormSave () {
    var opts = this.getFormOpts();
    this.completeFormSave(opts);
  }

  completeFormSave (opts) {
    this.base.restoreSelection();
    this.base.createLink(opts);
    this.base.checkSelection();
  }

  checkLinkFormat (value) {
    let re = /^(https?|ftps?|rtmpt?):\/\/|mailto:/
    return (re.test(value)) ? '' : `http://${value}`
  }

  doFormCancel () {
    this.base.restoreSelection();
    this.base.checkSelection();
  }

  attachFormEvents (form) {
    let close = form.querySelector('.medium-editor-toolbar-close');
    let save = form.querySelector('.medium-editor-toolbar-save');
    let input = form.querySelector('.medium-editor-toolbar-input');

    this.base.on(form, 'click', this.handleFormClick.bind(this));
    this.base.on(input, 'keyup', this.handleTextboxKeyup.bind(this));
    this.base.on(close, 'click', this.handleCloseClick.bind(this));
    this.base.on(save, 'click', this.handleSaveClick.bind(this), true);
  }

  createForm () {
    let doc = this.base.options.ownerDocument;
    let form = doc.createElement('div');

    form.className = 'medium-editor-toolbar-form';
    form.id = `medium-editor-toolbar-form-anchor-${this.base.id}`;
    form.innerHTML = this.getTemplate();
    this.attachFormEvents(form);

    return form;
  }

  getInput () {
    let form = this.getForm();
    return this.getForm().querySelector('input.medium-editor-toolbar-input');
  }

  handleTextboxKeyup (evt) {
    if (evt.keyCode === Util.keyCode.ENTER) {
      evt.preventDefault();
      this.doFormSave();
      return;
    }

    if (evt.keyCode === Util.keyCode.ESCAPE) {
      evt.preventDefault();
      this.doFormCancel();
    }
  }

  handleFormClick (evt) {
    evt.stopPropagation();
  }

  handleSaveClick (evt) {
    evt.preventDefault();
    this.doFormSave();
  }

  handleCloseClick (evt) {
    evt.preventDefault();
    this.doFormCancel();
  }

  getButton () {
    return this.button;
  }

  createButton () {
    let button = this.base.options.ownerDocument.createElement('button');
    let content = this.options.contentDefault;
    button.classList.add('medium-editor-action');
    button.classList.add('medium-editor-action-' + this.name);
    button.setAttribute('data-action', this.getAction());
    button.setAttribute('aria-label', this.getAria());
    if (this.base.options.buttonLabels) {
        if (this.base.options.buttonLabels === 'fontawesome' && this.options.contentFA) {
            content = this.options.contentFA;
        } else if (typeof this.base.options.buttonLabels === 'object' && this.base.options.buttonLabels[this.name]) {
            content = this.base.options.buttonLabels[this.options.name];
        }
    }
    button.innerHTML = content;
    return button;
  }

  getAction () {
    return (typeof this.options.action === 'function') ? this.options.action(this.base.options) : this.options.action;
  }

  getAria() {
    return (typeof this.options.aria === 'function') ? this.options.aria(this.base.options) : this.options.aria;
  }
}