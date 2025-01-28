import Konva from "konva";
import {useTransformer} from "../composable/useTransformer.js";
import {ShapeStore} from "../Store/ShapeStore.js";

export const useBarrier = () => {

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
      return barrier.fire('reset', event);
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
      barrier.fire('reset', event)
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
      fill: '#000',
      shape: attrs.shape,
      defaultFill: "#000",
      x: attrs?.x,
      y: attrs?.y,
      name: 'barrier',
      type: attrs.type,
      rotation: attrs.rotation,
      parent_id: attrs.parent_id,
      draggable: true,
    });

    // barrier.on('dragstart', (event) => onBarrierDragStart(event, barrier));
    barrier.on('dragend', (event) => onBarrierDragEnd(event, barrier));


    if (attrs?.rotation) {
      barrier.rotate(attrs.rotation);
    }

    const {buildTransform} = useTransformer();
    buildTransform(barrier);

    ShapeStore.layerEl.getNode().add(barrier);
    ShapeStore.layerEl.getNode().batchDraw();

    ShapeStore.setShape('barriers', barrier);
    return barrier;
  };

  return {
    buildBarrier,
    onBarrierDragEnd
  }
}