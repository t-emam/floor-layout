import Konva from "konva";
import {useSection} from "./useSection.js";
import {nextTick, ref} from "vue";
import {ShapeStore} from "../Store/ShapeStore.js";
const {resetTransform} = useSection({});
export const useTransformer = () => {

  const transform = ref(null);

  const resetAllTransforms = ()=> {
    const allTransformers = ShapeStore.layerEl.getNode().getChildren().filter(child => child instanceof Konva.Transformer);
    allTransformers.forEach(transformer => {
      if (transformer) {
        if(transformer.attrs?.is_section){
          resetTransform(transformer.parent?.children?.[0], 0);
        }else{
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
   * On Transform End event listener
   * @param event
   * @param shape
   */
  const onTransformEnd  = (event, shape) => {
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

    console.log(`Original Width: ${shape.width()}, Original Height: ${shape.height()}`);
    console.log(`New Width: ${newWidth}, New Height: ${newHeight}`);
    console.log(`Rotated Width: ${rotatedWidth}, Rotated Height: ${rotatedHeight}`);
    console.log(`Shape Updated Details :=>`,shape.attrs);

    shape.getLayer().batchDraw();
    return nextTick(()=>{
      event.target.fire('dragend', event ,shape);
    })
  }


  /**
   * Build Transform Handler
   * @param shape
   * @returns {Transformer}
   */

  const buildTransform = (shape) => {
    transform.value = new Konva.Transformer({
      visible: false,
      enabledAnchors: shape.attrs.shape === 'circle' ? ['top-left', 'bottom-right'] : ['top-left', 'top-right', 'bottom-right', 'bottom-left'],
      resizeEnabled: true,
      rotateEnabled: true,
      rotateLineVisible: false,
      padding: 5
    });

    shape.on('mousedown', (event) => onTransformerMouseIn(event, shape));
    shape.on('transformend', (event) => onTransformEnd(event, shape));

    return shape['transformer']
  }

  return {
    transform,
    buildTransform,
    onTransformerMouseIn,
  }
}