import { DrawableObject, Circle } from './shapes.js';
import MultiSetter from './multiSetter.js';
import {
	distanceBetweenPoints as distPoints,
	distanceBetweenPointAndLine as distPointLine
} from './distance.js';

function interact(objA, objB) {
	if(
		![objA, objB].every(obj => obj instanceof DrawableObject) ||
		![objA, objB].some(obj => obj instanceof Circle)
	) {
		return null;
	}
	
	const [mainObj, otherObj] = objA instanceof Circle
		? [ objA, objB ]
		: [ objB, objA ];

	if(otherObj instanceof Circle) {
		if(distPoints(mainObj, otherObj) < mainObj.radius + otherObj.radius) {
			const force = { x: 0, y: 0 };
			
		}
	} else if(otherObj instanceof LineSegment) {
		if(distPointLine(mainObj, otherObj.pointA, otherObj.pointB) <= mainObj.radius) {}
	}
};

function computePhysics(objectList, time) {
	for(let i = 0; i < objectList.length ?? 0; i++) {
		for(let j = i + 1; j < objectList.length; j ++) {
			interact(objectList[i], objectList[j]);
		}
	}
}

export class World {
	constructor(...objects) {
		this.objectList = [];
		this.addObjects(objects);
	}
	addObjects(...objects) {
		let added = 0;
		objects.forEach(obj => {
			if(obj instanceof DrawableObject && !this.objectList.includes(obj)) {
				this.objectList.push(obj);
				added++;
			}
		});
		return added;
	}

	draw(ctx) {
		this.objectList.forEach(obj => {
			obj.draw(ctx);
		});
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
};