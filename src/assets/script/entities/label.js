const fabric = require('fabric').fabric;
const extend = fabric.util.object.extend;

/**
 * Label class
 * @class Label
 * @extends fabric.Group
 */
const Label = fabric.util.createClass(fabric.Group, {
  label: {
    fill: '#000',
    borderRadius: 2,
    width: 50,
    height: 20
  },
  icon: {
    fill: '#fff',
    fontFamily: 'Material Icons',
    fontSize: 14
  },
  selectable: false,
  text: {
    fill: '#fff',
    fontFamily: 'Roboto',
    fontSize: 14
  },
  type: 'label',
  
  // This is a workaround to make `findTarget` ignore this object
  evented: false,
  
  initialize(str, options = {}) {
    let objects;
    
    this.setOptions(options);
    
    objects = this._createLabelGroup(str, options);
    this.callSuper('initialize', objects, options);
    
    this.on('added', () => {
      this._onObjectAdded();
    });
  },
  
  setOptions(options) {
    options.icon = extend(this.icon, options.icon);
    options.label = extend(this.label, options.label);
    this.callSuper('setOptions', options);
  },
  
  _createLabelGroup(str, opts) {
    let label = new fabric.Rect({
      opacity: 0.5,
      fill: this.label.fill,
      rx: this.label.borderRadius,
      ry: this.label.borderRadius,
      left: this.left,
      top: this.top,
      width: this.label.width,
      height: this.label.height
    }),
        icon = !this.icon.icon ? null : new fabric.Text(this.icon.icon, {
      fill: this.icon.fill,
      fontFamily: this.icon.fontFamily,
      fontSize: this.icon.fontSize,
      left: label.left + 2,
      top: label.top + 5
    }),
        text = new fabric.Text(str, {
      fill: this.text.fill,
      fontFamily: this.text.fontFamily,
      fontSize: this.text.fontSize,
      left: icon ? icon.left + 20 : label.left + 2,
      top: label.top + 3
    });
    
    return [label,icon,text].filter(Boolean);
  },
  
  _onObjectAdded() {
    let textObjects = this.getObjects('text'),
        labelObject = this.getObjects('rect')[0],
        paddingRight = this.icon.icon ? 22 : 2,
        textWidth;
    
    textWidth = textObjects
      .map((text) => text.getWidth())
      .reduce((p, c) => p + c, 0);
    
    labelObject.set('width', textWidth + paddingRight);
    
    // @todo currently not working (when selected, label is behind)
    this.bringToFront();
  }
});

module.exports = Label;