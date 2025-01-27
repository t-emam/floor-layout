import Konva from "konva";

export const useChair = () => {

  const buildChairs = (attrs) => {
    const seats = [];
    const seatCount = attrs.number_of_seats;

    const edgeCoordinates = {
      top: {x: 0, y: 0, width: attrs.width, height: 0},
      right: {x: attrs.width, y: 0, width: 0, height: attrs.height},
      bottom: {x: 0, y: attrs.height, width: attrs.width, height: 0},
      left: {x: 0, y: 0, width: 0, height: attrs.height},
    };

    const edgeLengths = {
      top: attrs.width,
      right:  attrs.height,
      bottom:  attrs.width,
      left:  attrs.height,
    };

    let remainingSeats = seatCount - 2;

    const seatsOnLeftRight = Math.floor(remainingSeats / 2);
    let seatsOnEachEdge = {
      top: 1,
      right: seatsOnLeftRight,
      bottom: 1,
      left: seatsOnLeftRight,
    };

    const edges = ['top', 'right', 'bottom', 'left'];

    edges.forEach(edge => {
      const edgeLength = edgeLengths[edge];
      const seatCountOnEdge = seatsOnEachEdge[edge];
      const seatSpacing = edgeLength / (seatCountOnEdge + 1); // Add 1 to create space on each side

      for (let i = 0; i < seatCountOnEdge; i++) {
        let seatX = 0;
        let seatY = 0;
        let rotation = 0;

        // Calculate seat position and rotation based on edge
        if (edge === 'top') {
          seatX = edgeCoordinates.top.x + (i + 1) * seatSpacing;
          seatY = edgeCoordinates.top.y - 10; // Seat above the table
          rotation = 90; // Rotate 90 degrees for top side
        } else if (edge === 'right') {
          seatX = edgeCoordinates.right.x + 10; // Seat to the right of the table
          seatY = edgeCoordinates.right.y + (i + 1) * seatSpacing;
          rotation = 0; // No rotation for right side
        } else if (edge === 'bottom') {
          seatX = edgeCoordinates.bottom.x + (i + 1) * seatSpacing;
          seatY = edgeCoordinates.bottom.y + 10; // Seat below the table
          rotation = 90; // Rotate 90 degrees for bottom side
        } else if (edge === 'left') {
          seatX = edgeCoordinates.left.x - 10; // Seat to the left of the table
          seatY = edgeCoordinates.left.y + (i + 1) * seatSpacing;
          rotation = 180; // Rotate 180 degrees for left side
        }

        // Create chair
        const seat = new Konva.Image({
          id: `${ attrs.id }-seat-${ seats.length }`,
          width: 9,
          height: 36,
          x: seatX,
          y: seatY,
          rotation: rotation,
          offsetX: 4.5, // Center the image for rotation
          offsetY: 17, // Center the image for rotation
        });

        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="9" height="34" viewBox="0 0 9 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.312012" y="0.513672" width="8.25688" height="33.0275" fill="#1C1C1E"/>
      </svg>
    `);

        img.onload = () => {
          seat.image(img);
          layerEl.value.getNode().batchDraw(); // Redraw to show the chair image
        };

        // Add the chair to the group and store the position
        group.add(seat);
        seats.push({x: seatX, y: seatY});
      }
    });
  }
  return {
    buildChairs
  }
}