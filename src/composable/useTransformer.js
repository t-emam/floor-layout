import Konva from "konva";
import {nextTick, ref} from "vue";
import {ShapeStore} from "../Store/ShapeStore.js";

export const useTransformer = () => {

  const transform = ref(null);
  const tempShape = ref(null);

  const resetAllTransforms = () => {
    const allTransformers = ShapeStore.layerEl.getChildren().filter(child => child instanceof Konva.Transformer);
    allTransformers.forEach(transformer => {
      if (transformer) {
        transformer.hide();
        transformer.nodes([]);
        ShapeStore.layerEl.batchDraw();
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
    transform.value.moveToTop();
    transform.value.nodes([shape]);
    transform.value.show()
    ShapeStore.layerEl.add(transform.value);
    ShapeStore.layerEl.batchDraw();
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
    tempShape.value = shape.clone();
    transform.value.moveToTop();
  }

  /**
   * Event for the transform dragging start (Save the old shape)
   * @param event
   * @param shape
   */
  const onTransformDragStart = (event, shape) => {
    tempShape.value = shape.clone();
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
      return;
    }
    shape.moveToTop();
    const oldShape = tempShape.value;

    const config = oldShape?.attrs;
    shape.width(config.width);
    shape.height(config.height);
    shape.x(config.x);
    shape.y(config.y);

    shape.scaleX(config.scaleX);
    shape.scaleY(config.scaleY);
    shape.rotation(config.rotation);

    if (oldShape.parent && oldShape.parent.id() !== shape.parent.id()) {
      oldShape.parent.add(shape);
    }

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
      x: event.target.x(),
      y: event.target.y(),
      rotation: shape.rotation(),
      ...(shape.attrs.type === 'barrier' ? {scaleX: 1, scaleY: 1} : null),
    });

    shape.children?.forEach(child => {
      const width = child.width() * child.scaleX();
      const height = child.height() * child.scaleY();
      let radius = width / 2;
      let fontSize = null;

      if (child.hasName('seat')) {
        radius = ShapeStore.seatRadius(shape.attrs);
      }

      if (child.hasName('text')) {
        fontSize = child.fontSize() * child.scaleX();
      }

      child.setAttrs({
        width,
        height,
        ...(child instanceof Konva.Circle ? {radius} : null),
        ...(fontSize ? {fontSize} : null),
        scaleX: 1,
        scaleY: 1,
      });
    });

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
        return {enabledAnchors: ['top-left', 'bottom-right', 'bottom-left', 'top-right']}
      }
      return null
    }
    transform.value = new Konva.Transformer({
      visible: false,
      resizeEnabled: true,
      rotateEnabled: true,
      rotateLineVisible: false,
      padding: 5,
      ignoreStroke: true, // https://konvajs.org/docs/select_and_transform/Ignore_Stroke_On_Transform.html
      // centeredScaling: shape?.attrs?.type === 'table', //https://konvajs.org/docs/select_and_transform/Centered_Scaling.html
      keepRatio: true, // https://konvajs.org/docs/select_and_transform/Keep_Ratio.html
      ...enabledAnchors(),
      boundBoxFunc: (oldBoundBox, newBoundBox) => {
        // Rule:: Min & Max Shape Size
        if (newBoundBox.width <= 40 || newBoundBox.height <= 40) {
          return oldBoundBox;
        }
        return newBoundBox;
      },
      dragBoundFunc: (position) => {
        // const minX = 0;
        // const minY = 0;
        // const maxX = ShapeStore.layerEl.width() - transform.value.width();
        // const maxY = ShapeStore.layerEl.height() - transform.value.height();
        //
        // return {
        //   x: Math.max(minX, Math.min(maxX, position.x)),
        //   y: Math.max(minY, Math.min(maxY, position.y))
        // };
        return position
      }
    });
    shape.on('mousedown', (event) => onTransformerMouseIn(event, shape));
    shape.on('transformstart', (event) => onTransformStart(event, shape));
    shape.on('transformend', (event) => onTransformEnd(event, shape));
    shape.on('dragstart', (event) => onTransformDragStart(event, shape));
    shape.on('reset', (event) => onResetTransform(event, shape));
    shape.on('destroy', (event) => onDestroyTransform(event, shape));
    shape.on('mouseover', () => document.body.style.cursor = 'pointer');
    shape.on('mouseout', () => document.body.style.cursor = 'default');

    return shape['transformer']
  }

  return {
    transform,
    buildTransform,
    onTransformerMouseIn,
  }
}