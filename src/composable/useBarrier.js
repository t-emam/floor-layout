import Konva from "konva";
import {ShapeStore} from "../Store/ShapeStore.js";
import {ref} from "vue";

export const useBarrier = ({setCursor, stageEl, layerEl}) => {
  const barriersList = ref([]);
  const tempPosition = ref(null);

  const onBarrierDragStart = (event, barrier) => {
    tempPosition.value = event.currentTarget.getPosition()
    barrier.moveToTop();
  }

  const onBarrierDragEnd = async (event, barrier) => {
    event.evt.preventDefault();
    barrier.fill(barrier.attrs.defaultFill);

    // overlapping section
    const sectionOverlapping = ShapeStore.shapeOverlapping(barrier, 'sections');
    if (!sectionOverlapping) { // destroy o return to the previous position
      return !tempPosition?.value ? barrier.destroy() : barrier.setPosition(tempPosition.value);
    }

    if (sectionOverlapping.id() !== barrier.parent.id()) {
      const {x: sectionX, y: sectionY} = sectionOverlapping.getPosition();
      const {x: eventX, y: eventY} = event.evt
      ShapeStore.setSectionChild(barrier, sectionOverlapping.id());

      const offsetX = eventX - sectionX - barrier.getWidth() / 2;
      const offsetY = eventY - sectionY - barrier.getHeight() / 2;
      barrier.setPosition({x: offsetX, y: offsetY});
    }

    // overlapping barrier
    const tableOverlapping = ShapeStore.shapeOverlapping(barrier, 'tables');
    const barrierOverlapping = ShapeStore.shapeOverlapping(barrier, 'barriers');
    const labelOverlapping = ShapeStore.shapeOverlapping(barrier, 'labels');

    if (tableOverlapping || labelOverlapping || (barrierOverlapping && barrierOverlapping.id() !== barrier.id())) {
      barrier.fill('red');
      return;
    }

    ShapeStore.addOrEdit(barrier, 'barriers');
  }

  const buildBarrier = (attrs) => {
    const barrier = new Konva.Rect({
      id: attrs.id,
      width: attrs.width,
      height: attrs.height,
      fill: attrs.bg_color,
      defaultFill: attrs.bg_color,
      x: attrs?.x,
      y: attrs?.y,
      name: attrs.name,
      type: attrs.type,
      parent_id: attrs.parent_id,
      stroke: '#ccc',
      strokeWidth: 1,
      draggable: true,
    });

    barrier.on('dragstart', (event) => onBarrierDragStart(event, barrier));
    barrier.on('dragend', (event) => onBarrierDragEnd(event, barrier));

    if (attrs?.rotation) {
      barrier.rotate(attrs.rotation);
    }

    ShapeStore.setShape('barriers', barrier);

    // transform
    const transform = new Konva.Transformer();
    transform.nodes([barrier]);
    layerEl.value.getNode().add(transform);

    layerEl.value.getNode().add(barrier);
    layerEl.value.getNode().batchDraw();
    return barrier;
  };

  return {
    buildBarrier,
    barriersList
  }
}