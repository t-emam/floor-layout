import Konva from 'konva';
import {nextTick, ref} from 'vue';

export const useSectionGroup = () => {
  const sectionsList = ref([]);
  const tempPosition = ref(null);

  const isOverlapping = (group) => {
    // first children of the group contain the full width and height
    const groupBounds = group.children[0].getClientRect();

    //loop on all sections group and skip the selected section
    for (let sectionGroup of sectionsList.value) {
      if (sectionGroup.attrs.id === group.attrs.id) continue;

      // xOverlap and yOverlap hold the current section overlapping position
      const sectionBounds = sectionGroup.getClientRect();
      const xOverlap = groupBounds.x <= sectionBounds.x + sectionBounds.width && groupBounds.x + groupBounds.width >= sectionBounds.x;
      const yOverlap = groupBounds.y <= sectionBounds.y + sectionBounds.height && groupBounds.y + groupBounds.height >= sectionBounds.y;

      if (xOverlap && yOverlap) {
        return true;
      }
    }
    return false;

  };

  // check overlapping
  const checkOverlapping = (event, group, onOverlapCallback = null) => {
    group.moveToTop()
    return nextTick(() => {
      if (isOverlapping(group)) {
        group.getStage().container().style.cursor = 'not-allowed';
        if (onOverlapCallback) {
          onOverlapCallback();
        }
      } else {
        group.getStage().container().style.cursor = 'auto';
      }
      if (!!group?.getLayer()) {
        group.cache();
        group.getLayer().batchDraw();
      }

    })
  }

  // in section
  const isOnSection = (table)=>{
    // first children of the group contain the full width and height
    const tableBounds = table.children[0].getClientRect();
    console.log('SelectedList',  sectionsList.value)

    for (let section of [...sectionsList.value]) {
      const bounds = section.children[0].getClientRect();
      const xIn = tableBounds.x <= bounds.x + bounds.width && tableBounds.x + tableBounds.width >= bounds.x;
      const yIn = tableBounds.y <= bounds.y + bounds.height && tableBounds.y + tableBounds.height >= bounds.y;

      if (xIn && yIn) {
        console.log('yes over section',section, section.id())
        return section;
      }
    }
  }


  const checkTableUnderSection = (event, table, onOverCallback = null, onOutCallback = null) => {
    table.moveToTop()
    return nextTick(() => {
      const selectedSection = isOnSection(table);
      if (selectedSection) {
        onOverCallback && onOverCallback(selectedSection);
      } else {
        onOutCallback && onOutCallback()
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
      width: 550,
      height: 550,
      fill: '#fff',
      stroke: '#ccc',
      strokeWidth: 1,
    });

    const text = new Konva.Text({
      x: 0,
      y: -20,
      text: `Section ${1+sectionsList.value.length}`,
      fontSize: 16,
      fontFamily: 'Roboto',
      fill: 'black',
      align: 'center',
      verticalAlign: 'middle',
    });

    group.add(section);
    group.add(text);

    // save the start drag position
    group.on('dragstart', (event) => {
      tempPosition.value = event.currentTarget.getPosition()
    });

    // on DragEnd check the overlapping and reset if its overlapped
    group.on('dragend', async (event) => {
      await checkOverlapping(event, group, () => {
        group.setPosition({
          x: tempPosition.value.x,
          y: tempPosition.value.y
        })
      })

      // reset the temp position
      tempPosition.value = null
    })

    // save the start drag position
    sectionsList.value.push(group);
    return group;
  };

  return {
    buildSection,
    sectionsList,
    checkOverlapping,
    checkTableUnderSection
  };
};
