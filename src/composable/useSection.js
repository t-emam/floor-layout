import Konva from 'konva';
import {ShapeStore} from "../Store/ShapeStore.js";
import {nextTick, ref} from 'vue';

export const useSection = ({setCursor = null}) => {
  const tempSection = ref(null);

  /**
   * Handle on Section Drag Start event listener
   * @param event
   * @param section
   */
  const onSectionDragStart = (event, section) => {
    section.moveToTop()
    tempSection.value = event.currentTarget.clone()
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
    section?.fire('reset', event)
    setTimeout(() => setCursor('auto'), 1000);

    return others || otherSections
  }


  /**
   * On Section doubleClick enable Transform
   * @param event
   * @param section
   */
  const onSectionDoubleClick = (event, section) => {
    event?.evt?.stopPropagation();
    section.draggable(true);
    section.transform.visible();
    section.transform.nodes([section]);
    section.transform.attrs['is_section'] = true;
    section.getLayer().add(section.transform);
    section.getLayer()?.batchDraw();
  }

  /**
   * On Transform event starting (Save the section details)
   * @param event
   * @param section
   */
  const onSectionTransformStart = (event, section) => {
    tempSection.value = event.currentTarget.clone()
  }

  /**
   * On Section reset section
   * @param event
   * @param section
   */
  const onSectionReset = (event, section) => {
    event.evt.stopPropagation();
    const oldSection = tempSection.value;
    const config = oldSection.attrs;

    section.width(config.width);
    section.height(config.height);
    section.x(config.x);
    section.y(config.y);
    section.scaleX(config.scaleX);
    section.scaleY(config.scaleY);
    section.rotation(oldSection.rotation());
    section.clearCache()

    ShapeStore.addOrEdit(section);

    return nextTick(() => {
      section.getLayer().batchDraw();
      section.getLayer().getStage().batchDraw();
    })
  }

  /**
   * Reset Transform and Disable Dragging
   * @param section
   * @param timeout
   */
  const resetTransform = (section, timeout = 20000) => {
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

    const originalWidth = section.width();
    const originalHeight = section.height();
    const newRotation = section.rotation();

    const newWidth = section.getClientRect().width;
    const newHeight = section.getClientRect().height;

    const scaleX = newWidth / originalWidth;
    const scaleY = newHeight / originalHeight;

    section.width(newWidth)
    section.height(newHeight)
    section.rotation(newRotation);

    section.getChildren().forEach((child) => {
      if (child instanceof Konva.Group || child.hasName('barrier')) {
        const width = child.getClientRect().width;
        const height = child.getClientRect().height;

        child.scaleX(child.scaleX() * scaleX);
        child.scaleY(child.scaleY() * scaleY);

        child.width(width  * scaleX);
        child.height(height * scaleX);

        child.x(child.x() * scaleX);
        child.y(child.y() * scaleY);

        if (child?.children && child.children[0] && child.children[0] instanceof Konva.Text) {
          const label = child.children[0];
          label.y(label.y() * section.scaleY - 20);
        }
        ShapeStore.addOrEdit(child);
        child.clearCache()
      }

      // if (child instanceof Konva.Text) {
      //   const currentFontSize = child.fontSize();
      //   const scaleFactor = Math.min(section.scaleX(), section.scaleY());
      //   let newFontSize = currentFontSize * scaleFactor;
      //   const minFontSize = 1;
      //   const maxFontSize = 8;
      //   newFontSize = Math.max(minFontSize, Math.min(newFontSize, maxFontSize));
      //   child.fontSize(newFontSize);
      //   child.clearCache();
      // }
    });

    section.scaleX(scaleX)
    section.scaleY(scaleY)

    section.clearCache();
    ShapeStore.addOrEdit(section);
    ShapeStore.layerEl.getNode().batchDraw();
    ShapeStore.stageEl.getNode().batchDraw();
  }

  /**
   * Build Section Handler
   * @param attrs
   * @returns {any}
   */
  const buildSection = (attrs) => {
    const group = new Konva.Group({
      id: `${ attrs.id }`,
      x: attrs?.x,
      y: attrs?.y,
      width: attrs.width,
      height: attrs.height,
      shape: attrs.shape,
      name: attrs.name,
      type: attrs.type,
      draggable: false,
      scaleX: attrs.scaleX,
      scaleY: attrs.scaleY,
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
      name: 'text'
    });

    group.add(section);
    group.add(text);

    group['transform'] = new Konva.Transformer({
      rotateLineVisible: true,
    });

    group.on('dblclick', event => onSectionDoubleClick(event, group));
    group.on('transformstart', (event) => onSectionTransformStart(event, group));
    group.on('transformend', (event) => onSectionTransformEnd(event, group));
    group.on('reset', (event) => onSectionReset(event, group));

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
