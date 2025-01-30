import {reactive} from "vue";
import {DATA} from '../assets/json.js';

export const FloorStore = reactive({
  floor: [],

  initFloor() {
    this.floor = Object.assign([], DATA());
    this.floor
      .map(entity => {
        // set parent id
        entity.children?.map(item => {
          item.parent_id = entity.id;
          return {
            ...item
          }
        })
        return {
          ...entity
        }
      })
  },

  get sections() {
    return this.floor?.filter(section => section.type === 'section') || [];
  },

  get labels() {
    const labels = [];
    // children labels
    this.floor.flatMap(entity =>
      entity.children?.filter(child => child.type === 'label') || []
    ).forEach((label) => labels.push(label));

    // labels
    this.floor.filter(entity => entity.type === 'label')
      .forEach((label) => labels.push(label));

    return labels
  },

  get barriers() {
    const barriers = [];
    // children barriers
    this.floor.flatMap(entity =>
      entity.children?.filter(child => child.type === 'barrier') || []
    ).forEach((barrier) => barriers.push(barrier));

    // barrier
    this.floor.filter(entity => entity.type === 'barrier')
      .forEach((barrier) => barriers.push(barrier));

    return barriers
  },

  get tables() {
    return this.floor
      ?.flatMap(entity =>
        entity.children?.filter(child => child.type === 'table') || []
      ) || []
  },
})