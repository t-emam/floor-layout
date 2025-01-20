import Konva from 'konva';

export const useImageTable = () => {

  const tables = {
    2: `<svg width="49" height="38" viewBox="0 0 49 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4.88184" width="39.0557" height="37.5522" fill="#F2F2F7"/>
        <path d="M26.5118 21.9082H22.2342V21.105L24.3636 19.1436C24.6687 18.8634 24.924 18.5677 25.1295 18.2564C25.335 17.9388 25.4377 17.6213 25.4377 17.3037V17.1916C25.4377 16.8305 25.3381 16.5378 25.1388 16.3137C24.9396 16.0895 24.6376 15.9775 24.2329 15.9775C24.0336 15.9775 23.8593 16.0055 23.7098 16.0615C23.5604 16.1176 23.4297 16.1954 23.3176 16.295C23.2117 16.3946 23.1214 16.5129 23.0467 16.6499C22.9782 16.7807 22.9222 16.9239 22.8786 17.0796L22.1781 16.8087C22.2404 16.6157 22.3245 16.4289 22.4303 16.2483C22.5424 16.0615 22.6794 15.8965 22.8413 15.7533C23.0094 15.6101 23.2086 15.4949 23.439 15.4077C23.6756 15.3206 23.9527 15.277 24.2702 15.277C24.5878 15.277 24.8711 15.3237 25.1202 15.4171C25.3692 15.5105 25.5778 15.6412 25.7459 15.8093C25.914 15.9775 26.0417 16.1767 26.1288 16.4071C26.2222 16.6375 26.2689 16.8928 26.2689 17.1729C26.2689 17.4282 26.2316 17.6648 26.1569 17.8828C26.0884 18.1007 25.9919 18.3093 25.8673 18.5085C25.7428 18.7016 25.5903 18.8915 25.4097 19.0783C25.2353 19.2651 25.0454 19.4518 24.84 19.6386L23.0841 21.2171H26.5118V21.9082Z" fill="black"/>
        <rect x="43.9375" y="9.27148" width="4.88196" height="18.5443" fill="#1C1C1E"/>
        <rect y="9.27148" width="4.88196" height="18.5443" fill="#1C1C1E"/>
      </svg>`,
    4: `<svg width="50" height="47" viewBox="0 0 50 47" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5.13916" y="4.57617" width="39.0557" height="37.5522" fill="#F2F2F7"/>
          <path d="M25.2934 26.4863V25.2068H22.1459V24.5156L24.8731 19.9672H26.0406V24.553H26.9839V25.2068H26.0406V26.4863H25.2934ZM22.8838 24.553H25.2934V20.5743H25.2467L22.8838 24.553Z" fill="black"/>
          <rect x="44.1948" y="13.8496" width="4.88196" height="18.5443" fill="#1C1C1E"/>
          <rect x="14.4478" y="4.72266" width="4.63607" height="19.5278" transform="rotate(-90 14.4478 4.72266)" fill="#1C1C1E"/>
          <rect x="15.6299" y="46.832" width="4.63607" height="19.5278" transform="rotate(-90 15.6299 46.832)" fill="#1C1C1E"/>
          <rect x="0.257324" y="13.8496" width="4.88196" height="18.5443" fill="#1C1C1E"/>
        </svg>`,
    8: `<svg width="46" height="112" viewBox="0 0 46 112" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5.50098" y="107.277" width="102.189" height="35.4756" transform="rotate(-90 5.50098 107.277)" fill="#F2F2F7"/>
          <rect x="5.50098" y="93.2402" width="4.73008" height="17.4059" transform="rotate(180 5.50098 93.2402)" fill="#1C1C1E"/>
          <rect x="5.50098" y="61.2363" width="4.73008" height="17.4059" transform="rotate(180 5.50098 61.2363)" fill="#221E1E"/>
          <rect x="5.50098" y="32.6016" width="4.73008" height="18.5288" transform="rotate(180 5.50098 32.6016)" fill="#221E1E"/>
          <rect x="45.7065" y="32.6016" width="4.73008" height="18.5288" transform="rotate(180 45.7065 32.6016)" fill="#221E1E"/>
          <rect x="45.7065" y="60.6758" width="4.73008" height="18.5288" transform="rotate(180 45.7065 60.6758)" fill="#221E1E"/>
          <rect x="45.7065" y="93.2402" width="4.73008" height="17.4059" transform="rotate(180 45.7065 93.2402)" fill="#221E1E"/>
          <rect x="15.5527" y="111.77" width="4.49184" height="15.964" transform="rotate(-90 15.5527 111.77)" fill="#221E1E"/>
          <rect x="14.9614" y="5.08789" width="4.49184" height="15.964" transform="rotate(-90 14.9614 5.08789)" fill="#221E1E"/>
       </svg>`
  }


  const buildImageTable = (number_of_seats, event) => {

    const id = new Date().getTime();
    const label = `Table ${ Math.random() }`;

    const group = new Konva.Group({
      id: `group-${ id }`,
      draggable: true,
      x: event?.x || 0,
      y: event?.y || 0,
      rotateEnabled: true,
    });

    const svgString = tables[number_of_seats] || tables[2]
    const image = new Image();
    image.src = 'data:image/svg+xml;base64,' + btoa(svgString);
    image.onload = () => {
      const tableImage = new Konva.Image({
        id: `table-${ id }`,
        image: image,
        width: 100,
        height: number_of_seats !==8 ? 100 : 200,
      });
      group.add(tableImage);

      // Add resize handles
      const resizeHandleSize = 10;
      const resizeHandle = new Konva.Rect({
        width: resizeHandleSize,
        height: resizeHandleSize,
        fill: 'black',
        offsetX: resizeHandleSize / 2,
        offsetY: resizeHandleSize / 2,
        x: tableImage.width(),
        y: tableImage.height(),
        draggable: true,
      });

      resizeHandle.on('dragmove', (e) => {
        const newWidth = e.target.x() - tableImage.x();
        const newHeight = e.target.y() - tableImage.y();

        tableImage.width(newWidth);
        tableImage.height(newHeight);
        tableImage.getLayer().batchDraw();
      });

      group.add(resizeHandle);

      const border = new Konva.Rect({
        id: `border-${ id }`,
        width: tableImage.width(),
        height: tableImage.height(),
        opacity: 0.3,
      });

      group.add(border);
    };

    return group;
  };
  return {
    buildImageTable
  };
};