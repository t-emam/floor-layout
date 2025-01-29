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

    const sectionOverlapping = ShapeStore.shapeOverlapping(table, 'sections');
    const othersTable = ShapeStore.shapeOverlapping(table, 'others');
    if (!!othersTable) {
      // Rule:: In case table dropped on top of shape elements ::
      return table?.fire('reset', event)
    } else if (!sectionOverlapping) {
      // Rule:: In case table dropped out of section ::
      return table.fire('reset', event)
    } else if (sectionOverlapping.id() !== table.parent.id()) {
      // Rule:: In case table dropped in section ::
      const {x: sectionX, y: sectionY} = sectionOverlapping.getPosition();
      const {layerX: eventX, layerY: eventY} = event.evt
      ShapeStore.setSectionChild(table, sectionOverlapping.id());
      const offsetX = eventX - sectionX - table.getWidth() / 2;
      const offsetY = eventY - sectionY - table.getHeight() / 2;
      table.setPosition({x: offsetX, y: offsetY});
    }

    ShapeStore.addOrEdit(table);
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
      name: 'table',
      strokeScaleEnabled: false,
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
