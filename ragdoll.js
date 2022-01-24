import { Circle, Spring, LineSegment } from './shapes.js'
import MultiSetter from './multiSetter.js';
import { distanceBetweenPoints as distPoints } from './distance.js';

class Boundary extends LineSegment {
	constructor(pointA, pointB, normal) {
		super(pointA, pointB);
	}

	hit() {}
	draw(ctx) {
		ctx.beginPath();
		ctx.moveTo(this.pointA.x, this.pointA.y);
		ctx.lineTo(this.pointB.x, this.pointB.y)
		ctx.stroke();
	}
}

class Head extends Circle {
	constructor(radius, mass, x, y) {
		super(radius, mass, x, y);
	}
	draw(ctx) {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
		ctx.stroke();
	}
}

class HandFoot extends Circle {
	constructor(radius, mass, x, y) {
		super(radius, mass, x, y);
	}
	draw(ctx) {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
		ctx.stroke();
	}
}

class Limb extends Spring {
	constructor(k, relaxedLength, pointA, pointB) {
		super(k, relaxedLength, pointA, pointB);
	}
	draw(ctx) {
		ctx.beginPath();
		ctx.moveTo(this.pointA.x, this.pointA.y);
		ctx.lineTo(this.pointB.x, this.pointB.y)
		ctx.stroke();
	}
}

class Chest extends Spring {
	constructor(k, relaxedLength, pointA, pointB) {
		super(k, relaxedLength, pointA, pointB);
	}
	draw(ctx) {
		ctx.beginPath();
		ctx.moveTo(this.pointA.x, this.pointA.y);
		ctx.lineTo(this.pointB.x, this.pointB.y)
		ctx.stroke();
	}
}

export class Ragdoll {
	constructor(posX, posY, scale) {
		this.scale = scale;
		const handFootSize = 6;
		this.nodes = [
			new Head(scale * handFootSize * 2, scale * 20, scale * (posX), scale * (posY - 60)), // Head
			new HandFoot(scale * handFootSize, scale * 10, scale * (posX + 35), scale * (posY + 5)), // Left hand
			new HandFoot(scale * handFootSize, scale * 10, scale * (posX - 35), scale * (posY + 5)), // Right hand
			new HandFoot(scale * handFootSize, scale * 10, scale * (posX + 20), scale * (posY + 60)), // Left foot
			new HandFoot(scale * handFootSize, scale * 10, scale * (posX - 20), scale * (posY + 60)), // Right foot
			new Circle(scale * handFootSize, scale * 10, scale * (posX + 10), scale * (posY - 40)), // Left shoulder
			new Circle(scale * handFootSize, scale * 10, scale * (posX - 10), scale * (posY - 40)), // Right shoulder
			new Circle(scale * handFootSize, scale * 10, scale * (posX), scale * (posY)), // Center/
		];

		this.links = [
			new Limb(50, distPoints(this.nodes[1], this.nodes[5]), this.nodes[1], this.nodes[5]), // Left arm
			new Limb(50, distPoints(this.nodes[2], this.nodes[6]), this.nodes[2], this.nodes[6]), // Right arm
			new Limb(50, distPoints(this.nodes[7], this.nodes[3]), this.nodes[7], this.nodes[3]), // Left leg
			new Limb(50, distPoints(this.nodes[7], this.nodes[4]), this.nodes[7], this.nodes[4]), // Right leg
			new Chest(50, distPoints(this.nodes[5], this.nodes[7]), this.nodes[5], this.nodes[7]), // Left chest
			new Chest(50, distPoints(this.nodes[6], this.nodes[7]), this.nodes[6], this.nodes[7]), // Right chest
			new Spring(50, distPoints(this.nodes[5], this.nodes[0]), this.nodes[5], this.nodes[0]), // Left shoulder to head
			new Spring(50, distPoints(this.nodes[6], this.nodes[0]), this.nodes[6], this.nodes[0]), // Right shoulder to head
			new Spring(50, distPoints(this.nodes[5], this.nodes[6]), this.nodes[5], this.nodes[6]), // Between shoulders
			new Spring(10, distPoints(this.nodes[1], this.nodes[2]), this.nodes[1], this.nodes[2]), // Between hands
			new Spring(10, distPoints(this.nodes[3], this.nodes[4]), this.nodes[3], this.nodes[4]), // Between feet
			new Spring(50, distPoints(this.nodes[0], this.nodes[7]), this.nodes[0], this.nodes[7]), // Between head center
		];
	}

	draw(ctx) {
		for(let node of this.nodes) {
			node.draw(ctx);
		}
		for(let link of this.links) {
			link.draw(ctx);
		}
	}

	computePhysics(timeDelta, accelerometer) {
		const resistance = 0.99;
		const minForce = this.scale * 100;
		const maxForce = this.scale * 1000;
		const ms = new MultiSetter();
		for(let node of this.nodes) {
			if(node.forced || node.pinned) {
				continue;
			}
			let force = {
				x: node.mass * accelerometer.x,
				y: node.mass * accelerometer.y,
			}
			for(let link of this.links) {
				if(link.pointA === node || link.pointB === node) {
					const linkForce = Math.abs(link.force);
					if(minForce > linkForce) {
						continue;
					}
					const forceVector = link.getForceVector(node);
					force = {
						x: force.x + forceVector.x,
						y: force.y + forceVector.y,
					};
				}
			}

			let velocity = {
				x: node.velocity.x * resistance + timeDelta * force.x / node.mass,
				y: node.velocity.y * resistance + timeDelta * force.y / node.mass,
			};
			let pos = {
				x: node.x + velocity.x * timeDelta,
				y: node.y + velocity.y * timeDelta,
			};
			ms.add(node, { velocity, x: pos.x, y: pos.y });
		}
		ms.apply();
		// console.log(1/timeDelta)
	}
}