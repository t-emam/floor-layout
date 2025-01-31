import Konva from "konva";
export const useChair = (config) => {

  const calculatePositions = () => {
    const rectangles = [];
    const size = Math.min(config.width, config.height) * 0.1; // Relative size (10% of the smallest dimension)
    const padding = 5; // Space between the table and the rectangles

    if (config.shape === 'circle') {
      console.log(config.shape)
      // Elliptical seat arrangement
      const radiusX = config.width / 2 + size + padding; // Adjust radius for x-axis
      const radiusY = config.height / 2 + size + padding; // Adjust radius for y-axis

      for (let i = 0; i < config.number_of_seats; i++) {
        const angle = (i / config.number_of_seats) * 2 * Math.PI;
        const x = radiusX * Math.cos(angle); // Elliptical x-coordinate
        const y = radiusY * Math.sin(angle); // Elliptical y-coordinate
        rectangles.push({x, y, width: size, height: size});
      }
    } else {
      // Rectangular seat arrangement
      const aspectRatio = config.width / config.height;
      const totalSeats = config.number_of_seats;

      const totalWidthSeats = Math.max(
        2,
        Math.round((aspectRatio / (1 + aspectRatio)) * (totalSeats - 4))
      ); // Ensure at least 1 seat per side
      const totalHeightSeats = totalSeats - totalWidthSeats;

      const topSeats = Math.max(1, Math.floor(totalWidthSeats / 2));
      const bottomSeats = Math.max(1, totalWidthSeats - topSeats);
      const leftSeats = Math.max(1, Math.floor(totalHeightSeats / 2));
      const rightSeats = Math.max(1, totalHeightSeats - leftSeats);

      // Top side
      for (let i = 0; i < topSeats; i++) {
        const x = (i + 1) * (config.width / (topSeats + 1)) - size / 2;
        rectangles.push({x, y: -size - padding, width: size, height: size});
      }

      // Right side
      for (let i = 0; i < rightSeats; i++) {
        const y = (i + 1) * (config.height / (rightSeats + 1)) - size / 2;
        rectangles.push({
          x: config.width + padding,
          y,
          width: size,
          height: size,
        });
      }

      // Bottom side
      for (let i = 0; i < bottomSeats; i++) {
        const x = (i + 1) * (config.width / (bottomSeats + 1)) - size / 2;
        rectangles.push({
          x,
          y: config.height + padding,
          width: size,
          height: size,
        });
      }

      // Left side
      for (let i = 0; i < leftSeats; i++) {
        const y = (i + 1) * (config.height / (leftSeats + 1)) - size / 2;
        rectangles.push({x: -size - padding, y, width: size, height: size});
      }
    }

    return rectangles;
  };

  const rectangleTableSeats = () => {
    let rotation = 0;
    const seats = [];
    const seatCount = config.number_of_seats - 2 // Skip first 2 seats for table heads

    // each side x, y, width, height for top, left, bottom, right
    let edgeCoordinates = {
      top: {x: 0, y: 0, width: config.width, height: 0},
      right: {x: config.width, y: 0, width: 0, height: config.height},
      bottom: {x: 0, y: config.height, width: config.width, height: 0},
      left: {x: 0, y: 0, width: 0, height: config.height},
    };

    // edge Depth Size
    const edgeLengths = {
      top: config.width,
      right: config.height,
      bottom: config.width,
      left: config.height,
    };

    const seatsPerEdge = Math.floor(seatCount / 2); // MAKE SURE THE RECTANGLE NOT HAS ODD NUMBER OF SEATS
    let remainingSeats = seatCount % 2;

    let seatsOnEachEdge = {
      top: 1,
      right: seatsPerEdge,
      bottom: 1,
      left: seatsPerEdge,
    };

    const edges = ['right', 'left', 'top', 'bottom'];
    let edgeIndex = 0;

    while (remainingSeats > 0) {
      seatsOnEachEdge[edges[edgeIndex]]++;
      remainingSeats--;
      edgeIndex = (edgeIndex + 1) % edges.length;
    }

    edges.forEach((edge) => {
      const edgeLength = edgeLengths[edge];
      const seatCountOnEdge = seatsOnEachEdge[edge];
      const seatSpacing = (edgeLength / seatCountOnEdge);

      for (let i = 0; i < seatCountOnEdge; i++) {
        let seatX = 0;
        let seatY = 0;
        let seatWidth = 10;
        let seatHeight = 60;

        if (edge === 'top') {
          seatX = edgeCoordinates.top.x + 10
          seatY = edgeCoordinates.top.y;
          rotation = -90;
          seatHeight = 60
        } else if (edge === 'right') {
          seatX = edgeCoordinates.right.x;
          seatY = edgeCoordinates.right.y + i * seatSpacing + 10;
        } else if (edge === 'bottom') {
          seatX = edgeCoordinates.bottom.x + 10;
          seatY = edgeCoordinates.bottom.y + 10;
          rotation = -90;
          seatHeight = 60;
        } else if (edge === 'left') {
          seatX = edgeCoordinates.left.x - 10;
          seatY = edgeCoordinates.left.y + i * seatSpacing + 10;
        }

        const seat = new Konva.Rect({
          id: `${ config.id }-seat-${ seats.length }`,
          width: seatWidth,
          height: seatHeight,
          x: seatX,
          y: seatY,
          fill: '#000',
          stroke: '#000',
          strokeWidth: 0,
          fillOpacity: 0.5,
          rotation,
          name: 'seat',
          strokeScaleEnabled: false,
          shadowOpacity: 0.5,
        });

        seats.push(seat);
      }
    });

    return seats;
  };

  const circleTableSeats = () => {
    const seats = [];
    const tableRadius = config.radius - 5;
    const numSeats = config.number_of_seats;
    const seatWidth = 10;
    const seatHeight = 40;
    const angleStep = (2 * Math.PI) / numSeats;

    for (let i = 0; i < numSeats; i++) {
      const angle = i * angleStep;  // Calculate the angle for the current seat

      // Calculate the X and Y positions for the seat (based on the table's radius)
      const seatX = tableRadius * Math.cos(angle);
      const seatY = tableRadius * Math.sin(angle);

      const seat = new Konva.Shape({
        id: `${ config.id }-seat-${ seats.length }`,
        x: -seatX - seatWidth / 2,
        y: -seatY - seatHeight / 2,
        width: seatWidth,
        height: seatHeight,
        fill: '#000',
        sceneFunc: (context, shape) => {
          context.save();
          context.translate(shape.getAttr('width') / 2, shape.getAttr('height') / 2);
          context.rotate(angle);
          context.translate(-shape.getAttr('width') / 2, -shape.getAttr('height') / 2);
          const cornerRadius = 10;

          // DON'T TOUCH
          context.beginPath();
          context.moveTo(0, cornerRadius);  // Move to the top left and down by the corner radius
          context.arcTo(0, shape.getAttr('height'), tableRadius, shape.getAttr('height'), cornerRadius);  // bottom left rounded corner
          context.lineTo(shape.getAttr('width'), shape.getAttr('height'));  // draw straight line to the bottom right corner
          context.lineTo(shape.getAttr('width'), 0);  // draws straight line to the top right corner
          context.arcTo(0, 0, 0, cornerRadius, cornerRadius);  // top to the left rounded corner (back to start)
          // DON'T TOUCH

          context.closePath();
          context.fillStrokeShape(shape);
          context.restore();
        }
      });
      seats.push(seat);
    }

    return seats;
  };


  const getSeats = () => {
    if (config.shape === 'circle') {
      return circleTableSeats()
    }
    return rectangleTableSeats()
  }

  return {
    getSeats,
  }
}