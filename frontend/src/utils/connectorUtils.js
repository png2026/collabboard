export function getObjectCenter(obj) {
  if (!obj) return { x: 0, y: 0 };

  switch (obj.type) {
    case 'circle':
      return { x: obj.x, y: obj.y };
    case 'stickyNote':
      return {
        x: obj.x + (obj.width || 200) / 2,
        y: obj.y + (obj.height || 150) / 2,
      };
    case 'frame':
      return {
        x: obj.x + (obj.width || 400) / 2,
        y: obj.y + (obj.height || 300) / 2,
      };
    case 'text':
      return {
        x: obj.x + (obj.width || 200) / 2,
        y: obj.y + (obj.fontSize || 20) / 2,
      };
    case 'line':
      return {
        x: obj.x + (obj.width || 150) / 2,
        y: obj.y,
      };
    default:
      return {
        x: obj.x + (obj.width || 120) / 2,
        y: obj.y + (obj.height || 120) / 2,
      };
  }
}

// Find where a ray from center toward target intersects a rect boundary
function rectEdgePoint(cx, cy, w, h, tx, ty) {
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  const hw = w / 2;
  const hh = h / 2;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Which edge does the ray hit first?
  let t;
  if (absDx * hh > absDy * hw) {
    // Hits left or right edge
    t = hw / absDx;
  } else {
    // Hits top or bottom edge
    t = hh / absDy;
  }
  return { x: cx + dx * t, y: cy + dy * t };
}

// Find where a ray from center toward target intersects a circle boundary
function circleEdgePoint(cx, cy, r, tx, ty) {
  const dx = tx - cx;
  const dy = ty - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return { x: cx + r, y: cy };
  return { x: cx + (dx / dist) * r, y: cy + (dy / dist) * r };
}

function getEdgePoint(obj, center, target) {
  if (obj.type === 'circle') {
    const r = obj.radius || 60;
    return circleEdgePoint(center.x, center.y, r, target.x, target.y);
  }

  let w, h;
  switch (obj.type) {
    case 'stickyNote': w = obj.width || 200; h = obj.height || 150; break;
    case 'frame': w = obj.width || 400; h = obj.height || 300; break;
    case 'text': w = obj.width || 200; h = obj.fontSize || 20; break;
    case 'line': w = obj.width || 150; h = 10; break;
    default: w = obj.width || 120; h = obj.height || 120; break;
  }

  return rectEdgePoint(center.x, center.y, w, h, target.x, target.y);
}

export function getConnectionPoints(fromObj, toObj) {
  const fromCenter = getObjectCenter(fromObj);
  const toCenter = getObjectCenter(toObj);

  const fromEdge = getEdgePoint(fromObj, fromCenter, toCenter);
  const toEdge = getEdgePoint(toObj, toCenter, fromCenter);

  return {
    fromX: fromEdge.x,
    fromY: fromEdge.y,
    toX: toEdge.x,
    toY: toEdge.y,
  };
}
