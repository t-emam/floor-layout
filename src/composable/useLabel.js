import Konva from "konva";
import {useTransformer} from "../composable/useTransformer.js";
import {ShapeStore} from "../Store/ShapeStore.js";
import {ref} from "vue";

export const useLabel = ({setCursor, stageEl, layerEl}) => {

  const tempPosition = ref(null);

  /**
   * Handle on Label Drag Start event listener
   * @param event
   * @param label
   */
  const onLabelDragStart = (event, label) => {
    tempPosition.value = event.currentTarget.getPosition()
    label.moveToTop();
  }

  /**
   * Handle on Label Drag End event listener
   * @param event
   * @param label
   * @returns {Promise<*>}
   */
  const onLabelDragEnd = async (event, label) => {
    event?.evt?.preventDefault();
    label.children[0].fill(label.attrs.defaultFill);

    console.log('is new label', label.attrs?.is_new)

    // overlapping section
    const sectionOverlapping = ShapeStore.shapeOverlapping(label, 'sections');
    if (!sectionOverlapping && !!label.parent?.id()) { // destroy o return to the previous position
      return !tempPosition?.value ? label.destroy() : label.setPosition(tempPosition.value);
    }else if(!label.parent?.id() && sectionOverlapping?.id() && !label.attrs?.is_new){
      return label.setPosition(tempPosition.value);
    }else if (sectionOverlapping?.id() !== label.parent?.id()) {
      const {x: sectionX, y: sectionY} = sectionOverlapping.getPosition();
      const {x: eventX, y: eventY} = event.evt
      ShapeStore.setSectionChild(label, sectionOverlapping.id());

      const offsetX = eventX - sectionX - label.getWidth() / 2;
      const offsetY = eventY - sectionY - label.getHeight() / 2;
      label.setPosition({x: offsetX, y: offsetY});
    }

    // overlapping label
    const othersOverlapping = ShapeStore.shapeOverlapping(label, 'others');

    if (!!othersOverlapping) {
      label.children[0].fill('red');
      return
    }

    ShapeStore.addOrEdit(label, 'labels');
  }

  /**
   * Build Label Handler
   * @param attrs
   * @returns {any}
   */
  const buildLabel = (attrs) => {
    const group = new Konva.Group({
      id: attrs.id,
      x: attrs?.x,
      y: attrs?.y,
      name: attrs.name,
      type: attrs.type,
      shape: attrs.shape,
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

    const {buildTransform} = useTransformer();
    buildTransform(group);

    layerEl.value.getNode().add(group);
    layerEl.value.getNode().batchDraw();

    ShapeStore.setShape('labels', group);
    return group;
  };

  return {
    buildLabel,
    onLabelDragStart,
    onLabelDragEnd,
  }
}