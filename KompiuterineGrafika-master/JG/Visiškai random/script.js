class Rectangle {
    constructor(x, y, xspeed, yspeed, height, width, color) {
        this.x = x;
        this.y = y;
        this.xspeed = xspeed;
        this.yspeed = yspeed;
        this.height = height;
        this.width = width;
        this.color = color;
    }
}

class ChainC {
    constructor(x, y, color){
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

var canvas = document.getElementById('canvas');
let cwidth = 600;
let cheight = 300;
var canvasContext = canvas.getContext('2d');
canvasContext.fillStyle = 'white';
canvasContext.fillRect(0, 0, 600, 300);
let animationSpeed = 7;
let xMovement = 0;
let yMovement = 0;
// const figures = [new Rectangle(xMovement, 10, 5, 0, 10, 10, 'blue'), new Rectangle(30, yMovement, 0, 5, 10, 10, 'green'), 
//     new Rectangle(xMovement, yMovement, 7, 5, 10, 10, 'red')]
const figures = [new Rectangle(xMovement, yMovement, 7, 5, 10, 10, 'red')]
const chain = []
var image = new Image();
image.src = 'S:/Juozapo/Universitetas/3kuras1semestras/Kompiuterine grafika/pasibandymas gears/gear.png';
console.log(image)
canvasContext.drawImage(image, 200 , 200);
let i = 0;
let j = 0;

//const
const ccwidth = 5;
const ccheigth = 2;
const ccspeed = 1;

setInterval(drawEverything, 30)

function drawEverything() {
    // figures[0].x = figures[0].x + figures[0].xspeed
    // figures[1].y = figures[1].y + figures[1].yspeed
    // figures[2].x = figures[2].x + figures[2].xspeed
    // figures[2].y = figures[2].y + figures[2].yspeed
    figures[0].x = figures[0].x + figures[0].xspeed
    figures[0].y = figures[0].y + figures[0].yspeed

    canvasContext.fillStyle = 'white';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    fillFigure(figures[0]);
    drawSmallGear()
    drawChain()


}

function drawChain(){
    //checkRotation()
    if(chain.length == 0 || chain[chain.length-1].x > 152)
    {
        j++;
        chain.push(new ChainC(150, 100, 'green'));
    }
    chain.forEach(c => {
        canvasContext.fillStyle = c.color;
        canvasContext.fillRect(c.x, c.y, ccwidth, ccheigth);
        c.x = c.x + ccspeed;
    })
    console.log(chain.length)

}

function drawSmallGear(){
    canvasContext.save();
    canvasContext.translate(150, 150);
    i++;
    canvasContext.rotate((Math.PI+i)/180);
    canvasContext.drawImage(image, -50 , -50);
    canvasContext.translate(0, 0);
    canvasContext.restore();
}

function fillFigure(figure) {
    checkBounce(figure)
    canvasContext.fillStyle = figure.color;
    canvasContext.fillRect(figure.x, figure.y, figure.width, figure.height);
    //console.log(figure)
}

function checkBounce(figure) {
    if(figure.xspeed != 0)
    {
        if(figure.x < 0)
        {
            figure.xspeed = -figure.xspeed;
            return;
        }

        if(figure.x >= canvas.width)
        {
            figure.xspeed = -figure.xspeed;
            return;
        }
    }
    if(figure.yspeed != 0)
    {
        if(figure.y < 0 )
        {
            figure.yspeed = -figure.yspeed;
            return;
        }

        if(figure.y >= canvas.height)
        {
            figure.yspeed = -figure.yspeed;
            return;
        }
    }
}

function drawCircle(ctx, x, y, radius, fill, stroke, strokeWidth) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
    if (fill) {
      ctx.fillStyle = fill
      ctx.fill()
    }
    if (stroke) {
      ctx.lineWidth = strokeWidth
      ctx.strokeStyle = stroke
      ctx.stroke()
    }
  }