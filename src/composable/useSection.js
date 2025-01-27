import Konva from 'konva';
import {ShapeStore} from "../Store/ShapeStore.js";
import {ref} from 'vue';

export const useSection = ({setCursor, stageEl, layerEl}) => {
  const tempPosition = ref(null);

  /**
   * Handle on Section Drag Start
   * @param event
   * @param section
   */
  const onSectionDragStart = (event, section) => {
    section.moveToTop()
    tempPosition.value = event.currentTarget.getPosition()
  }

  /**
   * Handle on Section Drag End
   * @param event
   * @param section
   */
  const onSectionDragEnd = (event, section) => {
    event?.evt?.preventDefault()
    const overlappingItem = ShapeStore.shapeOverlapping(section, 'sections')

    if (!overlappingItem || section?.id() === overlappingItem?.id()) {
      return ShapeStore.addOrEdit(section, 'sections')
    }

    if (overlappingItem.attrs.type === 'section') {
      setCursor('not-allowed');
      !tempPosition?.value
        ? ShapeStore.destroyShape(section, 'sections')
        : section.setPosition({...tempPosition.value})

      setTimeout(() => {
        setCursor('auto');
      }, 1000);

      return overlappingItem
    }
  }

  // Build section (group + rectangle + text)
  const buildSection = (attrs) => {
    const group = new Konva.Group({
      id: attrs.id,
      x: attrs?.x,
      y: attrs?.y,
      width: attrs.width,
      height: attrs.height,
      name: attrs.name,
      type: attrs.type,
      draggable: true,
    });

    const section = new Konva.Rect({
      id: `section-${ attrs.id }`,
      width: attrs.width,
      height: attrs.height,
      fill: '#fff',
      stroke: '#ccc',
      strokeWidth: 1,
    });

    const text = new Konva.Text({
      id: `text-${ attrs.id }`,
      x: 0,
      y: -20,
      text: attrs.name,
      fontSize: 16,
      fontFamily: 'Roboto',
      fill: 'black',
      align: 'center',
      verticalAlign: 'middle',
    });

    group.add(section);
    group.add(text);

    if (attrs?.rotation) {
      group.rotate(attrs.rotation);
    }

    group.on('dragstart', (event) => onSectionDragStart(event, group));
    group.on('dragend', (event) => onSectionDragEnd(event, group));

    if (attrs?.rotation) {
      group.rotate(attrs.rotation);
    }

    ShapeStore.setShape('sections', group);

    // transform
    const transform = new Konva.Transformer();
    transform.nodes([section]);
    layerEl.value.getNode().add(transform);


    layerEl.value.getNode().add(group);
    layerEl.value.getNode().batchDraw();
    return group;
  };

  return {
    buildSection,
    onSectionDragStart,
    onSectionDragEnd
  };
};
