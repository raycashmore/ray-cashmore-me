import { createSketch } from './sketch-glyphs';

type Coordinate = [number, number];

export function createAtrium() {
  const sketch = createSketch();
  let cursor = 0;
  // Keep a uniform photographic scale, including space for the public forecourt.
  const point = ([x, y]: Coordinate): Coordinate => [160 + x * 0.37, 10 + y * 0.37];
  function line(a: Coordinate, b: Coordinate, opacity = 0.36, width = 1.05) {
    const duration = 40 + Math.min(230, Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.24);
    sketch.line(point(a), point(b), cursor, duration, width, opacity);
    cursor += duration + 28;
  }
  function path(points: Coordinate[], opacity = 0.4, width = 1.2) {
    for (let i = 1; i < points.length; i++) line(points[i - 1], points[i], opacity, width);
    cursor += 80;
  }
  const mix = (a: Coordinate, b: Coordinate, t: number): Coordinate => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t
  ];

  // Tentative perspective and plumb lines before the structural gestures.
  line([260, 30], [270, 835], 0.1, 0.65);
  line([385, 760], [1370, 945], 0.1, 0.65);
  line([355, 755], [1110, 340], 0.12, 0.7);
  line([300, 154], [795, 12], 0.12, 0.7);
  line([1045, 15], [1035, 955], 0.1, 0.65);

  // The enormous raking strut is the photograph's defining gesture.
  path(
    [
      [270, 153],
      [308, 174],
      [754, 765],
      [711, 800],
      [270, 153]
    ],
    0.65,
    1.85
  );
  line([287, 183], [728, 778], 0.31, 0.9);
  path(
    [
      [310, 297],
      [333, 307],
      [651, 758],
      [628, 780]
    ],
    0.42,
    1.2
  );
  path(
    [
      [338, 436],
      [357, 446],
      [560, 752],
      [540, 768]
    ],
    0.32,
    1.0
  );

  // The canopy opens upward, with its upper edge deliberately cropped.
  path(
    [
      [306, 153],
      [657, 12],
      [811, 12],
      [448, 374]
    ],
    0.58,
    1.6
  );
  line([321, 178], [693, 18], 0.36, 1.0);
  line([456, 365], [824, 15], 0.5, 1.5);
  path(
    [
      [526, 307],
      [802, 26],
      [1015, 18],
      [990, 364],
      [587, 455],
      [526, 307]
    ],
    0.4,
    1.2
  );

  // Tall foreground façade and the receding glazed wall.
  path(
    [
      [1055, 16],
      [1057, 365],
      [1430, 423]
    ],
    0.59,
    1.65
  );
  path(
    [
      [1090, 17],
      [1091, 931],
      [1132, 939],
      [1134, 23]
    ],
    0.54,
    1.55
  );
  path(
    [
      [1057, 365],
      [850, 496],
      [853, 820]
    ],
    0.43,
    1.25
  );
  path(
    [
      [1055, 392],
      [853, 522],
      [587, 641]
    ],
    0.33,
    1.0
  );
  path(
    [
      [992, 448],
      [981, 902],
      [1020, 914],
      [1039, 423]
    ],
    0.51,
    1.5
  );
  path(
    [
      [1140, 463],
      [1370, 497],
      [1370, 923],
      [1140, 947]
    ],
    0.35,
    1.1
  );
  line([1394, 16], [1394, 934], 0.45, 1.3);
  path(
    [
      [28, 97],
      [248, 145],
      [250, 277]
    ],
    0.39,
    1.15
  );
  path(
    [
      [196, 15],
      [252, 145],
      [219, 233]
    ],
    0.42,
    1.25
  );
  line([28, 114], [228, 157], 0.26, 0.85);
  line([285, 285], [291, 813], 0.36, 1.1);
  line([335, 492], [337, 790], 0.28, 0.9);
  path(
    [
      [250, 829],
      [376, 771],
      [483, 784]
    ],
    0.29,
    1.0
  );

  // Select canopy ribs rather than tracing every slat in the photograph.
  for (const t of [0.16, 0.34, 0.53, 0.72, 0.9]) {
    line(mix([306, 153], [657, 12], t), mix([321, 202], [448, 374], t), 0.43, 1.3);
  }
  for (const t of [0.22, 0.43, 0.64, 0.84]) {
    line(mix([321, 202], [448, 374], t), mix([657, 12], [811, 12], t), 0.25, 0.85);
  }

  // Glazing follows the same receding plane; leave broad panes empty.
  for (const t of [0.14, 0.3, 0.49, 0.71, 0.9]) {
    line(mix([587, 455], [990, 364], t), mix([802, 26], [1015, 18], t), 0.27, 0.9);
  }
  for (const t of [0.2, 0.4, 0.62, 0.82]) {
    line(mix([526, 307], [587, 455], t), mix([802, 26], [990, 364], t), 0.23, 0.8);
  }
  for (const x of [877, 932, 976]) {
    line([x, 27], [x - 5, 483 - (x - 850) * 0.61], 0.42, 1.1);
  }
  for (const y of [143, 260]) {
    line([1140, y], [1386, y + 44], 0.31, 0.9);
  }
  for (const x of [1190, 1285, 1345]) {
    line([x, 28], [x, 396 + (x - 1140) * 0.15], 0.26, 0.85);
    line([x, 489 + (x - 1140) * 0.15], [x, 925], 0.24, 0.85);
  }

  // Entrance canopy, structural joints, and a few ground gestures give scale.
  path(
    [
      [716, 606],
      [801, 570],
      [978, 602],
      [978, 622],
      [716, 606]
    ],
    0.41,
    1.15
  );
  line([742, 614], [972, 632], 0.28, 0.9);
  line([797, 574], [918, 465], 0.23, 0.8);
  for (const t of [0.33, 0.58, 0.82]) {
    line(mix([270, 153], [711, 800], t), mix([308, 174], [754, 765], t), 0.27, 0.85);
  }
  line([465, 850], [948, 922], 0.18, 0.75);
  line([613, 955], [1363, 970], 0.16, 0.7);
  line([119, 913], [361, 809], 0.17, 0.75);

  // Selective retracing and graphite tone under the canopy and beam.
  line([275, 161], [708, 796], 0.3, 1.0);
  line([460, 364], [815, 24], 0.3, 1.0);
  for (let i = 0; i < 12; i++) {
    const t = 0.46 + i * 0.026;
    line(mix([270, 153], [711, 800], t), mix([308, 174], [754, 765], t + 0.015), 0.18, 0.8);
  }
  for (let i = 0; i < 10; i++) {
    const t = i / 12;
    line(mix([601, 449], [828, 398], t), mix([604, 476], [829, 430], t), 0.18, 0.75);
  }
  // The inhabited ground plane connects the façade to an urban place.
  path(
    [
      [1140, 947],
      [1420, 929],
      [1420, 946],
      [1100, 970],
      [1018, 942]
    ],
    0.35,
    1.05
  );
  path(
    [
      [859, 649],
      [924, 655],
      [924, 855],
      [861, 840],
      [859, 649]
    ],
    0.29,
    0.9
  );
  line([891, 653], [891, 847], 0.24, 0.8);
  // Paving fans out from the distant passage, with fewer joints in the distance.
  for (const end of [
    [40, 1100],
    [300, 1190],
    [755, 1190],
    [1260, 1180]
  ] satisfies Coordinate[]) {
    line([385, 792], end, 0.16, 0.7);
  }
  line([46, 1010], [1310, 960], 0.19, 0.75);
  line([65, 1110], [1400, 1030], 0.2, 0.8);
  line([210, 1196], [1410, 1110], 0.29, 1.05);
  line([230, 1205], [1414, 1120], 0.17, 0.7);
  // Low seating wall, seen as a shallow solid rather than a floating line.
  path(
    [
      [48, 924],
      [298, 877],
      [410, 887],
      [145, 942],
      [48, 924],
      [48, 947],
      [145, 964],
      [410, 909],
      [410, 887]
    ],
    0.36,
    1.05
  );
  line([145, 942], [145, 964], 0.3, 0.9);

  function gesture(points: Coordinate[], opacity = 0.3, width = 0.95) {
    const duration = 110;
    sketch.curve(
      point(points[0]),
      point(points[1]),
      point(points[2]),
      point(points[3]),
      cursor,
      duration,
      width,
      opacity
    );
    cursor += duration + 18;
  }
  // Loose tree crowns frame the passage; open contours keep the steel legible.
  for (const [x, ground, height, breadth] of [
    [175, 904, 330, 105],
    [437, 797, 200, 49],
    [787, 855, 247, 62]
  ]) {
    line([x, ground], [x - 3, ground - height * 0.62], 0.35, 1.2);
    line([x, ground - height * 0.35], [x - breadth * 0.48, ground - height * 0.72], 0.21, 0.8);
    line([x, ground - height * 0.47], [x + breadth * 0.52, ground - height * 0.81], 0.22, 0.8);
    const cy = ground - height * 0.7;
    for (let i = 0; i < 7; i++) {
      const a = (i * Math.PI * 2) / 7;
      const b = a + 0.76;
      gesture(
        [
          [x + Math.cos(a) * breadth, cy + Math.sin(a) * height * 0.31],
          [x + Math.cos(a + 0.22) * breadth * 1.2, cy + Math.sin(a + 0.22) * height * 0.36],
          [x + Math.cos(b - 0.18) * breadth * 0.84, cy + Math.sin(b - 0.18) * height * 0.32],
          [x + Math.cos(b) * breadth, cy + Math.sin(b) * height * 0.3]
        ],
        0.22,
        0.85
      );
    }
    line([x - breadth * 0.4, ground + 5], [x + breadth, ground + 11], 0.16, 0.8);
  }
  // Architectural staffage: head, coat, walking legs, and a cast shadow.
  // Figures grow toward the viewer, making the monumental structure readable.
  for (const [x, ground, h, stride] of [
    [391, 800, 43, 0.08],
    [495, 850, 60, -0.15],
    [624, 930, 78, 0.18],
    [1045, 1002, 92, -0.17],
    [853, 1132, 119, 0.18],
    [921, 1142, 113, -0.07]
  ]) {
    const top = ground - h;
    gesture(
      [
        [x, top],
        [x - h * 0.1, top - h * 0.02],
        [x - h * 0.1, top + h * 0.16],
        [x, top + h * 0.16]
      ],
      0.44,
      1.25
    );
    gesture(
      [
        [x, top + h * 0.16],
        [x + h * 0.1, top + h * 0.17],
        [x + h * 0.09, top],
        [x, top]
      ],
      0.4,
      1.05
    );
    path(
      [
        [x - h * 0.08, top + h * 0.21],
        [x - h * 0.13, top + h * 0.55],
        [x + h * 0.08, top + h * 0.58],
        [x + h * 0.1, top + h * 0.25]
      ],
      0.43,
      1.3
    );
    line([x - h * 0.05, top + h * 0.28], [x, top + h * 0.53], 0.27, 2.1);
    path(
      [
        [x - h * 0.07, top + h * 0.57],
        [x + h * stride, ground - h * 0.2],
        [x + h * stride * 1.5, ground]
      ],
      0.46,
      1.3
    );
    line([x + h * 0.06, top + h * 0.58], [x - h * stride, ground], 0.43, 1.3);
    line([x + h * 0.1, top + h * 0.27], [x + h * 0.21, top + h * 0.54], 0.32, 0.95);
    line([x - h * 0.22, ground + 2], [x + h * 0.58, ground + 8], 0.24, 1.0);
  }
  for (const [x, y, h] of [
    [310, 1005, 52],
    [1180, 1018, 63],
    [1300, 981, 51]
  ]) {
    path(
      [
        [x, y],
        [x, y - h],
        [x + 6, y - h],
        [x + 6, y]
      ],
      0.27,
      0.9
    );
    line([x, y + 2], [x + 37, y + 5], 0.15, 0.75);
  }
  const end = Math.max(...sketch.strokes.map((stroke) => stroke.start + stroke.duration));
  return sketch.strokes.map((stroke) => ({
    ...stroke,
    start: stroke.start * (42000 / end),
    duration: stroke.duration * (42000 / end)
  }));
}
