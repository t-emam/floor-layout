import Konva from 'konva';
import { ref } from 'vue';

export const useTable = () => {
  const tablesList = ref([]);

  const buildTable = (event) => {
    const tableId = `Table_${ tablesList.value.length + 1 }`
    const group = new Konva.Group({
      id: `table-group-${ tablesList.value.length + 1 }`,
      x: event?.x || 0,
      y: event?.y || 0,
      draggable: true,
      name: 'table-group',
      table_id: tableId
    });

    const table = new Konva.Rect({
      width: 120,
      height: 120,
      fill: '#fff',
      stroke: '#ccc',
      strokeWidth: 1,
      id: tableId
    });

    const text = new Konva.Text({
      x: 0,
      y: -20,
      text: `Table ${ tablesList.value.length + 1 }`,
      fontSize: 14,
      fontFamily: 'Roboto',
      fill: 'black',
      align: 'center',
      verticalAlign: 'middle',
    });

    group.add(table);
    group.add(text);

    // save the start drag position
    tablesList.value.push(group);
    return group;
  };

  return {
    buildTable,
    tablesList,
  };
};
