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