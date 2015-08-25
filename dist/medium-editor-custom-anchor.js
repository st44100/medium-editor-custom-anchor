// ES6
'use strict';
/*
 * Util.getSelectionRange()
 * Util.isMetaCtrlKey(evt)
 * Util.keyCode.ENTER
 * Util.keyCode.ESCAPE
 *
 */

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function extend(dest, src) {
  Object.keys(src).forEach(function (k) {
    dest[k] = src[k];
  });
}

var isMac = window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;

var Util = {
  getSelectionRange: function getSelectionRange(ownerDocument) {
    var selection = ownerDocument.getSelection();
    if (selection.rangeCount == 0) {
      return null;
    }
    return selection.getRangeAt(0);
  },

  isMetaCtrlKey: function isMetaCtrlKey(event) {
    if (this.isMac && event.metaKey || !this.isMac && event.ctrlKey) {
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
  }
};

var MediumEditorAnchorExtension = (function () {
  function MediumEditorAnchorExtension(options, instance) {
    if (options === undefined) options = {};

    _classCallCheck(this, MediumEditorAnchorExtension);

    // if this.parent = true, `this.base` become a reference to Medium Editor.
    this.parent = true;
    this.options = {
      key: 'enter',
      name: 'anchor',
      action: 'createLink',
      aria: 'link',
      tagNames: ['a'],
      contentDefault: '<b>#</b>',
      contentFA: '<i class="fa fa-link"></i>'
    };
    this.name = 'anchor';
    this.hasForm = true;
    this.formSaveLabel = '&#10003;';
    this.formCloseLabel = '&times;';
    extend(this.options, options);
  }

  // invoke from MediumEditor

  _createClass(MediumEditorAnchorExtension, [{
    key: 'init',
    value: function init(instance) {
      this.base = instance;

      this.button = this.createButton();
      this.base.on(this.button, 'click', this.handleClick.bind(this));
      if (this.options.key) {
        this.base.subscribe('editableKeydown', this.handleKeydown.bind(this));
      }
    }
  }, {
    key: 'handleClick',
    value: function handleClick(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      var sel = this.base.options.ownerDocument.getSelection();
      if (sel.focusNode === null) {
        if (this.isDisplayed()) {
          this.hideForm();
          this.base.restoreSelection();
        }
        return;
      }

      var selectedParentElement = this.base.getSelectedParentElement(Util.getSelectionRange(this.base.options.ownerDocument));
      if (selectedParentElement.tagName && selectedParentElement.tagName.toLowerCase() === 'a') {
        return this.base.execAction('unlink');
      }

      if (!this.isDisplayed()) {
        this.showForm();
      }
      return false;
    }
  }, {
    key: 'handleKeydown',
    value: function handleKeydown(evt) {
      var key = String.fromCharCode(evt.which || evt.keyCode).toLowerCase();
      if (this.options.key === Util.isMetaCtrlKey(evt)) {
        evt.preventDefault();
        evt.stopPropagation();

        this.handleClick(evt);
      }
    }
  }, {
    key: 'getForm',
    value: function getForm() {
      if (!this.form) {
        this.form = this.createForm();
      }
      return this.form;
    }
  }, {
    key: 'getTemplate',
    value: function getTemplate() {
      var template = '';
      var defaultTpl = '\n      <form name="blockImageAnchorForm" novalidate="novalidate" class="medium-editor-anchor-form" onsubmit="return false;">\n        <section style="position:relative;" class="edit-box edit-box--narrow">\n          <div class="edit-box__inner">\n            <div class="edit-box__body">\n              <div class="input input--xs">\n                <div class="input__inner">\n                  <input placeholder="http://" type="url" name="link" class="medium-editor-toolbar-input input__input js-block-image-anchor-input">\n                </div>\n              </div>\n            </div>\n          </div>\n          <div class="edit-box__action edit-box__action--justify">\n            <span class="checkbox">\n              <input type="checkbox" id="target-blank-' + this.base.id + '}" class="medium-editor-toolbar-anchor-target checkbox__item">\n              <label for="target-blank-' + this.base.id + '}" class="checkbox__mark"></label>\n              <label for="target-blank-' + this.base.id + '}" class="checkbox__label txt">新規ウィンドウ</label>\n            </span>\n            <span>\n              <button type="button" class="medium-editor-toolbar-save btn btn--primary btn--xs">OK</button>\n            </span>\n          </div>\n        </section>\n      </form>\n      <a href="#" class="medium-editor-toolbar-close"></a>\n      ';
      if (!this.options.template) {
        template = defaultTpl;
      } else {
        template = this.options.template;
      }
      // if (this.base.options.anchorTarget) {
      //   tempalte += `
      //     <input type="checkbox" class="medium-editor-toolbar-anchor-target">
      //     <label>${this.base.options.anchorInputCheckboxLabel}</label>
      //   `;
      // }

      if (this.base.options.anchorButton) {
        tempalte += '\n        <input type="checkbox" class="medium-editor-toolbar-anchor-button">\n        <label>Button</label>\n      ';
      }
      return template;
    }
  }, {
    key: 'isDisplayed',
    value: function isDisplayed() {
      return this.getForm().style.display === 'block';
    }
  }, {
    key: 'hideForm',
    value: function hideForm() {
      this.getForm().style.display = 'none';
      this.getInput().value = '';
      this.getTargetInput().checked = false;
    }
  }, {
    key: 'showForm',
    value: function showForm() {
      var linkValue = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var targetValue = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var input = this.getInput();
      var targetInput = this.getTargetInput();

      this.base.saveSelection();
      //this.base.hideToolbarDefaultActions();
      this.getForm().style.display = 'block';
      this.base.setToolbarPosition();

      input.value = linkValue;
      targetInput.checked = targetValue;
      input.focus();
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      if (!this.form) {
        return false;
      }

      if (this.form.parentNode) {
        this.form.parentNode.removeChild(this.form);
      }

      delete this.form;
    }
  }, {
    key: 'getFormOpts',
    value: function getFormOpts() {
      var targetCheckbox = this.getForm().querySelector('.medium-editor-toolbar-anchor-target');
      var buttonCheckbox = this.getForm().querySelector('.medium-editor-toolbar-anchor-button');
      var opts = {
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

      if (buttonCheckbox && buttonCheckbox.checked) {
        opts.buttonClass = this.base.options.anchorButtonClass;
      }
      return opts;
    }
  }, {
    key: 'doFormSave',
    value: function doFormSave() {
      var opts = this.getFormOpts();
      this.completeFormSave(opts);
    }
  }, {
    key: 'completeFormSave',
    value: function completeFormSave(opts) {
      this.base.restoreSelection();
      this.base.createLink(opts);
      this.base.checkSelection();
    }
  }, {
    key: 'checkLinkFormat',
    value: function checkLinkFormat(value) {
      var re = /^(https?|ftps?|rtmpt?):\/\/|mailto:/;
      return re.test(value) ? '' : 'http://' + value;
    }
  }, {
    key: 'doFormCancel',
    value: function doFormCancel() {
      this.base.restoreSelection();
      this.base.checkSelection();
    }
  }, {
    key: 'attachFormEvents',
    value: function attachFormEvents(form) {
      var close = form.querySelector('.medium-editor-toolbar-close');
      var save = form.querySelector('.medium-editor-toolbar-save');
      var input = form.querySelector('.medium-editor-toolbar-input');

      this.base.on(form, 'click', this.handleFormClick.bind(this));
      this.base.on(input, 'keyup', this.handleTextboxKeyup.bind(this));
      this.base.on(close, 'click', this.handleCloseClick.bind(this));
      this.base.on(save, 'click', this.handleSaveClick.bind(this), true);
    }
  }, {
    key: 'createForm',
    value: function createForm() {
      var doc = this.base.options.ownerDocument;
      var form = doc.createElement('div');

      form.className = 'medium-editor-toolbar-form';
      form.id = 'medium-editor-toolbar-form-anchor-' + this.base.id;
      form.innerHTML = this.getTemplate();
      this.attachFormEvents(form);

      return form;
    }
  }, {
    key: 'getInput',
    value: function getInput() {
      return this.getForm().querySelector('input.medium-editor-toolbar-input');
    }
  }, {
    key: 'getTargetInput',
    value: function getTargetInput() {
      return this.getForm().querySelector('input.medium-editor-toolbar-anchor-target');
    }
  }, {
    key: 'handleTextboxKeyup',
    value: function handleTextboxKeyup(evt) {
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
  }, {
    key: 'handleFormClick',
    value: function handleFormClick(evt) {
      evt.stopPropagation();
    }
  }, {
    key: 'handleSaveClick',
    value: function handleSaveClick(evt) {
      evt.preventDefault();
      this.doFormSave();
    }
  }, {
    key: 'handleCloseClick',
    value: function handleCloseClick(evt) {
      evt.preventDefault();
      this.doFormCancel();
    }
  }, {
    key: 'getButton',
    value: function getButton() {
      return this.button;
    }
  }, {
    key: 'getTagNames',
    value: function getTagNames() {
      return typeof this.options.tagNames === 'function' ? this.options.tagNames(this.base.options) : this.options.tagNames;
    }
  }, {
    key: 'createButton',
    value: function createButton() {
      var button = this.base.options.ownerDocument.createElement('button');
      var content = this.options.contentDefault;
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
  }, {
    key: 'getAction',
    value: function getAction() {
      return typeof this.options.action === 'function' ? this.options.action(this.base.options) : this.options.action;
    }
  }, {
    key: 'getAria',
    value: function getAria() {
      return typeof this.options.aria === 'function' ? this.options.aria(this.base.options) : this.options.aria;
    }
  }, {
    key: 'isActive',
    value: function isActive() {
      return this.button.classList.contains(this.base.options.activeButtonClass);
    }
  }, {
    key: 'setInactive',
    value: function setInactive() {
      this.button.classList.remove(this.base.options.activeButtonClass);
      delete this.knownState;
    }
  }, {
    key: 'setActive',
    value: function setActive() {
      this.button.classList.add(this.base.options.activeButtonClass);
      delete this.knownState;
    }
  }, {
    key: 'queryCommandState',
    value: function queryCommandState() {
      var queryState = null;
      if (this.options.useQueryState) {
        queryState = this.base.queryCommandState(this.getAction());
      }
      return queryState;
    }
  }, {
    key: 'isAlreadyApplied',
    value: function isAlreadyApplied(node) {
      var isMatch = false;
      var tagNames = this.getTagNames();
      var styleVals = undefined;
      var computedStyle = undefined;

      if (this.knownState === false || this.knownState === true) {
        return this.knownState;
      }

      if (tagNames && tagNames.length > 0 && node.tagName) {
        isMatch = tagNames.indexOf(node.tagName.toLowerCase()) !== -1;
      }

      if (!isMatch && this.options.style) {
        styleVals = this.options.style.value.split('|');
        computedStyle = this.base.options.contentWindow.getComputedStyle(node, null).getPropertyValue(this.options.style.prop);
        styleVals.forEach(function (val) {
          if (!this.knownState) {
            isMatch = computedStyle.indexOf(val) !== -1;
            // text-decoration is not inherited by default
            // so if the computed style for text-decoration doesn't match
            // don't write to knownState so we can fallback to other checks
            if (isMatch || this.options.style.prop !== 'text-decoration') {
              this.knownState = isMatch;
            }
          }
        }, this);
      }

      return isMatch;
    }
  }]);

  return MediumEditorAnchorExtension;
})();

exports['default'] = MediumEditorAnchorExtension;
module.exports = exports['default'];