import Konva from 'konva';

let stage = null;
let layer = null;

export function createKonva() {
  stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight,
    draggable: true,
  });

  layer = new Konva.Layer();
  stage.add(layer);

  return stage;
}

function createShape(data) {
  const config = {
    ...data,
    cornerRadius: 4,
    sides: 4,
    stroke: 'black',
    fill: ['barrier'].includes(data.shape) ? 'black' : 'transparent',
    ...(['label'].includes(data.shape) ? { dash: [5, 5] } : {}),
  };

  const group = new Konva.Group({ config, draggable: true });
  const shape = new Konva[getShapeType(config.shape)](config);
  const label = new Konva.Text({
    ...config,
    fontSize: 16,
    fontFamily: 'Arial',
    align: 'center',
    verticalAlign: 'middle',
  });

  group.add(shape);
  group.add(label);

  group.on('click', () => {
    console.log('clicked');
  });

  layer.add(group);
}

export const render = (items) => {
  items.forEach((item) => {
    createShape(item);
  });
};

const getShapeType = (shape) => {
  switch (shape) {
    case 'rectangle':
      return 'Rect';
    case 'rectangle':
      return 'Circle';
    case 'polygon':
      return 'RegularPolygon';
    case 'label':
      return 'Rect';
    case 'barrier':
      return 'Rect';
  }
  return 'Circle';
};
