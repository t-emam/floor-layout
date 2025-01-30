import {reactive} from "vue";
import Konva from "konva";

/**
 * Shape Store - A reactive object to store Konva Stage, Layer and shapes elements.
 * @typedef {Object} ShapeStore
 * @property {Konva.Stage} stageEl.getNode() - The Konva Stage element. Initially null.
 * @property {Konva.Layer} layerEl.getNode() - The Konva Layer element. Initially null.
 *
 * @return {ShapeStore} - The reactive ShapeStore object.
 */
export const ShapeStore = reactive({
  stageEl: null,
  layerEl: null,

  /**
   * Set Child Shape to Section Parent
   * @param child
   * @param parentId
   */
  setSectionChild(child, parentId) {
    const section = this.layerSections.find(entity => entity.id() === parentId);
    if (!section || !parentId) {
      return;
    }

    section.add(child);
    section.clearCache();
  },

  /**
   * Layer Sections
   * @returns Konva.Group[]
   */
  get layerSections() {
    return this.layerEl.children.filter(child => child.attrs.type === 'section')
  },

  /**
   * Layer Shapes
   * @returns Konva.Group[]
   */
  get layerShapes() {
    const shapes = [];
    [...this.layerSections].forEach(section => {
      section.children
        .filter(child => !!child.attrs.type)
        .forEach((child) => {
          shapes.push(child)
        })
    })

    return shapes
  },

  /**
   * Get Shapes type Table
   * @returns Konva.Group[]
   */
  get tables(){
    return this.layerShapes.filter(shape => shape.attrs.type === 'table')
  },

  /**
   * Get Shapes type Labels
   * @returns Konva.Group[]
   */
  get labels(){
    return this.layerShapes.filter(shape => shape.attrs.type === 'label')
  },

  /**
   * Layer All Children's
   * @returns Konva.Group[]
   */
  get layerChildren() {
    return [
      ...this.layerSections,
      ...this.layerShapes,
    ]
  },

  /**
   * Shape Overlapping check
   * @param shape
   * @param target <string>: 'sections' | 'others' | 'all'
   * @returns {null | ovelappingItem: Konva.Group}
   */
  shapeOverlapping(shape, target = 'all') {
    shape.clearCache();
    const shapeBounds = (shape.children?.[0] || shape)?.getClientRect();

    let shapes = []
    if (target === 'sections') {
      shapes = this.layerSections;
    } else if (target === 'others') {
      shapes = this.layerShapes;
    } else if (target === 'all') {
      shapes = this.layerChildren;
    }
    return shapes.filter(node => node.id() !== shape.id())
      .find(node => Konva.Util.haveIntersection(shapeBounds, (node.children?.[0] || node)?.getClientRect({relativeTo:shape})))
  },

  haveIntersection(r1, r2) {
    return !(
      r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y
    );
  },

  /**
   * Destroy Shape
   * @param shape
   */
  destroyShape(shape) {
    shape.destroy();
    console.log('destroyed', shape)
    this.layerEl?.getLayer()?.batchDraw();
  },

  /**
   * Set Cursor Not Allowed till 1 second
   * @return {*}
   */
  setCursorNotAllowed() {
    this.stageEl.container().style.cursor = 'not-allowed';
    return setTimeout(()=>{
      this.stageEl.container().style.cursor = 'pointer';
    }, 1000);
  },

  /**
   * Set Table Seat Radius
   * @param config
   * @returns {number}
   */
  seatRadius(config) {
    window.ShapeStore = this;
    return Math.max(5 + (10 - config.number_of_seats / config.width * 100), 8);
  }

})