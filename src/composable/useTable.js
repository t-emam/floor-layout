import Konva from 'konva';
import {useTransformer} from "../composable/useTransformer.js";
import {nextTick} from "vue";
import {useChair} from './useChair.js';
import {ShapeStore} from '../Store/ShapeStore.js';

export const useTable = () => {

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

    // overlapping section
    const sectionOverlapping = ShapeStore.shapeOverlapping(table, 'sections');
    if (!sectionOverlapping) { // destroy o return to the previous position
      if (table.attrs?.is_new) {
        return ShapeStore.destroyShape(table)
      }

      return nextTick(() => {
        table.fire('reset', event)
      })
    }

    const othersTable = ShapeStore.shapeOverlapping(table, 'others');
    if (!!othersTable) {
      return table.fire('reset', event)
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
      defaultFill: '#E5E5EA',
      fill: '#E5E5EA',
      type: attrs.type,
      shape: attrs.shape,
      rotation: attrs.rotation,
      parent_id: attrs.parent_id,
      name: 'table-group',
      draggable: true,
      number_of_seats: attrs.number_of_seats,
      scaleX: attrs.scaleX,
      scaleY: attrs.scaleY,
    });

    let table = null;
    const tableConfig = {
      id: attrs.id,
      width: attrs.width,
      height: attrs.height,
      defaultFill: '#E5E5EA',
      fill: '#E5E5EA',
      name: 'table'
    }

    if (attrs.shape === 'circle') {
      table = new Konva.Circle({
        ...tableConfig,
        radius: Math.abs(attrs.width / 2),
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
      name: 'text',
      verticalAlign: 'middle',
    });

    if (attrs.shape === 'rect') {
      text.x(attrs.width / 2 - text.width() / 2);
      text.y(attrs.height / 2 - text.height() / 2);
    } else if (attrs.shape === 'circle') {
      const radius = (attrs.width / 2);
      text.x((radius - attrs.width / 2) - text.width() / 2);
      text.y((radius - attrs.height / 2) - text.height() / 2);
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

    group.on('dragend', (event) => onTableDragEnd(event, group))

    const {buildTransform} = useTransformer();
    buildTransform(group);

    ShapeStore.layerEl.getNode().add(group);
    ShapeStore.layerEl.getNode().batchDraw();

    ShapeStore.setShape('tables', group);
    return group;
  };

  return {
    buildTable,
    onTableDragEnd,
  };
};
