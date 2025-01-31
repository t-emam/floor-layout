import Konva from "konva";
import {ShapeStore} from "../Store/ShapeStore.js";


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

  const rectangleSeats = () => {
    let rotation = 0;
    const seats = [];
    const seatCount = config.number_of_seats - 2

    // Determine table orientation: landscape or portrait
    const isLandscape = config.width > config.height;

    let edgeCoordinates = {
      top: {x: 0, y: 0, width: config.width, height: 0},
      right: {x: config.width, y: 0, width: 0, height: config.height},
      bottom: {x: 0, y: config.height, width: config.width, height: 0},
      left: {x: 0, y: 0, width: 0, height: config.height},
    };

    const edgeLengths = {
      top: config.width,
      right: config.height,
      bottom: config.width,
      left: config.height,
    };

    const seatsPerEdge = Math.floor(seatCount / 2);
    let remainingSeats = seatCount % 2;

    let seatsOnEachEdge = {
      top: isLandscape ? seatsPerEdge : 1,
      right: isLandscape ? 1 : seatsPerEdge,
      bottom: isLandscape ? seatsPerEdge : 1,
      left: isLandscape ? 1 : seatsPerEdge,
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
      const seatSpacing = (edgeLength / (seatCountOnEdge + 1)) + 12;

      for (let i = 0; i < seatCountOnEdge; i++) {
        let seatX = 0;
        let seatY = 0;
        let seatWidth = 10;
        let seatHeight = 60;

        if (edge === 'top') {
          seatX = edgeCoordinates.top.x + 10
          seatY = edgeCoordinates.top.y; // Seat slightly above the top
          rotation = -90;
          seatHeight = 60
        } else if (edge === 'right') {
          seatX = edgeCoordinates.right.x; // Seat slightly to the right
          seatY = edgeCoordinates.right.y + (i + 0.2) * seatSpacing;
        } else if (edge === 'bottom') {
          seatX = edgeCoordinates.bottom.x + 10;
          seatY = edgeCoordinates.bottom.y + 10; // Seat slightly below the bottom
          rotation = -90;
          seatHeight = 60;
        } else if (edge === 'left') {
          seatX = edgeCoordinates.left.x - 10; // Seat slightly to the left
          seatY = edgeCoordinates.left.y + (i + 0.2) * seatSpacing;
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

  const circleSeats = () => {
    const seats = [];
    const tableRadius = config.radius;
    const numSeats = config.number_of_seats;
    const seatWidth = 10;
    const seatHeight = 40;
    const angleStep = (2 * Math.PI) / numSeats;  // Angle step per seat

    for (let i = 0; i < numSeats; i++) {
      const angle = i * angleStep;

      // Calculate the X and Y positions for the seat (based on the table's radius)
      const seatX = tableRadius * Math.cos(angle);
      const seatY = tableRadius * Math.sin(angle);

      const seat = new Konva.Shape({
        x: seatX - seatWidth / 2,
        y: seatY - seatHeight / 2,
        width: seatWidth,
        height: seatHeight,
        fill: '#000',
        cornerRadius: 10,
        sceneFunc: function (context, shape) {
          context.save();  // Save the context state
          // Translate to the center of the seat
          context.translate(shape.getAttr('width') / 2, shape.getAttr('height') / 2);
          // Apply rotation to match the table's rounded edge
          context.rotate(angle);  // Rotate each seat by its angle around the table
          // Translate back to the top-left corner of the seat
          context.translate(-shape.getAttr('width') / 2, -shape.getAttr('height') / 2);
          // Start drawing a seat with a rounded back edge and straight front edge
          const cornerRadius = 10;  // Radius for the rounded back corners
          context.beginPath();

          // Draw the back rounded corners (on the part facing the table)
          context.moveTo(0, cornerRadius);  // Move to the top-left, but down by the corner radius
          context.arcTo(0, shape.getAttr('height'), cornerRadius, shape.getAttr('height'), cornerRadius);  // bottom-left corner
          context.lineTo(shape.getAttr('width'), shape.getAttr('height'));  // Draw straight line to the bottom-right corner
          context.lineTo(shape.getAttr('width'), 0);  // Draw straight line to the top-right corner
          context.arcTo(0, 0, 0, cornerRadius, cornerRadius);  // top-left corner (back to start)

          context.closePath();
          context.fillStrokeShape(shape);
          context.restore();
        }
      });

      seats.push(seat);
    }
    return seats
  }

  const getSeats = () => {
    if (config.shape === 'circle') {
      return circleSeats()
    }
    return rectangleSeats()
  }

  return {
    getSeats,
  }
}