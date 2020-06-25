var area = (z) => {
  let coords = z.geometry.coordinates[0];

  let sum = 0.
  for (let i = 0; i < coords.length - 1; i ++) {
    sum += coords[i][0] * coords[i+1][1] - coords[i+1][0] * coords[i][1];
  }


  return sum/2.
}

var centroid = (z) => {
  let coords = z.geometry.coordinates[0];

  let cx = 0, cy = 0;

  for (let i = 0; i < coords.length - 1; i++) {
    cx += (coords[i][0] + coords[i+1][0]) * (coords[i][0] * coords[i+1][1] - coords[i+1][0] * coords[i][1])
    cy += (coords[i][1] + coords[i+1][1]) * (coords[i][0] * coords[i+1][1] - coords[i+1][0] * coords[i][1])
  }

  let a = area(z);
  cx /= (6*a);
  cy /= (6*a);
  return [cx, cy];
}

export {centroid};
