// ES6
'use strict'
function extend(dest, src) {
  Object.keys(src).forEach((k) => {
    dest[k] = src[k]
  });
}

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
  }
};

export default class MediumEditorAnchorPreviewExtension {

  constructor(options) {
    // if this.parent = true, `this.base` become a reference to Medium Editor.
    this.previewValueSelector = 'i'
    this.parent = true;
    this.options = {
      name: 'anchor' ,
      action: 'createLink',
      aria: 'link',
      tagNames: ['a'],
      contentDefault:'<b>#</b>',
      contentFA: '<i class="fa fa-link"></i>',
      removeLabel: 'Remove',
      editLabel: 'Edit',
      hideDelay: 500,
      diffLeft: 20,
      limitPositonLeft: false,
      limitPositonRight: false
    };
    extend(this.options, options)
  }

  // invoke from MediumEditor
  init (instance) {
    this.base = instance;
    this.anchorPreview = this.createPreview()
    this.base.options.elementsContainer.appendChild(this.anchorPreview);
    this.attachToEditables();
  }

  getPreviewElement () {
    return this.anchorPreview
  }

  createPreview () {
    let el = this.base.options.ownerDocument.createElement('div');

    el.id = `medium-editor-anchor-preview-${this.base.id}`;
    el.className = 'medium-editor-anchor-preview';
    el.innerHTML = this.getTemplate();

    this.attachPreviewEvents(el)

    this.base.on(el, 'click', (e) => this.handleClick(e));

    return el
  }

  getTemplate () {
    let template = ''

    if (this.options.template) {
      template = this.options.template ;
    } else {
      template = `
        <div class="medium-editor-toolbar-anchor-preview" id="medium-editor-toolbar-anchor-preview">
          <i class="medium-editor-toolbar-anchor-preview-inner"></i>
          <button type="button" class="medium-editor-toolbar-anchor-preview-button medium-editor-toolbar-anchor-preview-button-edit">${this.options.editLabel}</button>
          <button type="button" class="medium-editor-toolbar-anchor-preview-button medium-editor-toolbar-anchor-preview-button-remove">${this.options.removeLabel}</button>
        </div>
      `;
    }
    return template
  }

  attachPreviewEvents (el) {
    let edit = el.querySelector('.medium-editor-toolbar-anchor-preview-button-edit');
    let remove = el.querySelector('.medium-editor-toolbar-anchor-preview-button-remove');

    this.base.on(edit, 'click', this.handleEditButtonClick.bind(this));
    this.base.on(remove, 'click', this.handleRemoveButtonClick.bind(this));
  }

  deactivate () {
    if (this.anchorPreview) {
      if (this.anchorPreview.parentNode) {
        this.anchorPreview.parentNode.removeChild(this.anchorPreview);
      }
      delete this.anchorPreview;
    }
  }

  hidePreview () {
    this.anchorPreview.classList.remove('medium-editor-anchor-preview-active');
    setTimeout(() => {
      this.anchorAnchor = null;
    }, this.options.hideDelay);
  }

  showPreview (anchorEl) {
    if (this.anchorPreview.classList.contains('medium-editor-anchor-preview-active') || anchorEl.getAttribute('data-disable-preview')) {
      return true;
    }

    if (this.previewValueSelector) {
      let a = this.anchorPreview.querySelector(this.previewValueSelector);
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

  positionPreview () {
    let buttonHeight = 40;
    let boundary = this.activeAnchor.getBoundingClientRect();
    let middleBoundary = (boundary.left + boundary.right) / 2;
    let halfOffsetWidth;
    let defaultLeft;
    let offsetLeft;
    halfOffsetWidth = this.anchorPreview.offsetWidth / 2;
    defaultLeft = this.base.options.diffLeft - halfOffsetWidth;

    this.anchorPreview.style.top = Math.round(buttonHeight + boundary.bottom - this.base.options.diffTop + this.base.options.contentWindow.pageYOffset - this.anchorPreview.offsetHeight) + 5 + 'px';

    if (middleBoundary < halfOffsetWidth) {
      offsetLeft = defaultLeft + halfOffsetWidth;
    } else if ((this.base.options.contentWindow.innerWidth - middleBoundary) < halfOffsetWidth) {
      offsetLeft = this.base.options.contentWindow.innerWidth + defaultLeft - halfOffsetWidth;
    } else {
      offsetLeft = defaultLeft + middleBoundary;
    }

    if (
      this.options.limitPositonLeft !== false
      && this.options.limitPositonLeft > offsetLeft
    ) {
      offsetLeft = this.options.limitPositonLeft
    }

    if (
      this.options.limitPositonRight !== false
      && this.options.limitPositonRight < offsetLeft + this.anchorPreview.offsetWidth
    ) {
      offsetLeft = this.options.limitPositonRight - this.anchorPreview.offsetWidth
    }

    this.anchorPreview.style.left = offsetLeft + 'px'
  }

  attachToEditables () {
    this.base.subscribe('editableMouseover', this.handleEditableMouseover.bind(this));
    this.base.subscribe('editableKeydown', this.handleEditableKeydown.bind(this));
  }

  handleRemoveButtonClick (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    let anchorExtension = this.base.getExtensionByName('anchor');
    if (this.anchorToPreview.tagName && this.anchorToPreview.tagName.toLowerCase() === 'a') {
      let range = this.base.options.ownerDocument.createRange()
      range.selectNodeContents(this.anchorToPreview)
      let win = this.base.options.contentWindow
      let sel = win.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      this.base.execAction('unlink');
      sel.removeAllRanges();
      if (win.getSelection) {
        if (win.getSelection().empty) {  // Chrome
          win.getSelection().empty();
        } else if (win.getSelection().removeAllRanges) {  // Firefox
          win.getSelection().removeAllRanges();
        }
      } else if (this.base.options.ownerDocument.selection) {  // IE?
        this.base.options.ownerDocument.selection.empty();
      }
    }
    this.hidePreview();
    this.base.delay( () => {
      if (this.base.toolbar) {
        this.base.toolbar.hideToolbar()
      }
    });
  }

  handleEditButtonClick (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    let anchorExtension = this.base.getExtensionByName('anchor');
    let activeAnchor = this.activeAnchor;

    if (anchorExtension && activeAnchor) {
      this.base.selectElement(this.activeAnchor);

      this.base.delay( () => {
        if (activeAnchor) {
          let targetValue = (activeAnchor.attributes.target && activeAnchor.attributes.target.nodeValue === '_blank');
          anchorExtension.showForm(activeAnchor.attributes.href.value, targetValue);
          activeAnchor = null;
        }
      });

      this.hidePreview();
    }
  }

  handleEditableKeydown () {
    if (this.activeAnchor) {
      this.base.delay( () => {
        if (this.activeAnchor) {
          this.activeAnchor = null;
        }
      });
      this.hidePreview();
    }
  }

  handleClick () {
    if (this.activeAnchor) {
      this.base.options.contentWindow.open(this.activeAnchor.href);
    }
  }

  handleAnchorMouseout () {
    //this.anchorToPreview = null;
    this.base.off(this.activeAnchor, 'mouseout', this.instance_handleAnchorMouseout);
    this.instance_handleAnchorMouseout = null;
  }

  handleEditableMouseover (evt) {
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

      this.instance_handleAnchorMouseout = this.handleAnchorMouseout.bind(this)
      this.base.on(this.anchorToPreview, 'mouseout', this.instance_handleAnchorMouseout);

      this.base.delay( () => {
        if (this.anchorToPreview)  {
          this.showPreview(this.anchorToPreview);
        }
      });
    }
  }

  handlePreviewMouseover () {
    this.lastOver = (new Date()).getTime();
    this.hovering = true;
  }

  handlePreviewMouseout (evt) {
    if (!evt.relatedTarget || !/anchor-preview/.test(evt.relatedTarget.className)) {
      this.hovering = false;
    }
  }

  updatePreview () {
    if (this.hovering) {
      return true;
    }

    var durr = (new Date()).getTime() - this.lastOver;
    if (durr > this.base.options.anchorPreviewHideDelay) {
      this.detachPreviewHandlers();
    }
  }

  detachPreviewHandlers () {
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

  attachPreviewHandlers () {
    this.lastOver = (new Date()).getTime();
    this.hovering = true;

    this.instance_handlePreviewMouseover = this.handlePreviewMouseover.bind(this);
    this.instance_handlePreviewMouseout = this.handlePreviewMouseout.bind(this);

    this.interval_timer = setInterval(this.updatePreview.bind(this), 200);

    this.base.on(this.anchorPreview, 'mouseover', this.instance_handlePreviewMouseover);
    this.base.on(this.anchorPreview, 'mouseout', this.instance_handlePreviewMouseout);
    this.base.on(this.activeAnchor, 'mouseover', this.instance_handlePreviewMouseover);
    this.base.on(this.activeAnchor, 'mouseout', this.instance_handlePreviewMouseout);

  }
}
