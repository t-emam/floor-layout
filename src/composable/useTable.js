import Konva from 'konva';
import {useTransformer} from "../composable/useTransformer.js";
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

    const section = ShapeStore.shapeOverlapping(table, 'sections');
    const othersTable = ShapeStore.shapeOverlapping(table, 'others');
    if (!!othersTable) {
      // Rule:: In case table dropped on top of shape elements ::
      return table?.fire('reset', event)
    } else if (!section) {
      // Rule:: In case table dropped out of section ::
      return table.fire('reset', event)
    } else if (section.id() !== table.parent.id()) {
      // Rule:: In case table dropped in section ::
      const {x: sectionX, y: sectionY} = section.getPosition();
      const {x: eventX, y: eventY} = event.evt
      ShapeStore.setSectionChild(table, section.id());
      const offsetX = eventX - sectionX - table.getWidth() / 2;
      const offsetY = eventY - sectionY - table.getHeight() / 2;
      table.setPosition({x: offsetX, y: offsetY});
    }
  }

  const getTableDimension = (config) => {
    const MIN_HEIGHT_SIZE = 80;
    const MIN_RADIUS_SIZE = 40;

    let height = (config.number_of_seats - 2) * 1.3 * 60 / 2; // table height
    let width = 80; // Head size for table
    let radius = height / 2;

    // Min table height is set MIN_HEIGHT_SIZE
    if(height < MIN_HEIGHT_SIZE) {
      height = MIN_HEIGHT_SIZE;
    }

    if(config.shape !== 'circle'){
      return {
        width,
        height,
      }
    }

    // Min table radius is set MIN_RADIUS_SIZE
    if(radius < MIN_RADIUS_SIZE) {
      radius = MIN_RADIUS_SIZE;
    }

    width = radius * 2;
    height = radius * 2;

    return {
      width,
      height,
      radius,
    }
  }

  /**
   * Build Table Shape handler
   * @param attrs
   * @returns {any}
   */
  const buildTable = (attrs) => {

    const dimensions = getTableDimension(attrs);
    const group = new Konva.Group({
      id: attrs.id,
      x: attrs?.x,
      y: attrs?.y,
      ...dimensions,
      type: attrs.type,
      shape: attrs.shape,
      rotation: attrs.rotation,
      parent_id: attrs.parent_id,
      name: 'table-group',
      draggable: true,
      number_of_seats: attrs.number_of_seats,
      strokeScaleEnabled: false,
    });

    let table = null;
    const tableConfig = {
      id: attrs.id,
      ...dimensions,
      fill: '#F2F2F7',
      name: 'table',
      strokeScaleEnabled: false,
      cornerRadius: 5,
    }

    if (attrs.shape === 'circle') {
      table = new Konva.Circle(tableConfig);
    } else {
      table = new Konva.Rect(tableConfig);
    }

    const text = new Konva.Text({
      text: attrs.name,
      height: 20,
      fontSize: 14,
      fontFamily: 'Roboto',
      fill: 'black',
      name: 'text',
      strokeScaleEnabled: false,
    });

    if (attrs.shape === 'rect') {
      text.x(dimensions.width / 2 - text.width() / 2);
      text.y(dimensions.height / 2 - text.height() / 2);
    } else if (attrs.shape === 'circle') {
      const radius = (dimensions.width / 2);
      text.x((radius - dimensions.width / 2) - text.width() / 2);
      text.y((radius - dimensions.height / 2) - text.height() / 2);
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

    ShapeStore.layerEl.add(group);
    ShapeStore.layerEl.batchDraw();

    return group;
  };

  return {
    buildTable,
    onTableDragEnd,
  };
};
