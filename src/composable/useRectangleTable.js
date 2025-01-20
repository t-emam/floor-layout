import Konva from 'konva';

export const useRectangleTable = () => {

  const buildRectTable = (number_of_seats, event, direction='LEFT_SIDE') => {
    const table = {
      id: new Date().getTime(),
      text: `Table ${ Math.random(1, 10000) }`,
      width: direction === 'LEFT_SIDE'? 250 : 120,
      height:  direction === 'LEFT_SIDE'? 120: 250,
      number_of_seats,
    };

    const group = new Konva.Group({
      id: `group-${ table.id }`,
      x: event?.x || 0,
      y: event?.y || 0,
      draggable: true,
    });

    const tableShape = new Konva.Rect({
      id: table.id,
      width: table.width,
      height: table.height,
      fill: '#ededed',
      stroke: '#ccc',
      strokeWidth: 1,
    });

    const text = new Konva.Text({
      x: table.width / 2 - 30,
      y: 20,
      text: 'Table 2',
      fontSize: 22,
      fontFamily: 'Roboto',
      fill: '',
      align: 'center',
      verticalAlign: 'middle',
    });


    group.add(tableShape);
    group.add(text);

    const seats = [];
    const seatCount = table.number_of_seats;

    const edgeCoordinates = {
      top: {x: 0, y: 0, width: table.width, height: 0},
      right: {x: table.width, y: 0, width: 0, height: table.height},
      bottom: {x: 0, y: table.height, width: table.width, height: 0},
      left: {x: 0, y: 0, width: 0, height: table.height},
    };

    const edgeLengths = {
      top: table.width,
      right: table.height,
      bottom: table.width,
      left: table.height,
    };

    const seatsPerEdge = Math.floor(seatCount / 4);
    let remainingSeats = seatCount % 4;

    let seatsOnEachEdge = {
      top: direction === 'LEFT_SIDE'?seatsPerEdge:1,
      right:  direction === 'LEFT_SIDE'?1:seatsPerEdge,
      bottom:  direction === 'LEFT_SIDE'?seatsPerEdge:1,
      left:  direction === 'LEFT_SIDE'?1:seatsPerEdge,
    };

    console.log('KOKO',seatsOnEachEdge);

    const edges = ['top', 'right', 'bottom', 'left'];
    let edgeIndex = 0;

    while (remainingSeats > 0) {
      seatsOnEachEdge[edges[edgeIndex]]++;
      remainingSeats--;
      edgeIndex = (edgeIndex + 1) % edges.length;
    }

    edges.forEach(edge => {
      const edgeLength = edgeLengths[edge];
      const seatCountOnEdge = seatsOnEachEdge[edge];
      const seatSpacing = edgeLength / (seatCountOnEdge + 1);

      for (let i = 0; i < seatCountOnEdge; i++) {
        let seatX = 0;
        let seatY = 0;

        if (edge === 'top') {
          seatX = edgeCoordinates.top.x + (i + 1) * seatSpacing;
          seatY = edgeCoordinates.top.y - 10;
        } else if (edge === 'right') {
          seatX = edgeCoordinates.right.x + 10;
          seatY = edgeCoordinates.right.y + (i + 1) * seatSpacing;
        } else if (edge === 'bottom') {
          seatX = edgeCoordinates.bottom.x + (i + 1) * seatSpacing;
          seatY = edgeCoordinates.bottom.y + 10;
        } else if (edge === 'left') {
          seatX = edgeCoordinates.left.x - 10;
          seatY = edgeCoordinates.left.y + (i + 1) * seatSpacing;
        }

        const seat = new Konva.Circle({
          id: `${ table.id }-seat-${ seats.length }`,
          radius: 15,
          x: seatX,
          y: seatY,
          fill: '000',
          stroke: '#000',
          strokeWidth: 0
        });

        group.add(seat);
        seats.push({x: seatX, y: seatY});
      }
    });

    console.log('koko',group);
    return group;
  };

  return {
    buildRectTable
  }
}