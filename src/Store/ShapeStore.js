import {reactive} from "vue";

export const ShapeStore = reactive({
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
      return
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

  shapeOverlapping(shape, target = null) {
    const shapeBounds = (shape.children?.[0] || shape).getClientRect();
    const items = [...this?.[target] || this.allShapes]
    for (let item of items) {
      if (shape?.id() === item?.id()) {
        continue;
      }
      const bounds = (item.children?.[0] || item).getClientRect();
      // TODO:
      //   This need to be fix (shapeBounds.x + shapeBounds.width) && (shapeBounds.y + shapeBounds.height)
      //   We have to get the pointer position (x, y) of mouse pointer and difference between edges of shape to know where the accurate spaces available

      const xIn = shapeBounds.x <= bounds.x + bounds.width && shapeBounds.x + shapeBounds.width >= bounds.x;
      const yIn = shapeBounds.y <= bounds.y + bounds.height && shapeBounds.y + shapeBounds.height >= bounds.y;

      if (xIn && yIn) {
        return item;
      }
    }

    return null
  },

  addOrEdit(shape, entity) {
    const index = this[entity].findIndex(entity => entity.id() === shape.id());
    if (index < 0) {
      this[entity].push(shape);
      console.log('Create', this[entity], this[entity][index])
      return
    }
    this[entity][index] = shape.clone();
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