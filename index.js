const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const coordsDisplay = document.getElementById('coordinates');
const statusDisplay = document.getElementById('status');
const aboutModal = document.getElementById('aboutModal');

let points = [];
let draggingPoint = null;
const POINT_RADIUS = 5;

canvas.addEventListener('mousedown', startDragging);
canvas.addEventListener('mousemove', drag);
canvas.addEventListener('mouseup', stopDragging);
canvas.addEventListener('click', placePoint);

function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function placePoint(evt) {
    if (points.length >= 4) return;
    
    const pos = getMousePos(evt);
    points.push({
        x: pos.x,
        y: pos.y,
        label: ['A', 'B', 'C', 'D'][points.length]
    });
    
    updateStatus();
    draw();
}

function startDragging(evt) {
    const pos = getMousePos(evt);
    const clickedPoint = points.find(p => 
        Math.hypot(p.x - pos.x, p.y - pos.y) < POINT_RADIUS * 2
    );
    if (clickedPoint) {
        draggingPoint = clickedPoint;
    }
}

function drag(evt) {
    if (!draggingPoint) return;
    
    const pos = getMousePos(evt);
    draggingPoint.x = pos.x;
    draggingPoint.y = pos.y;
    draw();
}

function stopDragging() {
    draggingPoint = null;
}

function calculateIntersections(circle1, circle2) {
    const dx = circle2.x - circle1.x;
    const dy = circle2.y - circle1.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    
    if (d > circle1.r + circle2.r) return [];
    if (d < Math.abs(circle1.r - circle2.r)) return [];
    if (d === 0 && circle1.r === circle2.r) return [];
    
    const a = (circle1.r * circle1.r - circle2.r * circle2.r + d * d) / (2 * d);
    const h = Math.sqrt(circle1.r * circle1.r - a * a);
    
    const x2 = circle1.x + (dx * a) / d;
    const y2 = circle1.y + (dy * a) / d;
    
    const paX = x2 + (h * dy) / d;
    const paY = y2 - (h * dx) / d;
    const pbX = x2 - (h * dy) / d;
    const pbY = y2 + (h * dx) / d;
    
    return [{x: paX, y: paY}, {x: pbX, y: pbY}];
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (points.length >= 2) {
        ctx.beginPath();
        const radius1 = Math.hypot(
            points[1].x - points[0].x,
            points[1].y - points[0].y
        );
        ctx.arc(points[0].x, points[0].y, radius1, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    if (points.length >= 4) {
        ctx.beginPath();
        const radius2 = Math.hypot(
            points[3].x - points[2].x,
            points[3].y - points[2].y
        );
        ctx.arc(points[2].x, points[2].y, radius2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        const circle1 = {
            x: points[0].x,
            y: points[0].y,
            r: Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y)
        };
        const circle2 = {
            x: points[2].x,
            y: points[2].y,
            r: Math.hypot(points[3].x - points[2].x, points[3].y - points[2].y)
        };
        
        const intersections = calculateIntersections(circle1, circle2);
        intersections.forEach((p, i) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, POINT_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = 'red';
            ctx.fill();
            ctx.fillText(`I${i + 1}`, p.x + 10, p.y);
        });
    }
    
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.fillText(point.label, point.x + 10, point.y);
    });
    
    updateCoordinates();
}

function updateCoordinates() {
    let coords = points.map(p => 
        `${p.label}: (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`
    ).join(' | ');
    
    if (points.length >= 4) {
        const circle1 = {
            x: points[0].x,
            y: points[0].y,
            r: Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y)
        };
        const circle2 = {
            x: points[2].x,
            y: points[2].y,
            r: Math.hypot(points[3].x - points[2].x, points[3].y - points[2].y)
        };
        
        const intersections = calculateIntersections(circle1, circle2);
        if (intersections.length > 0) {
            coords += ' | Intersections: ' + intersections.map((p, i) =>
                `I${i + 1}(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`
            ).join(', ');
        } else {
            coords += ' | No intersections';
        }
    }
    
    coordsDisplay.textContent = coords;
}

function updateStatus() {
    if (points.length < 4) {
        statusDisplay.textContent = `Click to place point ${['A', 'B', 'C', 'D'][points.length]}`;
    } else {
        statusDisplay.textContent = 'Drag points to modify circles';
    }
}

function reset() {
    points = [];
    updateStatus();
    draw();
}

function showAbout() {
    aboutModal.style.display = 'block';
}

function closeAbout() {
    aboutModal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == aboutModal) {
        aboutModal.style.display = 'none';
    }
}

updateStatus();