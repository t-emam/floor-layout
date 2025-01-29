import Konva from "konva";
import {useTransformer} from "../composable/useTransformer.js";
import {ShapeStore} from "../Store/ShapeStore.js";
import {ref} from "vue";

export const useLabel = () => {

  const tempPosition = ref(null);

  /**
   * Handle on Label Drag End event listener
   * @param event
   * @param label
   * @returns {Promise<*>}
   */
  const onLabelDragEnd = async (event, label) => {
    event?.evt?.preventDefault();
    label.clearCache();
    label.children[0].fill(label.attrs.defaultFill);

    // overlapping
    const sectionOverlapping = ShapeStore.shapeOverlapping(label, 'sections');
    const othersOverlapping = ShapeStore.shapeOverlapping(label, 'others');

    if (!!othersOverlapping) {
      // Rule:: In case label drop on top of shape element ::
      label.fire('reset', event);
    } else if (sectionOverlapping) {
      // Rule:: In case label drop in section ::
      const {x: sectionX, y: sectionY} = sectionOverlapping.getPosition();
      const {x: eventX, y: eventY} = event.evt
      ShapeStore.setSectionChild(label, sectionOverlapping.id());
      const offsetX = eventX - sectionX - label.getWidth() / 2;
      const offsetY = eventY - sectionY - label.getHeight() / 2;
      label.setPosition({x: offsetX, y: offsetY});
    } else if (!sectionOverlapping && !!label.parent?.id()) {
      // Rule:: In case label drop out of section ::
      ShapeStore.layerEl.getNode().add(label);
      label.setPosition({
        x: event.evt.x,
        y: event.evt.y
      });
    }

    ShapeStore.addOrEdit(label);
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
      rotation: attrs.rotation,
      scaleX: attrs.scaleX,
      scaleY: attrs.scaleY,
      draggable: true,
    });

    const container = new Konva.Rect({
      id: `section-${ attrs.id }`,
      width: attrs.width,
      height: attrs.height,
      fill: attrs.bg_color,
      stroke: '#000',
      name: 'bg_color',
      strokeWidth: 1,
      dash: [5, 5]
    });

    const text = new Konva.Text({
      id: `text-${ attrs.id }`,
      text: attrs.name,
      fontSize: 16,
      fontFamily: 'Roboto',
      fill: 'black',
      align: 'center',
      name: 'text',
      verticalAlign: 'middle',
    });

    // Position text to center inside the container
    text.x(attrs.width / 2 - text.width() / 2);
    text.y(attrs.height / 2 - text.height() / 2);

    group.add(container);
    group.add(text);

    group.on('dragend', (event) => onLabelDragEnd(event, group))

    const {buildTransform} = useTransformer();
    buildTransform(group);

    ShapeStore.layerEl.getNode().add(group);
    ShapeStore.layerEl.getNode().batchDraw();

    ShapeStore.setShape('labels', group);
    return group;
  };

  return {
    buildLabel,
    onLabelDragEnd,
  }
}