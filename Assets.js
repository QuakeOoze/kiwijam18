imageList = [
 "tiles.png|8|16"
].map(imageDetailsFromString);

var soundList = [
];

var imagesPending = [];
var Assets = {};

var audioContext = new AudioContext();

function loadImage (url) {
  imagesPending.push(url);

  var result = new Image();
  result.onload =e=>imagesPending.splice(imagesPending.indexOf(url),1);
  result.src = url;

  let name = url.slice(url.lastIndexOf("/")+1);
  Assets[name.replace(/\.[^/.]+$/, "")]=result;
  return result;
}

function imageDetailsFromString(s) {
  let [name,framesWide=1,framesHigh=1] = s.split("|");
  name="images/"+name;
  return {name,framesWide,framesHigh}
}

function playSound(buffer,offset=0) {
var source = audioContext.createBufferSource();
source.buffer = buffer;                   
source.connect(audioContext.destination);      
source.start(0,offset);                               
}

function loadSound(url) {
  var onError = a=>(console.log(a));
  console.log(url);
var request = new XMLHttpRequest();
request.open('GET', url, true);
request.responseType = 'arraybuffer';
let name = url.slice(url.lastIndexOf("/")+1).replace(/\.[^/.]+$/, "");
Assets[name]=audioContext.createBuffer(1,1,44100);//temporary null buffer until loaded
// Decode asynchronously
request.onload = function() {
    console.log(name+" loaded");
  audioContext.decodeAudioData(request.response, function(buffer) {
    Assets[name]=buffer;
  }, onError);
}
request.send();
}

function loadAssets() {
  
  for (let i of imageList) {
      
      let image = loadImage(i.name);
      image.framesWide=i.framesWide;
      image.framesHigh=i.framesHigh;
  }

  for (let s of soundList) {
      loadSound("sounds/"+s);
  }

}
loadAssets();

function scaledImage(image, w,h=w) {
  var result=document.createElement("canvas");

  result.width=w;
  result.height=h;

  let ctx=result.getContext("2d");
  
  ctx.drawImage(image,0,0,image.width,image.height,0,0,w,h);
  return result;
}

function workingImage(from,paddingLeft=0,paddingTop=paddingLeft,paddingRight=paddingLeft,paddingBottom=paddingTop) {
  var result=document.createElement("canvas");

  result.width=from.width+paddingLeft+paddingRight;
  result.height=from.width+paddingTop+paddingBottom;


  let ctx=result.getContext("2d");
  ctx.drawImage(from,paddingLeft,paddingTop);
  return result;
}

function blankCanvas(w,h=w) {
  var result=document.createElement("canvas");
  result.width=w;
  result.height=h;
  return result;
}


CanvasRenderingContext2D.prototype.drawSprite = function(image,x,y,frame=0,scale=1) {
  let frameWidth = image.width;
  let frameHeight = image.height;
  let oy=0;
  let ox=0;
  if (image.framesWide) {
    frameWidth = image.width / image.framesWide;
    oy= Math.floor(frame/image.framesWide);
  }
  if (image.framesHigh) {
    frameHeight = image.height / image.framesHigh;
    ox= frame%image.framesWide;
  }

  let [hx,hy] = image.handle || [frameWidth/2,frameHeight/2];
  this.drawImage(image,ox*frameWidth,oy*frameHeight,frameWidth,frameHeight,x-hx*scale,y-hy*scale,frameWidth*scale,frameHeight*scale);
    

}





function moveDefaultParticle() {
  let delta = vdiff(this.position,this.lastPosition);
  this.lastPosition=this.position;
  this.position = vadd(this.position,vscale(delta,0.99));

  this.age+=1;

  if (this.age > 30) {
        
    if (probability(0.05) ) this.dead=true;
  }
 // console.log("particle end", this);

}

function drawDefaultParticle(ctx) {
  let [x,y] = this.position;
  ctx.drawSprite(this.image,x,y,this.colour)
}

function makeDefaultParticle(state) {
  let lastPosition = state.pos;
  let position=vadd(lastPosition,[ (Math.random()-0.5)*1.5, (Math.random()-0.5)*1.5 ]);

  let {image = Assets.smallPoints, colour=2,age=0 }=state;
  let dead = false;

  return {
    position,lastPosition,image,colour,dead,age,
    move:moveDefaultParticle,
    draw:drawDefaultParticle,
  }

}


function particleSystem(count,state,makeParticle=makeDefaultParticle) {
  var points = [];
  for (let i of intRange(0,count)) {
    points.push(makeParticle(state));
  }

  function draw(ctx) {
    ctx.globalCompositeOperation="lighter";
    for (let p of points) {
      p.draw(ctx);
    }
    ctx.globalCompositeOperation="source-over";
  }

  function move() {
    for (let p of points) {
      p.move();
    }
    points=points.filter(a=>a.dead==false);
    
  }
  function isActive() {
    return points.length>0;
  }
  return {move,draw,isActive};
}


