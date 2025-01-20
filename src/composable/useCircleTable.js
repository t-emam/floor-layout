import Konva from 'konva';

export const useCircleTable = () => {

  const buildCircleTable = (number_of_seats, event, width=100, height=100)=>{
    const radius = (Number(width) + Number(height)) / 2 * 0.5;

    console.log(radius, width, height)
    const table = {
      id: new Date().getTime(),
      text: `Table ${Math.random(1, 10000)}`,
      radius,
      number_of_seats,
    };

    const group = new Konva.Group({
      id: `group-${table.id}`,
      draggable: true,
    });

    const tableShape = new Konva.Circle({
      id: table.id,
      x: event?.x || 0,
      y: event?.y || 0,
      radius: table.radius,
      fill: '#e8e8e8',
    });

    group.add(tableShape);

    const seatRadius = 5 + (10  - number_of_seats/100);
    const angleStep = (2 * Math.PI) / table.number_of_seats;

    for (let i = 0; i < table.number_of_seats; i++) {
      const angle = i * angleStep;
      const seatX = event?.x+table.radius * Math.cos(angle);
      const seatY = event?.y+table.radius * Math.sin(angle);

      const seat = new Konva.Circle({
        id: `${table.id}-seat-${i}`,
        radius: seatRadius,
        x: seatX,
        y: seatY,
        fill: 'black',
      });

      group.add(seat);
    }

    return group;
  }


  return {
    buildCircleTable
  }
}