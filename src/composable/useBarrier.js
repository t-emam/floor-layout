import Konva from "konva";
import {useTransformer} from "../composable/useTransformer.js";
import {ShapeStore} from "../Store/ShapeStore.js";
import {ref} from "vue";

export const useBarrier = ({setCursor, stageEl, layerEl}) => {
  const tempPosition = ref(null);

  /**
   * Handle on Barrier Drag Start event listener
   * @param event
   * @param barrier
   */
  const onBarrierDragStart = (event, barrier) => {
    tempPosition.value = event.currentTarget.getPosition()
    barrier.moveToTop();
  }

  /**
   * Handle on Barrier Drag End event listener
   * @param event
   * @param barrier
   * @returns {Promise<*>}
   */
  const onBarrierDragEnd = async (event, barrier) => {
    event?.evt?.preventDefault();
    barrier.fill(barrier.attrs.defaultFill);
    barrier.clearCache();

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
    const othersOverlapping = ShapeStore.shapeOverlapping(barrier, 'others');

    if (!!othersOverlapping) {
      barrier.fill('red');
      return;
    }

    ShapeStore.addOrEdit(barrier, 'barriers');
  }

  /**
   * Build Barrier Handler
   * @param attrs
   * @returns {Rect}
   */
  const buildBarrier = (attrs) => {
    const barrier = new Konva.Rect({
      id: attrs.id,
      width: attrs.width,
      height: attrs.height,
      fill: attrs.bg_color,
      shape: attrs.shape,
      defaultFill: attrs.bg_color,
      x: attrs?.x,
      y: attrs?.y,
      name: attrs.name,
      type: attrs.type,
      rotation: attrs.rotation,
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

    const {buildTransform} = useTransformer();
    buildTransform(barrier);

    layerEl.value.getNode().add(barrier);
    layerEl.value.getNode().batchDraw();

    ShapeStore.setShape('barriers', barrier);
    return barrier;
  };

  return {
    buildBarrier,
    onBarrierDragEnd
  }
}