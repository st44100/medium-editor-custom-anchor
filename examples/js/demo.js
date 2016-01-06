(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// ES6
'use strict';
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

var MediumEditorAnchorPreviewExtension = (function () {
  function MediumEditorAnchorPreviewExtension(options) {
    _classCallCheck(this, MediumEditorAnchorPreviewExtension);

    // if this.parent = true, `this.base` become a reference to Medium Editor.
    this.previewValueSelector = 'i';
    this.parent = true;
    this.options = {
      name: 'anchor',
      action: 'createLink',
      aria: 'link',
      tagNames: ['a'],
      contentDefault: '<b>#</b>',
      contentFA: '<i class="fa fa-link"></i>',
      removeLabel: 'Remove',
      editLabel: 'Edit',
      hideDelay: 500,
      diffLeft: 20
    };
    extend(this.options, options);
  }

  // invoke from MediumEditor

  _createClass(MediumEditorAnchorPreviewExtension, [{
    key: 'init',
    value: function init(instance) {
      this.base = instance;
      this.anchorPreview = this.createPreview();
      this.base.options.elementsContainer.appendChild(this.anchorPreview);
      this.attachToEditables();
    }
  }, {
    key: 'getPreviewElement',
    value: function getPreviewElement() {
      return this.anchorPreview;
    }
  }, {
    key: 'createPreview',
    value: function createPreview() {
      var _this = this;

      var el = this.base.options.ownerDocument.createElement('div');

      el.id = 'medium-editor-anchor-preview-' + this.base.id;
      el.className = 'medium-editor-anchor-preview';
      el.innerHTML = this.getTemplate();

      this.attachPreviewEvents(el);

      this.base.on(el, 'click', function (e) {
        return _this.handleClick(e);
      });

      return el;
    }
  }, {
    key: 'getTemplate',
    value: function getTemplate() {
      var template = '';

      if (this.options.template) {
        template = this.options.template;
      } else {
        template = '\n        <div class="medium-editor-toolbar-anchor-preview" id="medium-editor-toolbar-anchor-preview">\n          <i class="medium-editor-toolbar-anchor-preview-inner"></i>\n          <button type="button" class="medium-editor-toolbar-anchor-preview-button medium-editor-toolbar-anchor-preview-button-edit">' + this.options.editLabel + '</button>\n          <button type="button" class="medium-editor-toolbar-anchor-preview-button medium-editor-toolbar-anchor-preview-button-remove">' + this.options.removeLabel + '</button>\n        </div>\n      ';
      }
      return template;
    }
  }, {
    key: 'attachPreviewEvents',
    value: function attachPreviewEvents(el) {
      var edit = el.querySelector('.medium-editor-toolbar-anchor-preview-button-edit');
      var remove = el.querySelector('.medium-editor-toolbar-anchor-preview-button-remove');

      this.base.on(edit, 'click', this.handleEditButtonClick.bind(this));
      this.base.on(remove, 'click', this.handleRemoveButtonClick.bind(this));
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      if (this.anchorPreview) {
        if (this.anchorPreview.parentNode) {
          this.anchorPreview.parentNode.removeChild(this.anchorPreview);
        }
        delete this.anchorPreview;
      }
    }
  }, {
    key: 'hidePreview',
    value: function hidePreview() {
      var _this2 = this;

      this.anchorPreview.classList.remove('medium-editor-anchor-preview-active');
      setTimeout(function () {
        _this2.anchorAnchor = null;
      }, this.options.hideDelay);
    }
  }, {
    key: 'showPreview',
    value: function showPreview(anchorEl) {
      if (this.anchorPreview.classList.contains('medium-editor-anchor-preview-active') || anchorEl.getAttribute('data-disable-preview')) {
        return true;
      }

      if (this.previewValueSelector) {
        var a = this.anchorPreview.querySelector(this.previewValueSelector);
        this.anchorPreview.querySelector(this.previewValueSelector).textContent = anchorEl.attributes.href.value;
      }
      this.anchorPreview.classList.remove('medium-toolbar-arrow-over');
      this.anchorPreview.classList.remove('medium-toolbar-arrow-under');

      if (!this.anchorPreview.classList.contains('medium-editor-anchor-preview-active')) {
        this.anchorPreview.classList.add('medium-editor-anchor-preview-active');
      }

      this.activeAnchor = anchorEl;
      this.positionPreview();
      this.attachPreviewHandlers();

      return this;
    }
  }, {
    key: 'positionPreview',
    value: function positionPreview() {
      var buttonHeight = 40;
      var boundary = this.activeAnchor.getBoundingClientRect();
      var middleBoundary = (boundary.left + boundary.right) / 2;
      var halfOffsetWidth = undefined;
      var defaultLeft = undefined;

      halfOffsetWidth = this.anchorPreview.offsetWidth / 2;
      defaultLeft = this.base.options.diffLeft - halfOffsetWidth;

      this.anchorPreview.style.top = Math.round(buttonHeight + boundary.bottom - this.base.options.diffTop + this.base.options.contentWindow.pageYOffset - this.anchorPreview.offsetHeight) + 5 + 'px';

      if (middleBoundary < halfOffsetWidth) {
        this.anchorPreview.style.left = defaultLeft + halfOffsetWidth + 'px';
      } else if (this.base.options.contentWindow.innerWidth - middleBoundary < halfOffsetWidth) {
        this.anchorPreview.style.left = this.base.options.contentWindow.innerWidth + defaultLeft - halfOffsetWidth + 'px';
      } else {
        this.anchorPreview.style.left = defaultLeft + middleBoundary + 'px';
      }
    }
  }, {
    key: 'attachToEditables',
    value: function attachToEditables() {
      this.base.subscribe('editableMouseover', this.handleEditableMouseover.bind(this));
      this.base.subscribe('editableKeydown', this.handleEditableKeydown.bind(this));
    }
  }, {
    key: 'handleRemoveButtonClick',
    value: function handleRemoveButtonClick(evt) {
      var _this3 = this;

      evt.preventDefault();
      evt.stopPropagation();
      var anchorExtension = this.base.getExtensionByName('anchor');
      if (this.anchorToPreview.tagName && this.anchorToPreview.tagName.toLowerCase() === 'a') {
        var range = this.base.options.ownerDocument.createRange();
        range.selectNodeContents(this.anchorToPreview);
        var win = this.base.options.contentWindow;
        var sel = win.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        this.base.execAction('unlink');
        sel.removeAllRanges();
        if (win.getSelection) {
          if (win.getSelection().empty) {
            // Chrome
            win.getSelection().empty();
          } else if (win.getSelection().removeAllRanges) {
            // Firefox
            win.getSelection().removeAllRanges();
          }
        } else if (this.base.options.ownerDocument.selection) {
          // IE?
          this.base.options.ownerDocument.selection.empty();
        }
      }
      this.hidePreview();
      this.base.delay(function () {
        if (_this3.base.toolbar) {
          _this3.base.toolbar.hideToolbar();
        }
      });
    }
  }, {
    key: 'handleEditButtonClick',
    value: function handleEditButtonClick(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      var anchorExtension = this.base.getExtensionByName('anchor');
      var activeAnchor = this.activeAnchor;

      if (anchorExtension && activeAnchor) {
        this.base.selectElement(this.activeAnchor);

        this.base.delay(function () {
          if (activeAnchor) {
            var targetValue = activeAnchor.attributes.target && activeAnchor.attributes.target.nodeValue === '_blank';
            anchorExtension.showForm(activeAnchor.attributes.href.value, targetValue);
            activeAnchor = null;
          }
        });

        this.hidePreview();
      }
    }
  }, {
    key: 'handleEditableKeydown',
    value: function handleEditableKeydown() {
      var _this4 = this;

      if (this.activeAnchor) {
        this.base.delay(function () {
          if (_this4.activeAnchor) {
            _this4.activeAnchor = null;
          }
        });
        this.hidePreview();
      }
    }
  }, {
    key: 'handleClick',
    value: function handleClick() {
      if (this.activeAnchor) {
        this.base.options.contentWindow.open(this.activeAnchor.href);
      }
    }
  }, {
    key: 'handleAnchorMouseout',
    value: function handleAnchorMouseout() {
      //this.anchorToPreview = null;
      this.base.off(this.activeAnchor, 'mouseout', this.instance_handleAnchorMouseout);
      this.instance_handleAnchorMouseout = null;
    }
  }, {
    key: 'handleEditableMouseover',
    value: function handleEditableMouseover(evt) {
      var _this5 = this;

      if (evt.target && evt.target.tagName.toLowerCase() === 'a') {
        if (!/href=["']\S+["']/.test(evt.target.outerHTML) || /href=["']#\S+["']/.test(evt.target.outerHTML)) {
          return true;
        }

        if (this.base.toolbar && this.base.toolbar.isDisplayed()) {
          return true;
        }

        if (this.activeAnchor && this.activeAnchor !== evt.target) {
          this.detachPreviewHandlers();
        }

        this.anchorToPreview = evt.target;

        this.instance_handleAnchorMouseout = this.handleAnchorMouseout.bind(this);
        this.base.on(this.anchorToPreview, 'mouseout', this.instance_handleAnchorMouseout);

        this.base.delay(function () {
          if (_this5.anchorToPreview) {
            _this5.showPreview(_this5.anchorToPreview);
          }
        });
      }
    }
  }, {
    key: 'handlePreviewMouseover',
    value: function handlePreviewMouseover() {
      this.lastOver = new Date().getTime();
      this.hovering = true;
    }
  }, {
    key: 'handlePreviewMouseout',
    value: function handlePreviewMouseout(evt) {
      if (!evt.relatedTarget || !/anchor-preview/.test(evt.relatedTarget.className)) {
        this.hovering = false;
      }
    }
  }, {
    key: 'updatePreview',
    value: function updatePreview() {
      if (this.hovering) {
        return true;
      }

      var durr = new Date().getTime() - this.lastOver;
      if (durr > this.base.options.anchorPreviewHideDelay) {
        this.detachPreviewHandlers();
      }
    }
  }, {
    key: 'detachPreviewHandlers',
    value: function detachPreviewHandlers() {
      clearInterval(this.interval_timer);
      if (this.instance_handlePreviewMouseover) {
        this.base.off(this.anchorPreview, 'mouseover', this.instance_handlePreviewMouseover);
        this.base.off(this.anchorPreview, 'mouseout', this.instance_handlePreviewMouseout);
        if (this.activeAnchor) {
          this.base.off(this.activeAnchor, 'mouseover', this.instance_handlePreviewMouseover);
          this.base.off(this.activeAnchor, 'mouseout', this.instance_handlePreviewMouseout);
        }
      }
      this.hidePreview();

      this.hovering = this.instance_handlePreviewMouseover = this.instance_handleAnchorMouseout = null;
    }
  }, {
    key: 'attachPreviewHandlers',
    value: function attachPreviewHandlers() {
      this.lastOver = new Date().getTime();
      this.hovering = true;

      this.instance_handlePreviewMouseover = this.handlePreviewMouseover.bind(this);
      this.instance_handlePreviewMouseout = this.handlePreviewMouseout.bind(this);

      this.interval_timer = setInterval(this.updatePreview.bind(this), 200);

      this.base.on(this.anchorPreview, 'mouseover', this.instance_handlePreviewMouseover);
      this.base.on(this.anchorPreview, 'mouseout', this.instance_handlePreviewMouseout);
      this.base.on(this.activeAnchor, 'mouseover', this.instance_handlePreviewMouseover);
      this.base.on(this.activeAnchor, 'mouseout', this.instance_handlePreviewMouseout);
    }
  }]);

  return MediumEditorAnchorPreviewExtension;
})();

exports['default'] = MediumEditorAnchorPreviewExtension;
module.exports = exports['default'];
},{}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
var MediumEditorAnchorExtension, MediumEditorAnchorPreviewExtension, anchor, anchorPreview, editor;

MediumEditorAnchorExtension = require('../../dist/medium-editor-custom-anchor.js');

MediumEditorAnchorPreviewExtension = require('../../dist/medium-editor-custom-anchor-preview.js');

anchor = new MediumEditorAnchorExtension({
  template: "<form name=\"blockImageAnchorForm\" novalidate=\"novalidate\" class=\"medium-editor-anchor-form pure-form\" onsubmit=\"return false;\">\n  <fieldset>\n    <input class=\"medium-editor-toolbar-input\" type=\"url\" id=\"url\" name=\"link\" />\n    <label class=\"\" for=\"checkbox-1\">\n      <input type=\"checkbox\" id=\"checkbox-1\" class=\"medium-editor-toolbar-anchor-target\" checked />\n      <span class=\"\">New Window</span>\n    </label>\n    <section class=\"toolbar\">\n    <button type=\"button\" class=\"medium-editor-toolbar-close\">Cancel</button>\n    <button type=\"button\" class=\"medium-editor-toolbar-save\">OK</button>\n    </section>\n  </fieldset\n</form>"
});

anchorPreview = new MediumEditorAnchorPreviewExtension({
  removeLabel: 'Delete',
  editLabel: 'Edit'
});

editor = new MediumEditor('.editable', {
  buttonLabels: 'fontawesome',
  extensions: {
    anchor: anchor,
    'anchor-preview': anchorPreview
  }
});


},{"../../dist/medium-editor-custom-anchor-preview.js":1,"../../dist/medium-editor-custom-anchor.js":2}]},{},[3]);
