import {reactive} from "vue";
import Konva from "konva";

/**
 * Shape Store - A reactive object to store Konva Stage and Layer elements.
 * This object holds references to the Konva Stage and Layer that can be
 * accessed reactively in Vue components.
 * @typedef {Object} ShapeStore
 * @property {Konva.Stage|null} stageEl - The Konva Stage element. Initially null.
 * @property {Konva.Layer|null} layerEl - The Konva Layer element. Initially null.
 *
 * @return {ShapeStore} - The reactive ShapeStore object.
 */
export const ShapeStore = reactive({
  stageEl: null,
  layerEl: null,
  sections: [],
  tables: [],
  labels: [],
  barriers: [],

  setShape(type = 'tables', shape) {
    this[type].push(shape);
  },

  setSectionChild(child, parentId) {
    const section = this.sections.find(entity => entity.attrs.id === parentId);
    if (!section || !parentId) {
      return;
    }

    section.add(child);
    section.clearCache();
  },

  resetShapes() {
    this.sections = [];
    this.tables = [];
    this.labels = [];
    this.barriers = [];
  },

  get allShapes() {
    return [
      ...this.sections,
      ...this.tables,
      ...this.labels,
      ...this.barriers,
    ]
  },

  get others() {
    return [
      ...this.tables,
      ...this.labels,
      ...this.barriers,
    ]
  },

  shapeOverlapping(shape, target = null) {
    let ignoreIds = shape?.children?.map(entity => entity.id());
    const shapeBounds = (shape.children?.[0] || shape).getClientRect();
    const items = [...this?.[target] || this.allShapes].filter(entity => !ignoreIds?.includes(entity?.id()));
    for (let item of items) {
      if (shape?.id() === item?.id()) {
        continue;
      }
      const bounds = (item?.children?.[0] || item).getClientRect();
      if (this.haveIntersection(shapeBounds, bounds)) {
        console.log('item',item, shapeBounds, bounds)
        return item;
      }
    }

    return null
  },

  haveIntersection(r1, r2) {
    return !(
      r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y
    );
  },

  addOrEdit(shape, entity) {
    const index = this[entity].findIndex(entity => entity.id() === shape.id());
    if (index < 0) {
      this[entity].push(shape);
      console.log('Create', this[entity], this[entity][index])
      return
    }
    this[entity][index] = shape;
    console.log('Update', this[entity], this[entity][index])
  },

  destroyShape(shape, entity) {
    const index = this[entity].findIndex(entity => !!entity && entity.id() === shape.id());
    if (index > -1) {
      this[entity][index] = null;
      delete this[entity][index];
    }
    shape.destroy();
    shape?.getLayer()?.batchDraw();
  }
})