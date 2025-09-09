export class CollisionDetection {
    static checkAABB(rect1, rect2) {
        return rect1.left < rect2.right &&
               rect1.right > rect2.left &&
               rect1.top < rect2.bottom &&
               rect1.bottom > rect2.top;
    }
    
    static checkPointInRect(point, rect) {
        return point.x >= rect.left &&
               point.x <= rect.right &&
               point.y >= rect.top &&
               point.y <= rect.bottom;
    }
    
    static checkCircleRect(circle, rect) {
        const closestX = Math.max(rect.left, Math.min(circle.x, rect.right));
        const closestY = Math.max(rect.top, Math.min(circle.y, rect.bottom));
        
        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;
        
        return (distanceX * distanceX + distanceY * distanceY) < (circle.radius * circle.radius);
    }
    
    static getSugarBounds(sugar) {
        return {
            left: sugar.x - sugar.width/2,
            right: sugar.x + sugar.width/2,
            top: sugar.y - sugar.height/2,
            bottom: sugar.y + sugar.height/2
        };
    }
    
    static getCupBounds(cup) {
        return cup.getBounds();
    }
    
    static checkSugarCupCollision(sugar, cup) {
        const sugarBounds = this.getSugarBounds(sugar);
        const cupBounds = this.getCupBounds(cup);
        
        return this.checkAABB(sugarBounds, cupBounds);
    }
    
    static getDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    static checkLineRect(line, rect) {
        return this.checkPointInRect(line.start, rect) ||
               this.checkPointInRect(line.end, rect) ||
               this.lineIntersectsRect(line, rect);
    }
    
    static lineIntersectsRect(line, rect) {
        const left = { start: {x: rect.left, y: rect.top}, end: {x: rect.left, y: rect.bottom} };
        const right = { start: {x: rect.right, y: rect.top}, end: {x: rect.right, y: rect.bottom} };
        const top = { start: {x: rect.left, y: rect.top}, end: {x: rect.right, y: rect.top} };
        const bottom = { start: {x: rect.left, y: rect.bottom}, end: {x: rect.right, y: rect.bottom} };
        
        return this.linesIntersect(line, left) ||
               this.linesIntersect(line, right) ||
               this.linesIntersect(line, top) ||
               this.linesIntersect(line, bottom);
    }
    
    static linesIntersect(line1, line2) {
        const x1 = line1.start.x, y1 = line1.start.y;
        const x2 = line1.end.x, y2 = line1.end.y;
        const x3 = line2.start.x, y3 = line2.start.y;
        const x4 = line2.end.x, y4 = line2.end.y;
        
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denom === 0) return false;
        
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
        
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }
}