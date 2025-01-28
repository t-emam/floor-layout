import {reactive} from "vue";

const defaultFloorValues = [
  {
    "id": "SECTION_UUID_1",
    "type": "section",
    "name": "Out Door",
    "height": 650,
    "width": 400,
    "x": 200,
    "y": 103,
    "rotation": 0,
    "revenue_center": null,
    "children": [
      {
        "type": "table",
        "shape": "rect",
        "id": "SECTION_1_TABLE_UUID_1",
        "name": "Table 1",
        "number_of_seats": 10,
        "height": 160,
        "width": 160,
        "x": 10,
        "y": 10,
        "rotation": 0,
        "revenue_center": null
      },
      {
        "type": "table",
        "shape": "rect",
        "id": "SECTION_1_TABLE_UUID_2",
        "name": "Table 2",
        "number_of_seats": 8,
        "height": 160,
        "width": 160,
        "x": 230,
        "y": 10,
        "rotation": 0,
        "revenue_center": null
      },
      {
        "type": "table",
        "shape": "circle",
        "id": "SECTION_1_TABLE_UUID_3",
        "name": "Table 3",
        "number_of_seats": 5,
        "height": 200,
        "width": 200,
        "x": 130,
        "y": 340,
        "rotation": 0,
        "revenue_center": null
      },
      {
        "type": "label",
        "id": "SECTION_1_LABEL_UUID_1",
        "name": "Fountain",
        "height": 200,
        "width": 110,
        "x": 280,
        "y": 200,
        "rotation": 0,
        "bg_color": "#3e8ef6"
      },
      {
        "type": "barrier",
        "id": "SECTION_1_BARRIER_UUID_1",
        "height": 200,
        "width": 10,
        "x": 260,
        "y": 200,
        "rotation": 0,
        "bg_color": "#51e607"
      },
      {
        "type": "barrier",
        "id": "SECTION_1_BARRIER_UUID_2",
        "height": 10,
        "width": 110,
        "x": 280,
        "y": 410,
        "rotation": 0,
        "bg_color": "#f4c121"
      },

      {
        "type": "table",
        "shape": "rect",
        "id": "SECTION_1_TABLE_UUID_5",
        "name": "Table 5",
        "number_of_seats": 8,
        "height": 110,
        "width": 320,
        "x": 10,
        "y": 530,
        "rotation": 0,
        "revenue_center": null
      },
    ]
  },
  {
    "type": "label",
    "id": "LABEL_UUID_1",
    "name": "Pool",
    "height": 460,
    "width": 300,
    "x": 630,
    "y": 103,
    "rotation": 0,
    "bg_color": "#91a6ff"
  },
  {
    "type": "label",
    "id": "LABEL_UUID_2",
    "name": "Entrance",
    "height": 155,
    "width": 300,
    "x": 630,
    "y": 600,
    "rotation": 0,
    "bg_color": "#f48f41"
  },
  {
    "id": "SECTION_UUID_2",
    "type": "section",
    "name": "Indoor",
    "height": 650,
    "width": 540,
    "x": 963,
    "y": 103,
    "rotation": 0,
    "revenue_center": null,
    "children": [
      {
        "type": "table",
        "shape": "rect",
        "id": "SECTION_2_TABLE_UUID_1",
        "name": "Table 1",
        "number_of_seats": 4,
        "height": 220,
        "width": 150,
        "x": 10,
        "y": 10,
        "rotation": 0,
        "revenue_center": null
      },

      {
        "type": "table",
        "shape": "rect",
        "id": "SECTION_2_TABLE_UUID_3",
        "name": "Table 6",
        "number_of_seats": 6,
        "height": 120,
        "width": 330,
        "x": 200,
        "y": 10,
        "rotation": 0,
        "revenue_center": null
      },

      {
        "type": "table",
        "shape": "rect",
        "id": "SECTION_2_TABLE_UUID_3",
        "name": "Table 41",
        "number_of_seats": 6,
        "height": 320,
        "width": 120,
        "x": 410,
        "y": 190,
        "rotation": 0,
        "revenue_center": null
      },

      {
        "type": "table",
        "shape": "circle",
        "id": "SECTION_2_TABLE_UUID_2",
        "name": "Table 2",
        "number_of_seats": 4,
        "height": 200,
        "width": 200,
        "x": 120,
        "y": 390,
        "rotation": 0,
        "revenue_center": null
      },
      {
        "type": "label",
        "id": "SECTION_2_LABEL_UUID_1",
        "name": "TV Area",
        "height": 80,
        "width": 260,
        "x": 350,
        "y": 200,
        "rotation": 45,
        "bg_color": "#c6c6c6"
      },
      {
        "type": "barrier",
        "id": "SECTION_2_BARRIER_UUID_1",
        "height": 10,
        "width": 440,
        "x": 50,
        "y": 640,
        "bg_color": "#373636",
        "rotation": 0
      }
    ]
  }
]
export const FloorStore = reactive({
  floor: [],

  initFloor() {
    this.floor = Object.assign([], defaultFloorValues);
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

  findSectionById(id) {
    return this.floor.find(section => section.id === id);
  }
})