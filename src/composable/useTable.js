import Konva from 'konva';
import {ref} from "vue";
import {ShapeStore} from '../Store/ShapeStore.js';

export const useTable = ({setCursor, stageEl, layerEl}) => {

  const tempPosition = ref(null)
  const transform = ref(null)

  const onTableTransformStart = () => {
  }

  const onTableTransformEnd = () => {
  }


  const onTableDragStart = (event, table) => {
    tempPosition.value = event.currentTarget.getPosition()
    table.moveToTop();
    transform.value.moveToTop()
  }

  const onTableDragEnd = async (event, table) => {
    event.evt.preventDefault();
    table.children[0].fill('#fff');

    // overlapping section
    const sectionOverlapping = ShapeStore.shapeOverlapping(table, 'sections');
    if (!sectionOverlapping) { // destroy o return to the previous position
      return !tempPosition?.value ? ShapeStore.destroyShape(table, 'tables') : table.setPosition(tempPosition.value);
    }

    if (sectionOverlapping.id() !== table.parent.id()) {
      const {x: sectionX, y: sectionY} = sectionOverlapping.getPosition();
      const {x: eventX, y: eventY} = event.evt
      ShapeStore.setSectionChild(table, sectionOverlapping.id());

      const offsetX = eventX - sectionX - table.getWidth() / 2;
      const offsetY = eventY - sectionY - table.getHeight() / 2;
      table.setPosition({x: offsetX, y: offsetY});
    }

    // overlapping table
    const tableOverlapping = ShapeStore.shapeOverlapping(table, 'tables');
    const barrierOverlapping = ShapeStore.shapeOverlapping(table, 'barriers');
    const labelOverlapping = ShapeStore.shapeOverlapping(table, 'labels');

    if (tableOverlapping && tableOverlapping?.id() !== table?.id() ||
      barrierOverlapping ||
      labelOverlapping
    ) {
      table.children[0].fill('red');
      return
    }

    table.getLayer()?.batchDraw();
    ShapeStore.addOrEdit(table, 'tables');
  }

  const buildTable = (attrs) => {
    const group = new Konva.Group({
      id: attrs.id,
      x: attrs?.x,
      y: attrs?.y,
      width: attrs.width,
      height: attrs.height,
      type: attrs.type,
      parent_id: attrs.parent_id,
      name: 'table-group',
      draggable: true,
    });

    let table = null;
    const tableConfig = {
      id: attrs.id,
      width: attrs.width,
      height: attrs.height,
      fill: '#fff',
      stroke: '#ccc',
      strokeWidth: 1,
    }

    if (attrs.shape === 'circle') {
      table = new Konva.Circle({
        ...tableConfig,
        radiusX: attrs.width / 2,
        heightY: attrs.height / 2,
      });
    } else {
      table = new Konva.Rect(tableConfig);
    }

    const text = new Konva.Text({
      text: attrs.name,
      height: 20,
      fontSize: 14,
      fontFamily: 'Roboto',
      fill: 'black',
      align: 'center',
      verticalAlign: 'middle',
    });

    if (attrs.shape === 'rect') {
      text.x(attrs.width / 2 - text.width() / 2);
      text.y(attrs.height / 2 - text.height() / 2);
    } else if (attrs.shape === 'circle') {
      const radius = attrs.width / 2;
      text.x(radius - text.width() / 2 - 20);
      text.y(radius - text.height() / 2 - 17);
    }

    group.add(table);
    group.add(text);

    group.on('transformstart', (event) => onTableTransformStart(event, group));
    group.on('transformend', (event) => onTableTransformEnd(event, group));

    group.on('dragstart', (event) => onTableDragStart(event, group))
    group.on('dragend', (event) => onTableDragEnd(event, group))

    ShapeStore.setShape('tables', group);


    // transform
    transform.value = new Konva.Transformer();
    transform.value.nodes([group]);
    layerEl.value.getNode().add(transform.value);

    layerEl.value.getNode().add(group);
    layerEl.value.getNode().batchDraw();
    return group;
  };

  return {
    buildTable,
    onTableDragStart,
    onTableDragEnd
  };
};
