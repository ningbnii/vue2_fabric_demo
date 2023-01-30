function Ball() {
	let s = this;
	annie.Sprite.call(s);
	let shape = new annie.Shape();
	shape.beginFill('#ff0000');
	let radius = Math.random()*20;
	console.log(radius)
	shape.drawCircle(0,0,radius);
	shape.endFill();
	s.addChild(shape)
}

__extends(Ball,annie.Sprite)


export default Ball
