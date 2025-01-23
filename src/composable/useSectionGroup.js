import Konva from 'konva';
import {nextTick, ref} from 'vue';

export const useSectionGroup = () => {
  const sectionsList = ref([]);
  const tempPosition = ref(null);

  const isOverlapping = (group) => {
    // first children of the group contain the full width and height
    const groupBounds = group.children[0].getClientRect();

    for (let sectionGroup of sectionsList.value) {
      if (sectionGroup.attrs.id === group.attrs.id) continue;

      const sectionBounds = sectionGroup.getClientRect();
      const xOverlap = groupBounds.x <= sectionBounds.x + sectionBounds.width && groupBounds.x + groupBounds.width >= sectionBounds.x;
      const yOverlap = groupBounds.y <= sectionBounds.y + sectionBounds.height && groupBounds.y + groupBounds.height >= sectionBounds.y;

      if (xOverlap && yOverlap) {
        return true;
      }
    }
    return false;

  };

  const checkOverlapping = (event, group, onOverlapCallback = null) => {
    group.moveToTop()
    return nextTick(() => {
      if (isOverlapping(group)) {
        group.getStage().container().style.cursor = 'not-allowed';
        if (onOverlapCallback) {
          onOverlapCallback();
        }
      } else {
        group.getStage().container().style.cursor = 'move';
      }
      if (!!group?.getLayer()) {
        group.cache();
        group.getLayer().batchDraw();
      }

    })
  }

  // Build section (group + rectangle + text)
  const buildSection = (event) => {
    const group = new Konva.Group({
      id: `group-${ new Date().getTime() }`,
      x: event?.x || 0,
      y: event?.y || 0,
      draggable: true,
      name: 'section',
    });

    const section = new Konva.Rect({
      width: 450,
      height: 220,
      fill: '#fff',
      stroke: '#ccc',
      strokeWidth: 1,
    });

    const text = new Konva.Text({
      x: 30,
      y: 20,
      text: 'Section Name Here',
      fontSize: 22,
      fontFamily: 'Roboto',
      fill: 'black',
      align: 'center',
      verticalAlign: 'middle',
    });

    group.add(section);
    group.add(text);
    group.on('dragstart', (event) => {
      console.log(event.currentTarget.getPosition());

      tempPosition.value = event.currentTarget.getPosition()
    });
    group.on('dragend', (event) => checkOverlapping(event, group, ()=>{
      console.log(group.getPosition(),tempPosition.value);
      group.setPosition({
        x: tempPosition.value.x,
        y: tempPosition.value.y
      })
    }));

    sectionsList.value.push(group);
    return group;
  };

  return {
    buildSection,
    sectionsList,
    checkOverlapping
  };
};
