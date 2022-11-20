var canvas = document.getElementById('canvas');
let cwidth = 500;
let cheight = 500;
var ctx = canvas.getContext('2d');
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, cwidth, cheight);
scaleX = 0.23;
draw();

function draw(){
    //top left
    transformAndDraw(0, 0, scaleX, scaleX, null);
    //top middle left
    transformAndDraw(250, 0, scaleX, scaleX, Math.PI/2);
    //top middle right
    transformAndDraw(375, 0, -scaleX, scaleX, null);
    //top right
    transformAndDraw(500, 115, scaleX, scaleX, Math.PI);
    // left middle big
    transformAndDraw(250, 355, scaleX+scaleX, scaleX+scaleX, Math.PI);
    // right middle big
    transformAndDraw(500, 125, -scaleX-scaleX, scaleX+scaleX, null);
    //bottom left
    transformAndDraw(0, 500, scaleX, scaleX, Math.PI/2*3);
    //bottom middle left
    transformAndDraw(250, 375, -scaleX, scaleX, null);
    //bottom middle right
    transformAndDraw(375, 375, scaleX, scaleX, Math.PI/2);
    //bottom right
    transformAndDraw(380, 490, scaleX, -scaleX, null);
}

function transformAndDraw(tx, ty, sx, sy, rotate){
    ctx.save()
    ctx.translate(tx ,ty)
    ctx.scale(sx, sy)
    ctx.rotate(rotate)
    if(sx < 0 || sy < 0){
        drawF(true)
    }
    else{
        drawF(false)
    }
    ctx.restore()
}

function drawF(mirror){
    if(mirror){
        ctx.fillStyle = 'yellow';
    } else {
        ctx.fillStyle = 'green';
    }
    ctx.moveTo(200, 200);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(500,0);
    ctx.lineTo(500,100);
    ctx.lineTo(125,100);
    ctx.lineTo(125,200);
    ctx.lineTo(350,200);
    ctx.lineTo(350,300);
    ctx.lineTo(350,300);
    ctx.lineTo(125,300);
    ctx.lineTo(125,500);
    ctx.lineTo(0,500);
    ctx.fill();
}