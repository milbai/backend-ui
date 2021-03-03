function setPoints(ps) {
  var pointss = [];
  for(var i = 0; i < ps.length - 1; i++) {
    setLines(ps[i].x, ps[i].y, ps[i+1].x, ps[i+1].y, pointss);
  }
  return pointss;
}

function setLines(x_start, y_start, x_end, y_end, points) {
  points.push({x: x_start, y: y_start, z: 1 });
  var x = x_start;
  while (x < x_end) {
    x += Math.random() * 10;
    var y = y_start + (x - x_start) * (y_end - y_start) / (x_end - x_start) + (Math.random() - 0.5) * 15;
    points.push({ x: x, y: y, z: 1 });
  }
}

export var results = [
  {
    groupId: 1,
    points: setPoints([
      { x: 12624667, y: 2622987.6, z: 1 },
      { x: 12624667 + 30, y: 2622987.6 + 130, z: 1 },
      { x: 12624667 + 80, y: 2622987.6 + 132, z: 1 },
      { x: 12624667 + 180, y: 2622987.6 + 250, z: 1 }
    ])
  }
];
