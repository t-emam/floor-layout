import Konva from "konva";
import {ShapeStore} from "../Store/ShapeStore.js";
import {ref} from "vue";

export const useLabel = ({setCursor, stageEl, layerEl}) => {

  const tempPosition = ref(null);

  const onLabelDragStart = (event, label) => {
    tempPosition.value = event.currentTarget.getPosition()
    label.moveToTop();
  }

  const onLabelDragEnd = async (event, label) => {
    event.evt.preventDefault();
    label.children[0].fill(label.attrs.defaultFill);

    // overlapping section
    const sectionOverlapping = ShapeStore.shapeOverlapping(label, 'sections');
    if (!sectionOverlapping && !!label.parent?.id()) { // destroy o return to the previous position
      return !tempPosition?.value ? label.destroy() : label.setPosition(tempPosition.value);
    }

    if (sectionOverlapping.id() !== label.parent.id() && !!label.parent?.id()) {
      const {x: sectionX, y: sectionY} = sectionOverlapping.getPosition();
      const {x: eventX, y: eventY} = event.evt
      ShapeStore.setSectionChild(label, sectionOverlapping.id());

      const offsetX = eventX - sectionX - label.getWidth() / 2;
      const offsetY = eventY - sectionY - label.getHeight() / 2;
      label.setPosition({x: offsetX, y: offsetY});
    }

    // overlapping label
    const tableOverlapping = ShapeStore.shapeOverlapping(label, 'tables');
    const barrierOverlapping = ShapeStore.shapeOverlapping(label, 'barriers');
    const labelOverlapping = ShapeStore.shapeOverlapping(label, 'labels');

    if (tableOverlapping || barrierOverlapping || (labelOverlapping.id() !== label.id())) {
      label.children[0].fill('red');
      return
    }

    ShapeStore.addOrEdit(label, 'labels');
  }

  const buildLabel = (attrs) => {
    const group = new Konva.Group({
      id: attrs.id,
      x: attrs?.x,
      y: attrs?.y,
      name: attrs.name,
      type: attrs.type,
      width: attrs.width,
      height: attrs.height,
      parent_id: attrs.parent_id,
      defaultFill: attrs.bg_color,
      draggable: true,
    });

    const container = new Konva.Rect({
      id: `section-${ attrs.id }`,
      width: attrs.width,
      height: attrs.height,
      fill: attrs.bg_color,
      stroke: '#ccc',
      strokeWidth: 1,
    });

    const text = new Konva.Text({
      id: `text-${ attrs.id }`,
      text: attrs.name,
      fontSize: 16,
      fontFamily: 'Roboto',
      fill: 'black',
      align: 'center',
      verticalAlign: 'middle',
    });

    if (attrs?.rotation) {
      group.rotate(attrs.rotation);
    }

    // Position text to center inside the container
    text.x(attrs.width / 2 - text.width() / 2);
    text.y(attrs.height / 2 - text.height() / 2);

    group.add(container);
    group.add(text);

    group.on('dragstart', (event) => onLabelDragStart(event, group))
    group.on('dragend', (event) => onLabelDragEnd(event, group))

    // save the start drag position
    ShapeStore.setShape('labels', group);


    // transform
    const transform = new Konva.Transformer();
    transform.nodes([group]);
    layerEl.value.getNode().add(transform);

    layerEl.value.getNode().add(group);
    layerEl.value.getNode().batchDraw();
    return group;
  };

  return {
    buildLabel,
    onLabelDragStart,
    onLabelDragEnd,
  }
}