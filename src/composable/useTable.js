import Konva from 'konva';
import {useTransformer} from "../composable/useTransformer.js";
import {nextTick, ref} from "vue";
import {useChair} from './useChair.js';
import {ShapeStore} from '../Store/ShapeStore.js';

export const useTable = ({setCursor, stageEl, layerEl}) => {

  const tempPosition = ref(null);

  /**
   * Handle on Table Drag Start event listener
   * @param event
   * @param table
   */
  const onTableDragStart = (event, table) => {
    tempPosition.value = event.currentTarget.getPosition();
    table.moveToTop();
  }

  /**
   * Handle on Table Drag End event listener
   * @param event
   * @param table
   * @returns {Promise<*>}
   */
  const onTableDragEnd = async (event, table) => {
    event?.evt?.preventDefault();
    table.clearCache();
    table.moveToTop();
    table.findOne('.table').fill('#fff');

    // overlapping section
    const sectionOverlapping = ShapeStore.shapeOverlapping(table, 'sections');
    if (!sectionOverlapping) { // destroy o return to the previous position
      if (table.attrs?.is_new) {
        return ShapeStore.destroyShape(table, 'tables')
      }

      return nextTick(() => {
        table.setPosition(tempPosition.value);
        table.moveToTop();
      })
    }

    if (!!sectionOverlapping && sectionOverlapping.id() !== table.parent.id()) {
      const {x: sectionX, y: sectionY} = sectionOverlapping.getPosition();
      const {layerX: eventX, layerY: eventY} = event.evt
      sectionOverlapping.add(table);
      ShapeStore.setSectionChild(table, sectionOverlapping.id());

      await nextTick(() => {
        const offsetX = eventX - sectionX - table.getWidth() / 2;
        const offsetY = eventY - sectionY - table.getHeight() / 2;
        table.setPosition({x: offsetX, y: offsetY});
        if (table.parent.id() === sectionOverlapping.id()) {
          table.parent.moveToBottom()
          table.parent.getLayer()?.batchDraw();
          table.parent.clearCache();
        }
      })
    }

    const othersTable = ShapeStore.shapeOverlapping(table, 'others');
    if (!!othersTable) {
      table.findOne('.table').fill('red');
      return
    }

    delete table.attrs.is_new;
    table.getLayer()?.batchDraw();
    ShapeStore.addOrEdit(table, 'tables');
    return nextTick(() => {
      table.moveToTop();
    })
  }

  /**
   * Build Table Shape handler
   * @param attrs
   * @returns {any}
   */
  const buildTable = (attrs) => {
    const group = new Konva.Group({
      id: attrs.id,
      x: attrs?.x,
      y: attrs?.y,
      width: attrs.width,
      height: attrs.height,
      type: attrs.type,
      shape: attrs.shape,
      parent_id: attrs.parent_id,
      name: 'table-group',
      draggable: true,
      number_of_seats: attrs.number_of_seats
    });

    let table = null;
    const tableConfig = {
      id: attrs.id,
      width: attrs.width,
      height: attrs.height,
      fill: '#fff',
      stroke: '#ccc',
      strokeWidth: 1,
      name: 'table'
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

    ///const {calculatePositions} = useChair(group.attrs)
    // const seats = calculatePositions();
    // seats.forEach((seat) => {
    //   const chair = new Konva.Rect({
    //     x: seat.x,
    //     y: seat.y,
    //     width: seat.width,
    //     height: seat.height,
    //     stroke:'#000',
    //     strokeWidth:2
    //   })
    //   group.add(chair);
    // })
    // console.log({seats})

    const {getSeats} = useChair(group.attrs)
    let seats = getSeats()

    seats.forEach(seat => {
      group.add(seat);
    })


    group.on('dragstart', (event) => onTableDragStart(event, group))
    group.on('dragend', (event) => onTableDragEnd(event, group))
    // group.on('transformend', (event) => onTableDragEnd(event, group))

    const {buildTransform} = useTransformer();
    buildTransform(group);

    ShapeStore.layerEl.getNode().add(group);
    ShapeStore.layerEl.getNode().batchDraw();

    ShapeStore.setShape('tables', group);
    return group;
  };

  return {
    buildTable,
    onTableDragStart,
    onTableDragEnd,
  };
};
