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
    section.clearCache()

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

    console.log('!otherSections && !others',otherSections, others)
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
    event?.evt?.stopPropagation();
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

    section.moveToTop()

    const clientRect = event.target.getClientRect();
    const width = clientRect.width * event.target.scaleX();
    const height = clientRect.height * event.target.scaleY();

    section.setAttrs({
      width,
      height,
      x: event.target.x(),
      y: event.target.y(),
      rotation: section.rotation(),
      ...(section.attrs.type === 'barrier' ? {scaleX: 1, scaleY: 1} : null),
    });

    section.children?.forEach(child => {
      if(child instanceof Konva.Group) {
        const childRect = child.getClientRect();
        const width = childRect.width * child.scaleX();
        const height = childRect.height * child.scaleY();
        let radius = width / 2;
        let fontSize = null;

        if (child.hasName('seat')) {
          radius = ShapeStore.seatRadius(child.attrs);
        }

        if (child.hasName('text')) {
          fontSize = child.fontSize() * child.scaleX();
        }

        child.setAttrs({
          width,
          height,
          rotation: child.rotation(),
          x: child.x() * child.scaleX(),
          y: child.y() * child.scaleY(),
          ...(child instanceof Konva.Circle ? {radius} : null),
          ...(fontSize ? {fontSize} : null),
          scaleX: 1,
          scaleY: 1,
        });

        // child?.children?.forEach(groupChild => {
        //   const groupChildRect = child.getClientRect();
        //   const width = groupChildRect.width * groupChild.scaleX();
        //   const height = groupChildRect.height * groupChild.scaleY();
        //   let radius = width / 2;
        //   let fontSize = null;
        //
        //   if (groupChild.hasName('seat')) {
        //     radius = ShapeStore.seatRadius(child.attrs);
        //   }
        //
        //   if (groupChild.hasName('text')) {
        //     fontSize = groupChild.fontSize() * child.scaleX();
        //   }
        //
        //   groupChild.setAttrs({
        //     width,
        //     height,
        //     ...(groupChild instanceof Konva.Circle ? {radius} : null),
        //     ...(fontSize ? {fontSize} : null),
        //     scaleX: 1,
        //     scaleY: 1,
        //   });
        // })
      }

    });


    // // const originalWidth = event.target.width();
    // // const originalHeight = event.target.height();
    // const newRotation = event.target.rotation();
    // const clientRect = event.target.getClientRect();
    //
    // const newWidth = clientRect.width * event.target.scaleX();
    // const newHeight = clientRect.height * event.target.scaleY();
    //
    //
    // event.target.width(newWidth)
    // event.target.height(newHeight)
    // event.target.rotation(newRotation);
    //
    // event.target.getChildren().forEach((child) => {
    //   if (child instanceof Konva.Group || child.hasName('barrier')) {
    //     const width = child.width() * child.scaleX();
    //     const height = child.height() * child.scaleY() ;
    //
    //     // child.scaleX(child.scaleX() * scaleX);
    //     // child.scaleY(child.scaleY() * scaleY);
    //
    //     child.width(width );
    //     child.height(height);
    //
    //     child.x(child.x() * child.scaleX());
    //     child.y(child.y() * child.scaleY());
    //
    //     if (child?.children && child.children[0] && child.children[0] instanceof Konva.Text) {
    //       const label = child.children[0];
    //       label.y(label.y() * section.scaleY - 20);
    //     }
    //     child.clearCache()
    //   }

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
    // });

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
      ignoreStroke:true,
      boundBoxFunc: (oldBoundBox, newBoundBox) => {
        // Rule:: Min & Max Shape Size
        if (newBoundBox.width <= 200 || newBoundBox.height <= 200) {
          return oldBoundBox;
        }
        return newBoundBox;
      },
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
