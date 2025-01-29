import Konva from "konva";
import {useSection} from "./useSection.js";
import {nextTick, ref} from "vue";
import {ShapeStore} from "../Store/ShapeStore.js";

const {resetTransform} = useSection({});
export const useTransformer = () => {

  const transform = ref(null);
  const tempShape = ref(null);

  const resetAllTransforms = () => {
    const allTransformers = ShapeStore.layerEl.getNode().getChildren().filter(child => child instanceof Konva.Transformer);
    allTransformers.forEach(transformer => {
      if (transformer) {
        if (transformer.attrs?.is_section) {
          resetTransform(transformer.parent?.children?.[0], 0);
        } else {
          transformer.hide();
          transformer.nodes([]);
        }
        ShapeStore.layerEl.getNode().batchDraw();
      }
    });
  }

  /**
   * On Transform MouseIn event listener
   * @param event
   * @param shape
   */
  const onTransformerMouseIn = (event, shape) => {
    event.evt.stopPropagation();
    event.evt.preventDefault();
    resetAllTransforms()

    shape.moveToTop()

    transform.value.nodes([shape]);
    transform.value.show()
    ShapeStore.layerEl.getNode().add(transform.value);
    ShapeStore.layerEl.getNode().batchDraw();
  }


  /**
   * Event for the destroying shape
   * @param event
   * @param shape
   */
  const onDestroyTransform = (event, shape) => {
    ShapeStore.destroyShape(shape)
  }

  /**
   * Event for the transform starting (Save the old shape)
   * @param event
   * @param shape
   */
  const onTransformStart = (event, shape) => {
    tempShape.value = event.target.clone()
  }

  /**
   * Event for the transform dragging start (Save the old shape)
   * @param event
   * @param shape
   */
  const onTransformDragStart = (event, shape) => {
    tempShape.value = event.target.clone()
    shape.moveToTop();
  }

  /**
   * On Reset Transform event listener
   * @param event
   * @param shape
   */
  const onResetTransform = (event, shape) => {
    ShapeStore.setCursorNotAllowed();
    if (!tempShape.value) {
      debugger
      return shape.fire('destroy', event)
    }

    const oldShape = tempShape.value;

    const config = oldShape?.attrs;
    shape.width(config.width);
    shape.height(config.height);
    shape.x(config.x);
    shape.y(config.y);

    shape.scaleX(config.scaleX);
    shape.scaleY(config.scaleY);
    shape.rotation(config.rotation);

    if (shape.children && shape.children[0]) {
      shape.children[0].fill(config?.defaultFill || config?.fill || "#000");
    } else {
      shape.fill(config?.defaultFill || config?.fill || "#000");
    }

    if (oldShape.parent && oldShape.parent.id() !== shape.parent.id()) {
      oldShape.parent.add(shape);
    }

    ShapeStore.addOrEdit(shape);
    shape.getLayer().batchDraw();
    shape.getLayer().getStage().batchDraw();

    tempShape.value = null
  }

  /**
   * On Transform End event listener
   * @param event
   * @param shape
   */
  const onTransformEnd = (event, shape) => {
    transform.value.moveToTop()


    const width = event.target.width() * event.target.scaleX();
    const height = event.target.height() * event.target.scaleY();

    shape.setAttrs({
      width,
      height,
      x:event.target.x(),
      y:event.target.y(),
      rotation: shape.rotation(),
    });

    shape.children.forEach(child => {
      const width = child.width() * child.scaleX();
      const height = child.height() * child.scaleY();

      child.setAttrs({
        width,
        height,
        scaleX: 1,
        scaleY: 1,
      });
    })

    shape.getLayer().batchDraw();
    return nextTick(() => {
      shape.fire('dragend', event, shape);
    })
  }


  /**
   * Build Transform Handler
   * @param shape
   * @returns {Transformer}
   */

  const buildTransform = (shape) => {

    const enabledAnchors = () => {
      if (shape.attrs.shape === 'circle') {
        return { enabledAnchors: ['top-left', 'bottom-right', 'bottom-left', 'top-right'] }
      }
      return null
    }
    transform.value = new Konva.Transformer({
      visible: false,
      resizeEnabled: true,
      rotateEnabled: true,
      rotateLineVisible: false,
      padding: 5,
      ignoreStroke: true,
      ...enabledAnchors(),
      boundBoxFunc: function (oldBoundBox, newBoundBox) {
        // "boundBox" is an object with
        // x, y, width, height and rotation properties
        // transformer tool will try to fit nodes into that box

        // the logic is simple, if new width is too big
        // we will return previous state

        // console.log('newBoundBox.width',newBoundBox)
        // transform.value.rotation(newBoundBox.rotation)
        // transform.value.width(newBoundBox.width)
        // transform.value.height(newBoundBox.height)
        // transform.value.x(newBoundBox.x)
        // transform.value.y(newBoundBox.y)

        return newBoundBox;
      },
      anchorDragBoundFunc: function (oldPos, newPos, event) {
        // oldPos - is old absolute position of the anchor
        // newPos - is a new (possible) absolute position of the anchor based on pointer position
        // it is possible that anchor will have a different absolute position after this function
        // because every anchor has its own limits on position, based on resizing logic
        // do not snap rotating point
        if (transform.value.getActiveAnchor() === 'rotater') {
          return newPos;
        }

        const dist = Math.sqrt(
          Math.pow(newPos.x - oldPos.x, 2) + Math.pow(newPos.y - oldPos.y, 2)
        );

        // do not do any snapping with new absolute position (pointer position)
        // is too far away from old position
        if (dist > 10) {
          return newPos;
        }

        const closestX = Math.round(newPos.x / shape.attrs.width) * shape.attrs.width;
        const diffX = Math.abs(newPos.x - closestX);

        const closestY = Math.round(newPos.y / shape.attrs.height) * shape.attrs.height;
        const diffY = Math.abs(newPos.y - closestY);

        const snappedX = diffX < 10;
        const snappedY = diffY < 10;

        // a bit different snap strategies based on snap direction
        // we need to reuse old position for better UX
        if (snappedX && !snappedY) {
          return {
            x: closestX,
            y: oldPos.y,
          };
        } else if (snappedY && !snappedX) {
          return {
            x: oldPos.x,
            y: closestY,
          };
        } else if (snappedX && snappedY) {
          return {
            x: closestX,
            y: closestY,
          };
        }
        return newPos;
      },
    });
    shape.on('mousedown', (event) => onTransformerMouseIn(event, shape));
    shape.on('transformstart', (event) => onTransformStart(event, shape));
    shape.on('transformend', (event) => onTransformEnd(event, shape));
    shape.on('dragstart', (event) => onTransformDragStart(event, shape));
    shape.on('reset', (event) => onResetTransform(event, shape));
    shape.on('destroy', (event) => onDestroyTransform(event, shape));

    return shape['transformer']
  }

  return {
    transform,
    buildTransform,
    onTransformerMouseIn,
  }
}