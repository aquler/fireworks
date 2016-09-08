var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var fireworks = [];
var stars = [];
var starColors = ["rgba(0,0,0,.5)", "#ffe9c4", "#ffffff"];
var velocity = {x : 0, y : 0};//星星横轴和纵轴移动的速率
var lastTime = null;

window.onload = initAll;

function initAll() {
	lastTime = new Date();

	for(var i = 0; i < 50; i++) {
		//半径比较大的星星50个
		var radius = Math.random() * 2;
		stars.push(new Star(radius));

		//半径比较小的星星100个
		var radius = Math.random();
		stars.push(new Star(radius));
		stars.push(new Star(radius));
	}

	drawPic();
}

function drawPic() {
	//清除画布
	ctx.save();
	ctx.fillStyle = "rgba(0, 0, 0, 0.15)"; //透明度越小，烟花追尾效果越长
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.restore();

	var curTime = new Date();
	if(curTime - lastTime > 2000) {
		var rangeX = getRange(canvas.width / 5, canvas.width * 4 / 5);
		var rangeY = getRange(50, 200);
		var firework = new Firework(getRange(canvas.width / 3, canvas.width * 2 / 3), 3, "#FFF", rangeX, rangeY);
		fireworks.push(firework);

		lastTime = curTime;
	}

	//更新烟花数据
	for(var i=0; i<fireworks.length; i++) {
		if(!fireworks[i].dead) {
			fireworks[i].move();
		} else {
			for(var j=0; j<fireworks[i].fragments.length; j++) {
				if(!fireworks[i].fragments[j].dead) {
					fireworks[i].fragments[j].spread();
				}
			}
		}
	}

	//更新星星数据
	for(i=0; i<stars.length; i++) {
		stars[i].update();//更新，重新取得星星改变后的属性
		stars[i].render(ctx);//用更新后的属性值渲染星星
	}

	//更新月亮
	drawMoon();

	requestAnimFrame(drawPic);
}

//烟花构造函数
function Firework(pos, radius, color, rangeX, rangeY) {
	this.posX = pos;						//圆心横坐标
	this.posY = canvas.height;				//圆心纵坐标
	this.radius = radius;					//半径
	this.color = color;						//颜色
	this.dead = false;						//位置是否到达
	this.rangeX = rangeX;					//爆炸横坐标
	this.rangeY = rangeY;					//爆炸纵坐标
	this.explodeArea = getRange(50, 100);	//爆炸范围
	this.fragments = [];						//存放散开的烟花
}

Firework.prototype = {
	drawFireworks : function () {
		ctx.save();
		ctx.beginPath();
		ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.restore();
	},
	move : function () {
		var dx = this.rangeX - this.posX , dy = this.rangeY - this.posY;
		this.posX += dx * 0.01;
		this.posY += dy * 0.01;
		if(Math.abs(dx) <= this.explodeArea && Math.abs(dy) <= this.explodeArea) {
			this.dead = true;
			this.explode();
		} else {
			this.drawFireworks();
		}
	},
	explode : function () {
		var pieces = getRange(100, 200);
		var rangeExplode = getRange(150, 200);

		for(var i=0; i<pieces; i++) {
			var color = {
				r : parseInt(getRange(0, 255)),
				g : parseInt(getRange(128, 255)),
				b : parseInt(getRange(128, 255))
			};
			var rangeX = getRange(0, rangeExplode) * Math.cos(getRange(-Math.PI, Math.PI)) + this.posX;
			var rangeY = getRange(0, rangeExplode) * Math.sin(getRange(-Math.PI, Math.PI)) + this.posY; 
			var radius = getRange(0 , 2);

			var fragment = new Fragment(this.posX, this.posY, radius, color, rangeX, rangeY);
			this.fragments.push(fragment);
		}
	}
}

var Fragment = function(posX , posY , radius , color ,rangeX , rangeY){
	this.rangeX = rangeX;
	this.rangeY = rangeY;
	this.centerX = posX;//圆心
	this.centerY = posY;//圆心
	this.dead = false;
	this.radius = radius;
	this.color = color;
}

Fragment.prototype = {
	drawFragments : function () {
		ctx.save();
		ctx.beginPath();
		ctx.arc(this.centerX , this.centerY , this.radius , 0 , 2*Math.PI);
		ctx.fillStyle = "rgba("+this.color.r+","+this.color.g+","+this.color.b+",1)";
		ctx.fill()
		ctx.restore();
	},
	spread : function() {
		this.rangeY = this.rangeY+0.3;
		var dx = this.rangeX - this.centerX , dy = this.rangeY - this.centerY;
		this.centerX = Math.abs(dx) < 0.1 ? this.rangeX : (this.centerX + dx * 0.1);
		this.centerY = Math.abs(dy) < 0.1 ? this.rangeY : (this.centerY + dy * 0.1);
		if(dx === 0 && Math.abs(dy) <= 80){
			this.dead = true;
		} else {
			this.drawFragments();
		}
	}
}

//星星构造函数
function Star(radius) {
	this.alpha = Math.random();
	this.color = starColors[Math.floor(Math.random() * starColors.length)];
	this.radius = radius;
	this.pos = {
		//星星随机分布在整个画布
		x : Math.random() * canvas.width,
		y : Math.random() * canvas.height
	};
	this.valocity = {
		//横向和纵向移动的速率都是在-0.05~0.05，也就是上下左右都可以走
		x : Math.pow(-1, Math.floor(Math.random() * 1000)) * Math.random() * 0.05,
		y : Math.pow(-1, Math.floor(Math.random() * 1000)) * Math.random() * 0.05
	}
}

Star.prototype = {
	//update函数里面，每次改变的都是位移或者透明度
	update : function () {
		this.pos.x += this.valocity.x;
		this.pos.y += this.valocity.y;
		if(this.pos.x > canvas.width) {
			this.pos.x = 0;
		}
		if(this.pos.x < 0) {
			this.pos.x = canvas.width;
		}
		if(this.pos.y > canvas.height) {
			this.pos.y = 0;
		}
		if(this.pos.y < 0) {
			this.pos.x = canvas.height;
		}

		//透明度改变，让某些星星有闪烁的效果
		this.alpha += Math.pow(-1, Math.floor(Math.random() * 1000)) * Math.random() * 0.001;
	},

	//画星星
	render : function (ctx) {
		ctx.save();//保存上一次的画布
		ctx.globalAlpha = this.alpha;
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
}

//画月亮函数
function drawMoon() {
	ctx.arc(canvas.width * 5 / 6, canvas.height * 1 / 5, 80, 0, Math.PI * 2, false);
	var gradient = ctx.createRadialGradient(canvas.width * 5 / 6, canvas.height * 1 / 5, 50, canvas.width * 5 / 6, canvas.height * 1 / 5, 60);
	gradient.addColorStop(0, '#F7EEAD');
	gradient.addColorStop(1, 'rgba(240,219,120,0)');
	ctx.fillStyle = gradient;
	ctx.fill();
}

//求范围函数
function getRange(start, end) {
	return Math.floor(Math.random() * (end - start + 1) + start);
}

//动画函数
window.requestAnimFrame = (function(){
	return window.requestAnimationFrame    ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function( callback ){
		window.setTimeout(callback, 1000 / 60);
	};
})();