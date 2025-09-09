export class Conveyor {
    constructor(y, width, speed) {
        this.y = y;
        this.width = width;
        this.speed = speed;
        this.height = 40;
        this.textureOffset = 0;
        this.textureWidth = 256;
    }
    
    update(deltaTime) {
        this.textureOffset += this.speed * (deltaTime / 1000) * 100;
        
        if (this.textureOffset >= this.textureWidth) {
            this.textureOffset = 0;
        }
    }
    
    render(ctx) {
        ctx.fillStyle = '#5A5A5A';
        ctx.fillRect(0, this.y - this.height/2, this.width, this.height);
        
        ctx.fillStyle = '#4A4A4A';
        const stripeWidth = 20;
        const stripeCount = Math.ceil(this.width / stripeWidth) + 1;
        
        for (let i = 0; i < stripeCount; i++) {
            const x = (i * stripeWidth) - this.textureOffset;
            if (x > -stripeWidth && x < this.width) {
                ctx.fillRect(x, this.y - this.height/2, stripeWidth/2, this.height);
            }
        }
        
        ctx.strokeStyle = '#3A3A3A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.y - this.height/2);
        ctx.lineTo(this.width, this.y - this.height/2);
        ctx.moveTo(0, this.y + this.height/2);
        ctx.lineTo(this.width, this.y + this.height/2);
        ctx.stroke();
    }
    
    setSpeed(speed) {
        this.speed = speed;
    }
    
    getY() {
        return this.y;
    }
    
    getHeight() {
        return this.height;
    }
}