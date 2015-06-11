// ES6
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var MediumEditorAnchorPreviewExtension = (function () {
  function MediumEditorAnchorPreviewExtension(_x, instance) {
    var id = arguments[0] === undefined ? null : arguments[0];

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
      contentFA: '<i class="fa fa-link"></i>'
    };
  }

  _createClass(MediumEditorAnchorPreviewExtension, [{
    key: 'init',

    // invoke from MediumEditor
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
      this.attachFormEvents(form);

      this.base.on(el, 'click', function (e) {
        return _this.handleClick(e);
      });
    }
  }, {
    key: 'getTemplate',
    value: function getTemplate() {
      var template = '';

      if (this.options.template) {
        template = this.options.template;
      } else {
        template = '\n        <div class="medium-editor-toolbar-anchor-preview" id="medium-editor-toolbar-anchor-preview">\n          <i class="medium-editor-toolbar-anchor-preview-inner"></i>\n        </div>\n      ';
      }
      return template;
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
      this.anchorPreview.classList.remove('medium-editor-anchor-preview-active');
      this.anchorPreview = null;
    }
  }, {
    key: 'showPreview',
    value: function showPreview(anchorEl) {
      if (this.anchorPreview.classList.contains('medium-editor-anchor-preview-active') || anchorEl.getAttribute('data-disable-preview')) {
        return true;
      }

      if (this.previewValueSelector) {
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
      var boundry = this.activeAnchor.getBoundingClientRect();
      var middleBoundary = (boundry.left + boundry.right) / 2;
      var halfOffsetWidth = undefined;
      var defaultLeft = undefined;

      halfOffsetWidth = this.anchorPreview.offsetWidth / 2;
      defaultLeft = this.base.options.diffLeft - halfOffsetWidth;

      this.anchorPreview.style.top = Math.round(buttonHeight + boundary.bottom - this.base.options.diffTop + this.base.options.contentWindow.pageYOffset - this.anchorPreview.offsetHeight) + 'px';

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
      var _this2 = this;

      this.base.subscribe('editableMouseover', function (e) {
        return _this2.handleEditableMouseover(e);
      });
    }
  }, {
    key: 'handleClick',
    value: function handleClick() {
      var anchorExtension = this.base.getExtensionByName('anchor');
      var activeAnchor = this.activeAnchor;

      if (anchorExtension && activeAnchor) {
        this.base.selectedParentElement(this.activeAnchor);

        this.base.delay(function () {
          if (activeAnchor) {
            anchorExtension.showForm(activeAnchor.attributes.href.value);
            activeAnchor = null;
          }
        });

        this.hidePreview();
      }
    }
  }, {
    key: 'handleAnchorMouseout',
    value: function handleAnchorMouseout() {
      this.anchorPreview = null;
      this.base.off(this.activeAnchor, 'mouseout', this.instance_handleAnchorMouseout);
      this.instance_handleAnchorMouseout = null;
    }
  }, {
    key: 'handleEditableMouseover',
    value: function handleEditableMouseover(evt) {
      var _this3 = this;

      if (evt.target && evt.target.tagName.toLowerCase() === 'a') {
        if (!/href=["']\S+["']/.test(event.target.outerHTML) || /href=["']#\S+["']/.test(event.target.outerHTML)) {
          return true;
        }

        if (this.base.toolbar && this.base.toolbar.isDisplayed()) {
          return null;
        }

        this.anchorPreview = evt.target;

        this.instance_handleAnchorMouseout = this.handleAnchorMouseout.bind(this);
        this.base.on(this.anchorPreview, 'mouseout', this.instance_handleAnchorMouseout);

        this.base.delay(function () {
          if (_this3.anchorPreview) {
            _this3.showPreview(_this3.anchorPreview);
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
        this.base.off(this.anchorPreview, 'mouseout', this.instance_handleAnchorMouseout);
        if (this.activeAnchor) {
          this.base.off(this.activeAnchor, 'mouseover', this.instance_handlePreviewMouseover);
          this.base.off(this.activeAnchor, 'mouseout', this.instance_handleAnchorMouseout);
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

      this.instance_handlePreviewMouseover = this.handleEditableMouseover.bind(this);
      this.instance_handleAnchorMouseout = this.handleEditableMouseout.bind(this);

      this.interval_timer = setInterval(this.updatePreview.bind(this), 200);

      this.base.on(this.anchorPreview, 'mouseover', this.instance_handlePreviewMouseover);
      this.base.on(this.anchorPreview, 'mouseout', this.instance_handleAnchorMouseout);
      this.base.on(this.activeAnchor, 'mouseover', this.instance_handlePreviewMouseover);
      this.base.on(this.activeAnchor, 'mouseout', this.instance_handleAnchorMouseout);
    }
  }]);

  return MediumEditorAnchorPreviewExtension;
})();

exports['default'] = MediumEditorAnchorPreviewExtension;
module.exports = exports['default'];