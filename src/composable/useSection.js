import Konva from 'konva';
import {ShapeStore} from "../Store/ShapeStore.js";
import {nextTick, ref} from 'vue';

export const useSection = () => {
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
    // resetTransform(section);

    if (event?.target instanceof Konva.Group && event?.target?.id() !== section?.id()) {
      return event?.evt.stopPropagation();
    }
    const otherSections = ShapeStore.shapeOverlapping(section, 'sections')
    const others = ShapeStore.shapeOverlapping(section, 'others');

    if (!otherSections && !others) {
      // Rule:: In case section dropped in empty space
      return
    }

    // Rule:: In case section dropped on top of shape or another section
    ShapeStore.setCursorNotAllowed();
    section?.fire('reset', event);
    return others || otherSections
  }


  /**
   * On Section doubleClick enable Transform
   * @param event
   * @param section
   */
  const onSectionDoubleClick = (event, section) => {
    event?.evt?.stopPropagation();
    ShapeStore.layerSections.forEach((shape) => {
      if(shape.id() !== section.id()) {
        resetTransform(shape, 0)
      }
    })
    section.draggable(true);
    section.transform.visible();
    section.transform.nodes([section]);
    section.getLayer().add(section.transform);
    section.getLayer()?.batchDraw();
    document.body.style.cursor = 'pointer';
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
    ShapeStore.setCursorNotAllowed();
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
      document.body.style.cursor = 'default';
    }, timeout)
  }

  /**
   * On End Transform
   * @param event
   * @param section
   */
  const onSectionTransformEnd = (event, section) => {
    event.evt.stopPropagation();
    onSectionDragEnd(event, section);

    const originalWidth = event.target.width();
    const originalHeight = event.target.height();
    const newRotation = event.target.rotation();

    const newWidth = event.target.getClientRect().width;
    const newHeight = event.target.getClientRect().height;

    const scaleX = newWidth / originalWidth;
    const scaleY = newHeight / originalHeight;

    event.target.width(newWidth)
    event.target.height(newHeight)
    event.target.rotation(newRotation);

    event.target.getChildren().forEach((child) => {
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

    // event.target.scaleX(1)
    // event.target.scaleY(1)

    section.clearCache();
    ShapeStore.layerEl.batchDraw();
    ShapeStore.stageEl.batchDraw();
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
    group.on('mouseleave', (event) => resetTransform(group));

    if (attrs?.rotation) {
      group.rotate(attrs.rotation);
    }

    ShapeStore.layerEl.add(group);
    ShapeStore.layerEl.batchDraw();

    return group;
  };

  return {
    buildSection,
    onSectionDragStart,
    onSectionDragEnd,
    resetTransform
  };
};
