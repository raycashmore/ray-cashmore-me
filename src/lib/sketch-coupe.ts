import { createSketch, DRAW_DURATION } from './sketch-glyphs';

type Coordinate = [number, number];

export function createCoupe() {
  const sketch = createSketch();
  let cursor = 0;
  // Landmarks traced in reference-image coordinates, then uniformly scaled.
  // Keep the foreshortening: the near rear wheel is much larger than the front.
  const point = ([x, y]: Coordinate): Coordinate => [20 + x * 0.4, 10 + y * 0.4];
  function curve(a: Coordinate, b: Coordinate, c: Coordinate, d: Coordinate, opacity = 0.5, width = 1.35) {
    const duration = 45 + Math.min(150, Math.hypot(d[0] - a[0], d[1] - a[1]) * 0.22);
    sketch.curve(point(a), point(b), point(c), point(d), cursor, duration, width, opacity);
    cursor += duration + 22;
  }
  function line(a: Coordinate, b: Coordinate, opacity = 0.3, width = 0.85) {
    const duration = 35 + Math.min(110, Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.16);
    sketch.line(point(a), point(b), cursor, duration, width, opacity);
    cursor += duration + 18;
  }

  // Ground, wheel axes and a faint roof datum establish the perspective.
  line([105, 983], [1840, 983], 0.1, 0.65);
  line([144, 250], [145, 960], 0.1, 0.65);
  line([699, 527], [729, 992], 0.12, 0.65);
  line([296, 235], [1105, 231], 0.1, 0.65);

  // The two unequal wheel ellipses are the key to the rear three-quarter view.
  curve([208, 508], [147, 490], [132, 732], [177, 795], 0.3, 1.0);
  curve([177, 795], [260, 866], [292, 545], [208, 508], 0.3, 1.0);
  curve([694, 552], [588, 523], [593, 881], [670, 963], 0.38, 1.1);
  curve([670, 963], [806, 1064], [871, 604], [694, 552], 0.38, 1.1);

  // Roof and glazing: preserve the long low crown and sloping rear screen.
  curve([402, 448], [505, 321], [541, 231], [755, 228], 0.62, 1.8);
  curve([755, 228], [933, 208], [1263, 302], [1593, 445], 0.56, 1.55);
  curve([426, 449], [521, 324], [559, 272], [657, 281], 0.44, 1.15);
  curve([657, 281], [741, 278], [842, 326], [861, 377], 0.49, 1.35);
  curve([861, 377], [896, 433], [638, 461], [426, 449], 0.48, 1.2);
  line([737, 307], [642, 439], 0.34, 1.0);
  curve([871, 277], [1089, 239], [1350, 313], [1565, 443], 0.31, 1.0);

  // Side panel and near haunch: broad surfaces, without trim or branding.
  curve([401, 452], [314, 422], [191, 452], [162, 521], 0.54, 1.5);
  curve([162, 521], [133, 558], [139, 627], [128, 675], 0.42, 1.25);
  curve([267, 679], [291, 683], [327, 684], [349, 687], 0.36, 1.0);
  curve([350, 471], [304, 538], [327, 697], [342, 754], 0.35, 1.0);
  curve([663, 441], [620, 514], [603, 701], [557, 754], 0.42, 1.25);
  curve([557, 754], [536, 795], [412, 771], [342, 754], 0.38, 1.1);
  curve([280, 799], [403, 815], [535, 850], [601, 897], 0.52, 1.5);
  curve([609, 906], [539, 697], [582, 447], [770, 448], 0.62, 1.8);
  curve([770, 448], [897, 419], [977, 460], [1108, 496], 0.5, 1.4);
  curve([752, 584], [1014, 529], [1394, 526], [1680, 511], 0.59, 1.7);

  // Rear deck and the broad tail make the viewing angle legible.
  curve([1088, 497], [1183, 458], [1476, 439], [1717, 451], 0.43, 1.2);
  line([1717, 451], [1680, 511], 0.42, 1.2);
  curve([1680, 511], [1705, 546], [1743, 570], [1771, 581], 0.49, 1.3);
  curve([1771, 581], [1810, 651], [1780, 724], [1790, 774], 0.49, 1.4);
  curve([1790, 774], [1818, 809], [1797, 863], [1779, 907], 0.4, 1.2);
  curve([836, 712], [1101, 689], [1494, 649], [1766, 609], 0.34, 1.0);
  curve([832, 873], [844, 941], [934, 952], [1122, 923], 0.47, 1.4);
  curve([1122, 923], [1336, 906], [1582, 869], [1805, 833], 0.5, 1.45);
  // Just two lamp gestures and a lower opening, not the detailed rear fascia.
  curve([882, 564], [958, 635], [1189, 618], [1285, 579], 0.43, 1.2);
  curve([910, 563], [1024, 559], [1190, 548], [1274, 546], 0.35, 0.95);
  curve([1677, 529], [1697, 558], [1721, 574], [1752, 562], 0.4, 1.0);
  curve([970, 727], [1013, 774], [982, 842], [1142, 861], 0.32, 0.95);
  curve([1142, 861], [1267, 785], [1522, 791], [1749, 751], 0.33, 1.0);

  // The wing is a defining proportion: one plane and two sparse supports.
  line([1078, 187], [1965, 218], 0.54, 1.4);
  curve([1965, 218], [1884, 276], [1754, 280], [1290, 266], 0.48, 1.35);
  line([1078, 187], [926, 218], 0.45, 1.1);
  curve([926, 218], [910, 254], [923, 309], [928, 320], 0.42, 1.05);
  line([928, 320], [1063, 338], 0.39, 1.0);
  line([1063, 338], [1078, 187], 0.45, 1.15);
  curve([1795, 289], [1874, 323], [1937, 270], [1965, 218], 0.32, 0.95);
  line([1965, 218], [1949, 339], 0.33, 1.0);
  line([1125, 477], [1279, 225], 0.49, 1.5);
  line([1279, 225], [1290, 266], 0.39, 1.0);
  line([1290, 266], [1190, 501], 0.42, 1.15);
  line([1640, 450], [1786, 234], 0.44, 1.25);
  line([1786, 234], [1795, 289], 0.36, 1.0);
  line([1795, 289], [1720, 452], 0.39, 1.0);

  // Reinforce the visible rim edges before the later detail pass.
  curve([208, 537], [163, 517], [147, 729], [184, 766], 0.4, 1.1);
  curve([184, 766], [242, 819], [270, 574], [208, 537], 0.39, 1.0);
  curve([694, 579], [610, 551], [621, 858], [682, 924], 0.49, 1.4);
  curve([682, 924], [788, 1002], [824, 635], [694, 579], 0.47, 1.3);
  curve([603, 909], [576, 746], [581, 569], [650, 528], 0.27, 0.85);
  curve([406, 440], [515, 307], [551, 244], [704, 234], 0.25, 0.85);

  // Small patches of tone under the rear and inside the wing end plate.
  for (let i = 0; i < 8; i++) {
    line([1010 + i * 24, 826], [1040 + i * 24, 803], 0.2, 0.75);
  }
  for (let i = 0; i < 5; i++) {
    line([954 + i * 19, 229 - i * 3], [954 + i * 19, 310 + i * 2], 0.16, 0.75);
  }
  // Preserve the original outline timing; the detail pass extends the study.
  const outlineEnd = Math.max(...sketch.strokes.map((stroke) => stroke.start + stroke.duration));

  function ellipse(x: number, y: number, rx: number, ry: number, opacity = 0.36) {
    curve([x, y - ry], [x + rx * 1.33, y - ry], [x + rx * 1.33, y + ry], [x, y + ry], opacity, 0.9);
    curve([x, y + ry], [x - rx * 1.33, y + ry], [x - rx * 1.33, y - ry], [x, y - ry], opacity, 0.9);
  }

  // Wing supports become open structures rather than solid blades.
  line([1156, 457], [1258, 279], 0.37, 1.0);
  line([1258, 279], [1229, 390], 0.3, 0.85);
  line([1229, 390], [1156, 457], 0.3, 0.85);
  line([1685, 435], [1765, 293], 0.33, 0.9);
  line([1765, 293], [1732, 395], 0.29, 0.8);
  line([1076, 196], [1958, 228], 0.27, 0.85);

  // Rear-screen louvers, restrained lamp contours, and the engine-cover opening.
  for (let i = 0; i < 4; i++) {
    curve(
      [1127 + i * 44, 329 + i * 29],
      [1237, 308 + i * 31],
      [1345, 337 + i * 23],
      [1420 + i * 41, 363 + i * 23],
      0.29,
      0.85
    );
  }
  curve([1260, 515], [1280, 476], [1313, 477], [1410, 476], 0.36, 1.0);
  curve([1410, 476], [1490, 475], [1590, 477], [1650, 484], 0.33, 0.95);
  curve([919, 577], [1001, 618], [1167, 605], [1256, 586], 0.3, 0.85);
  line([1695, 549], [1737, 547], 0.33, 0.95);

  // A sparse diffuser and paired exhausts anchor the broad rear face.
  curve([1360, 789], [1385, 746], [1397, 688], [1445, 676], 0.35, 1.0);
  curve([1445, 676], [1505, 666], [1610, 659], [1640, 672], 0.35, 1.0);
  line([1640, 672], [1690, 754], 0.34, 1.0);
  line([1424, 710], [1644, 694], 0.22, 0.75);
  ellipse(1531, 824, 20, 32, 0.43);
  ellipse(1581, 817, 16, 27, 0.39);
  for (const [x, y] of [
    [1214, 908],
    [1404, 886],
    [1624, 855],
    [1744, 839]
  ]) {
    line([x, y], [x, y + 51], 0.35, 1.05);
    line([x, y + 51], [x - 74, y + 18], 0.27, 0.85);
  }
  // Contact shadows and a few reflections leave most bodywork open.
  curve([306, 805], [428, 824], [535, 862], [592, 900], 0.29, 1.0);
  curve([877, 659], [1133, 633], [1435, 647], [1734, 592], 0.2, 0.75);
  for (let i = 0; i < 14; i++) {
    line([980 + i * 19, 819 + Math.sin(i) * 4], [1007 + i * 19, 791], 0.24, 0.85);
  }
  for (let i = 0; i < 8; i++) {
    line([659 + i * 22, 983], [687 + i * 22, 972], 0.22, 0.8);
  }

  return sketch.strokes.map((stroke) => ({
    ...stroke,
    start: (stroke.start * DRAW_DURATION) / outlineEnd,
    duration: (stroke.duration * DRAW_DURATION) / outlineEnd
  }));
}
