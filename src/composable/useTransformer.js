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
    transform.value.moveToTop()
    ShapeStore.layerEl.getNode().add(transform.value);
    ShapeStore.layerEl.getNode().batchDraw();
  }


  /**
   * Event for the destroying shape
   * @param event
   * @param shape
   */
  const onDestroyTransform = (event, shape) => {
    shape.destroy(shape, shape.attrs.entity);
  }

  /**
   * Event for the transform starting (Save the old shape)
   * @param event
   * @param shape
   */
  const onTransformStart = (event, shape) => {
    tempShape.value = event.currentTarget.clone()
    console.log('Transform Start', tempShape.value)
  }

  /**
   * Event for the transform dragging start (Save the old shape)
   * @param event
   * @param shape
   */
  const onTransformDragStart = (event, shape) => {
    tempShape.value = event.currentTarget.clone()
    console.log('Transform dragstart', tempShape.value)
    shape.moveToTop();
  }

  /**
   * On Reset Transform event listener
   * @param event
   * @param shape
   */
  const onResetTransform = (event, shape) => {
    if (!tempShape.value) {
      return shape.fire('destroy', event)
    }

    const oldShape = tempShape.value;

    const config = oldShape.attrs;
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
    // console.log('before shape',{...shape})
    // shape.x = event.target.x();
    // shape.y = event.target.y();
    //
    // shape.width = Math.max(
    //   event.target.width() * event.target.scaleX(),
    //   shape.attrs.type === 'barrier' ? 1 : 30
    // );
    //
    // shape.height = Math.max(
    //   event.target.height() * event.target.scaleY(),
    //   shape.type === 'barrier' ? 1 : 30
    // );
    // // reset scale to 1
    // event.target.scaleX(1);
    // event.target.scaleY(1);
    //
    // console.log('after shape',shape)

    const newWidth = shape.width() * shape.scaleX();
    const newHeight = shape.height() * shape.scaleY();

    const rotation = shape.rotation();
    const angleRad = rotation * Math.PI / 180;

    const cosRotation = Math.cos(angleRad);
    const sinRotation = Math.sin(angleRad);

    const rotatedWidth = Math.abs(newWidth * cosRotation) + Math.abs(newHeight * sinRotation);
    const rotatedHeight = Math.abs(newWidth * sinRotation) + Math.abs(newHeight * cosRotation);

    shape.attrs.rotation = rotation;
    shape.width(rotatedWidth);
    shape.height(rotatedHeight);

    shape.x(event.target.x());
    shape.y(event.target.y());

    shape.scaleX(event.target.scaleX());
    shape.scaleY(event.target.scaleX());

    shape.getLayer().batchDraw();
    return nextTick(() => {
      event.target.fire('dragend', event, shape);
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
      ...enabledAnchors()
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