export default class Ball {
	constructor(radius) {
		base(this,LSprite,[]);
		this.sprite = new LSprite();
		addChild(this.sprite);
		this.sprite.graphics.drawArc(0, '', [0, 0, radius, 0, 2 * Math.PI], true, "#ff0000");
	}
	setX(x){
		this.sprite.x = x;
	}
}
