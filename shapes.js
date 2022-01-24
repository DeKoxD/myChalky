import {
	distanceBetweenPoints as distPoints,
	distanceBetweenPointAndLine as distPointLine
} from './distance.js';

class Coordinates2D {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
}

class DrawableObject extends Coordinates2D {
	constructor() {
		super();
	}
	draw() { return; }
}

class Point extends DrawableObject {
	constructor(x, y, forced = false, pinned = false) {
		super();
		this.x = Number(x) || 0;
		this.y = Number(y) || 0;

		this.forced = forced;
		this.pinned = pinned;
	}
}

class PointWithMass extends Point {
	constructor(mass, x, y) {
		super(x, y);
		this.mass = Number(mass);
		this.velocity = new Coordinates2D();
		this.appliedForce = new Coordinates2D();
	}
}

class LineSegment extends DrawableObject {
	constructor(pointA, pointB) {
		super();
		this.pointA = pointA;
		this.pointB = pointB;
	}
	get length() {
		return Math.abs(
			(
				(this.pointA.x - this.pointB.x) ** 2 +
				(this.pointA.y - this.pointB.y) ** 2
			) ** (1 / 2)
		);
	}
	get pinned() {
		return !!(this.pointA.pinned && this.pointB.pinned);
	}
	get forced() {
		return !!(this.pointA.forced && this.pointB.forced);
	}

	// COMx = (x1 * m1 + x2 * m2) / (m1 + m2)
	getCenterOfMass() {
		return {
			x: (
					this.pointA.x * this.pointA.mass +
					this.pointB.x * this.pointB.mass
				) / (this.pointA.mass + this.pointB.mass),
			y: (
					this.pointA.y * this.pointA.mass +
					this.pointB.y * this.pointB.mass
				) / (this.pointA.mass + this.pointB.mass),
		}
	}
}

class Circle extends PointWithMass {
	constructor(radius, mass, x, y) {
		super(mass, x, y);
		this.radius = Number(radius) || 0;
	}

	hit(obj) {
		if(obj instanceof Circle) {
			if(distPoints(this, obj) <= this.radius + obj.radius) {}
		} else if(obj instanceof LineSegment) {
			if(distPointLine(this, obj.pointA, obj.pointB) <= this.radius) {}
		}
		return false;
	}

	collideWithCircle(obj) {
		if(!(obj instanceof Circle)) {
			return false
		}
		const masses = 2 * obj.mass / (this.mass + obj.mass);
		const centersDiff = new Coordinates2D(
			this.x - obj.x,
			this.y - obj.y
		);
		const velocityDiff = new Coordinates2D(
			this.x - obj.x,
			this.y - obj.y,
		);
		this.velocity = {
			velocity
		}
	}
}

class Spring extends LineSegment {
	constructor(k, relaxedLength, pointA, pointB) {
		super(pointA, pointB);
		this.k = k;
		this.relaxedLength = relaxedLength;
	}

	get force() {
		return (this.length - this.relaxedLength) * this.k;
	}

	getForceVector(node) {
		let otherNode;
		if(node === this.pointA) {
			otherNode = this.pointB;
		} else if(node === this.pointB) {
			otherNode = this.pointA;
		} else {
			return { x: 0, y: 0 };
		}
		return {
			x: this.force * (otherNode.x - node.x) / this.length,
			y: this.force * (otherNode.y - node.y) / this.length,
		}
	}
}

export { DrawableObject, PointWithMass, LineSegment, Circle, Spring };