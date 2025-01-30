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
    barrier.clearCache();
    const othersOverlapping = ShapeStore.shapeOverlapping(barrier, 'others');
    const section = ShapeStore.shapeOverlapping(barrier, 'sections');

    if (!!othersOverlapping) {
      // Rule:: In case barrier dropped on top of shape element ::
      return barrier.fire('reset', event)
    } else if (!section) {
      // Rule:: In case barrier dropped out of section ::
      return barrier.fire('reset', event);
    } else if (section.id() !== barrier.parent.id()) {
      // Rule:: In case barrier dropped in section ::
      const {x: sectionX, y: sectionY} = section.getPosition();
      const {x: eventX, y: eventY} = event.evt
      ShapeStore.setSectionChild(barrier, section.id());
      const offsetX = eventX - sectionX - barrier.getWidth() / 2;
      const offsetY = eventY - sectionY - barrier.getHeight() / 2;
      barrier.setPosition({x: offsetX, y: offsetY});
    }
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
      x: attrs?.x,
      y: attrs?.y,
      name: 'barrier',
      type: attrs.type,
      rotation: attrs.rotation,
      parent_id: attrs.parent_id,
      draggable: true,
      scaleX: attrs.scaleX,
      scaleY: attrs.scaleY,
    });

    // barrier.on('dragstart', (event) => onBarrierDragStart(event, barrier));
    barrier.on('dragend', (event) => onBarrierDragEnd(event, barrier));


    if (attrs?.rotation) {
      barrier.rotate(attrs.rotation);
    }

    const {buildTransform} = useTransformer();
    buildTransform(barrier);

    ShapeStore.layerEl.add(barrier);
    ShapeStore.layerEl.batchDraw();

    return barrier;
  };

  return {
    buildBarrier,
    onBarrierDragEnd
  }
}