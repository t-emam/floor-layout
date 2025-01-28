import Konva from 'konva';
import {ShapeStore} from "../Store/ShapeStore.js";
import {ref} from 'vue';

export const useSection = ({setCursor= null}) => {
  const tempPosition = ref(null);

  /**
   * Handle on Section Drag Start event listener
   * @param event
   * @param section
   */
  const onSectionDragStart = (event, section) => {
    section.moveToTop()
    tempPosition.value = event.currentTarget.getPosition()
  }

  /**
   * Handle on Section Drag End event listener
   * @param event
   * @param section
   */
  const onSectionDragEnd = (event, section) => {
    event?.evt?.preventDefault()

    if (event?.target instanceof Konva.Group && event?.target?.id() !== section?.id()) {
      return event?.evt.stopPropagation();
    }
    const otherSections = ShapeStore.shapeOverlapping(section, 'sections')
    let others = ShapeStore.shapeOverlapping(section, 'others');

    resetTransform(section);

    if (!otherSections && !others) {
      return ShapeStore.addOrEdit(section, 'sections')
    }

    setCursor('not-allowed');
    if(!tempPosition?.value){
      ShapeStore.destroyShape(section, 'sections')
    } else {
      section.setPosition({...tempPosition.value})
    }

    setTimeout(() => {
      setCursor('auto');
    }, 1000);

    return others || otherSections
  }


  /**
   * On Section doubleClick enable Transform
   * @param event
   * @param section
   */
  const onSectionDoubleClick = (event, section) => {
    event.evt.stopPropagation();
    section.draggable(true);
    section.transform.visible();
    section.transform.nodes([section]);
    section.transform.attrs['is_section'] = true;
    section.getLayer().add(section.transform);
    section.getLayer().batchDraw();
  }

  /**
   * Reset Transform and Disable Dragging
   * @param section
   * @param timeout
   */
  const resetTransform = (section, timeout = 20000) =>{
    // TODO: lodash Debounce
    setTimeout(() => {
      section.draggable(false);
      section.transform?.nodes([]);
    }, timeout)
  }

  /**
   * On End Transform
   * @param event
   * @param section
   */
  const onSectionTransformEnd = (event, section) => {
    event.evt.stopPropagation();
    resetTransform(section)
    onSectionDragEnd(event, section);
  }

  /**
   * Build Section Handler
   * @param attrs
   * @returns {any}
   */
  const buildSection = (attrs) => {
    const group = new Konva.Group({
      id: `${attrs.id}`,
      x: attrs?.x,
      y: attrs?.y,
      width: attrs.width,
      height: attrs.height,
      shape: attrs.shape,
      name: attrs.name,
      type: attrs.type,
      draggable: false,
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
      y: -26,
      text: attrs.name,
      fontSize: 16,
      fontFamily: 'Roboto',
      fill: 'black',
      align: 'center',
      verticalAlign: 'middle',
      strokeWidth: 1,
      stroke: 'black',
      name:'text'
    });

    group.add(section);
    group.add(text);

    group['transform'] = new Konva.Transformer({
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      rotateLineVisible: true,
    });

    group.on('dblclick', event => onSectionDoubleClick(event, group));
    group.on('transformend', (event) => onSectionTransformEnd(event, group));

    group.on('dragstart', (event) => onSectionDragStart(event, group));
    group.on('dragend', (event) => onSectionDragEnd(event, group));

    if (attrs?.rotation) {
      group.rotate(attrs.rotation);
    }

    ShapeStore.layerEl.getNode().add(group);
    ShapeStore.layerEl.getNode().batchDraw();

    ShapeStore.setShape('sections', group);
    return group;
  };

  return {
    buildSection,
    onSectionDragStart,
    onSectionDragEnd,
    resetTransform
  };
};
