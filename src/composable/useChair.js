import Konva from "konva";
import {ShapeStore} from "../Store/ShapeStore.js";


export const useChair = (config) => {

  const seatRadius = ShapeStore.seatRadius(config);

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

    const edges = ['right', 'left'];
    let edgeIndex = 0;


    seatsOnEachEdge['top'] = 1;
    seatsOnEachEdge['bottom'] = 1;

    while (remainingSeats > 0) {
      seatsOnEachEdge[edges[edgeIndex]]++;
      remainingSeats--;
      edgeIndex = (edgeIndex + 1) % edges.length;
    }

    // Loop through each edge to place seats
    [...edges, ...['top', 'bottom']].forEach((edge) => {
      const edgeLength = edgeLengths[edge];
      const seatCountOnEdge = seatsOnEachEdge[edge];
      const seatSpacing = edgeLength / (seatCountOnEdge + 1);

      for (let i = 0; i < seatCountOnEdge; i++) {
        let seatX = 0;
        let seatY = 0;

        if (edge === 'top') {
          seatX = edgeCoordinates.top.x + (i + 1) * seatSpacing;
          seatY = edgeCoordinates.top.y - 10; // Seat slightly above the top
        } else if (edge === 'right') {
          seatX = edgeCoordinates.right.x + 10; // Seat slightly to the right
          seatY = edgeCoordinates.right.y + (i + 1) * seatSpacing;
        } else if (edge === 'bottom') {
          seatX = edgeCoordinates.bottom.x + (i + 1) * seatSpacing;
          seatY = edgeCoordinates.bottom.y + 10; // Seat slightly below the bottom
        } else if (edge === 'left') {
          seatX = edgeCoordinates.left.x - 10; // Seat slightly to the left
          seatY = edgeCoordinates.left.y + (i + 1) * seatSpacing;
        }

        // Create the seat as a Konva Circle
        const seat = new Konva.Circle({
          id: `${ config.id }-seat-${ seats.length }`,
          radius: seatRadius,
          x: seatX,
          y: seatY,
          fill: '#000',
          stroke: '#000',
          strokeWidth: 0,
          name: 'seat',
          strokeScaleEnabled: false,
        });

        seats.push(seat);
      }
    });

    return seats;
  };

  const circleSeats = () => {
    const angleStep = (2 * Math.PI) / config.number_of_seats;
    const seats = [];

    const radius = (config.width / 2 + config.height / 2) / 2;
    for (let i = 0; i < config.number_of_seats; i++) {
      const angle = i * angleStep;
      const seatX = radius * Math.cos(angle);
      const seatY = radius * Math.sin(angle);

      const seat = new Konva.Circle({
        id: `${ config.id }-seat-${ i }`,
        radius: seatRadius,
        x: seatX,
        y: seatY,
        fill: 'black',
        name: 'seat',
        strokeScaleEnabled: false,
      });
      seats.push(seat);
      // group.add(seat);
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
    getSeats
  }
}