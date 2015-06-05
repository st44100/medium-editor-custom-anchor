// ES6
'use strict'

export default class MediumEditorAnchorExtension {

  constructor(id = null, instance) {
    // if this.parent = true, `this.base` become a reference to Medium Editor.
    this.previewValueSelector = 'i'
    this.parent = true;
    this.options = {
      name: 'anchor' ,
      action: 'createLink',
      aria: 'link',
      tagNames: ['a'],
      contentDefault:'<b>#</b>',
      contentFA: '<i class="fa fa-link"></i>'
    };
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
    this.attachFormEvents(form);

    this.base.on(el, 'click', (e) => this.handleClick(e));
  }

  getTemplate () {
    let template = ''

    if (this.options.template) {
      template = this.options.template ;
    } else {
      template = `
        <div class="medium-editor-toolbar-anchor-preview" id="medium-editor-toolbar-anchor-preview">
          <i class="medium-editor-toolbar-anchor-preview-inner"></i>
        </div>
      `;
    }
    return template
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
    this.anchorPreview = null;
  }

  showPreview (anchorEl) {
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

  positionPreview () {
    let buttonHeight = 40;
    let boundry = this.activeAnchor.getBoundingClientRect();
    let middleBoundary = (boundry.left + boundry.right) / 2;
    let halfOffsetWidth;
    let defaultLeft;

    halfOffsetWidth = this.anchorPreview.offsetWidth / 2;
    defaultLeft = this.base.options.diffLeft - halfOffsetWidth;

    this.anchorPreview.style.top = Math.round(buttonHeight + boundary.bottom - this.base.options.diffTop + this.base.options.contentWindow.pageYOffset - this.anchorPreview.offsetHeight) + 'px';

    if (middleBoundary < halfOffsetWidth) {
      this.anchorPreview.style.left = defaultLeft + halfOffsetWidth + 'px';
    } else if ((this.base.options.contentWindow.innerWidth - middleBoundary) < halfOffsetWidth) {
      this.anchorPreview.style.left = this.base.options.contentWindow.innerWidth + defaultLeft - halfOffsetWidth + 'px';
    } else {
      this.anchorPreview.style.left = defaultLeft + middleBoundary + 'px';
    }
  }

  attachToEditables () {
    this.base.subscribe('editableMouseover', (e) => this.handleEditableMouseover(e));
  }

  handleClick () {
    let anchorExtension = this.base.getExtensionByName('anchor');
    let activeAnchor = this.activeAnchor;

    if (anchorExtension && activeAnchor) {
      this.base.selectedParentElement(this.activeAnchor);

      this.base.delay( => {
        if (activeAnchor) {
          anchorExtension.showForm(activeAnchor.attributes.href.value);
          activeAnchor = null;
        }
      });

      this.hidePreview();
    }
  }

  handleAnchorMouseout () {
    this.anchorPreview = null;
    this.base.off(this.activeAnchor, 'mouseout', this.instance_handleAnchorMouseout);
    this.instance_handleAnchorMouseout = null;
  }

  handleEditableMouseover (evt) {
    if (evt.target && evt.target.tagName.toLowerCase() === 'a') {
      if (!/href=["']\S+["']/.test(event.target.outerHTML) || /href=["']#\S+["']/.test(event.target.outerHTML)) {
        return true;
      }

      if (this.base.toolbar && this.base.toolbar.isDisplayed()) {
        return null;
      }

      this.anchorPreview = evt.target;

      this.instance_handleAnchorMouseout = this.handleAnchorMouseout.bind(this)
      this.base.on(this.anchorPreview, 'mouseout', this.instance_handleAnchorMouseout);

      this.base.delay( => {
        if (this.anchorPreview)  {
          this.showPreview(this.anchorPreview);
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
      this.base.off(this.anchorPreview, 'mouseout', this.instance_handleAnchorMouseout);
      if (this.activeAnchor) {
        this.base.off(this.activeAnchor, 'mouseover', this.instance_handlePreviewMouseover);
        this.base.off(this.activeAnchor, 'mouseout', this.instance_handleAnchorMouseout);
      }
    }
    this.hidePreview();

    this.hovering = this.instance_handlePreviewMouseover = this.instance_handleAnchorMouseout = null;
  }

  attachPreviewHandlers () {
    this.lastOver = (new Date()).getTime();
    this.hovering = true;

    this.instance_handlePreviewMouseover = this.handleEditableMouseover.bind(this);
    this.instance_handleAnchorMouseout = this.handleEditableMouseout.bind(this);

    this.interval_timer = setInterval(this.updatePreview.bind(this), 200);

    this.base.on(this.anchorPreview, 'mouseover', this.instance_handlePreviewMouseover);
    this.base.on(this.anchorPreview, 'mouseout', this.instance_handleAnchorMouseout);
    this.base.on(this.activeAnchor, 'mouseover', this.instance_handlePreviewMouseover);
    this.base.on(this.activeAnchor, 'mouseout', this.instance_handleAnchorMouseout);

  }
}
