import { startAccelerometerIncludingGravity } from './accelerometer.js';
import { Ragdoll } from './ragdoll.js';
class TimeDelta {
	constructor(max) {
		this.t = new Date();
		this.max = max;
	}
	get delta() {
		let t2 = new Date();
		let d = t2 - this.t;
		this.t = t2;
		return d > max ? max : d;
	}
}

class MyChalky extends HTMLElement {
	constructor() {
		super();
		
		let shadow = this.attachShadow({ mode: 'open' });
		
		const wrapper = document.createElement('div');
		const canvas = document.createElement('canvas');
		
		wrapper.setAttribute('id', 'wrapper');
		canvas.setAttribute('id', 'canvas');
		
		const ctx = canvas.getContext('2d');
		
		var style = document.createElement('style');
		style.textContent = `
		#canvas {
			border:1px solid black;
		}
		#wrapper {
			padding: 0;
			border:1px solid green;
			width: inherit;
			height: inherit;
			overflow: hidden;
			resize: both;
		}
		`;

		this.acl = {
			x: 0,
			y: 0,
			z: 0
		};

		const myChalky = new Ragdoll(
			Math.floor(canvas.width/2),
			Math.floor(canvas.height/2),
			1
		);
		myChalky.nodes[3].pinned = true;

		const time = new TimeDelta();
			
		const animation = () => {
			canvas.height = wrapper.offsetHeight;
			canvas.width = wrapper.offsetWidth;
			myChalky.computePhysics(time.delta / 75, this.acl);
			myChalky.draw(ctx);
				
			requestAnimationFrame(animation);
		}
		requestAnimationFrame(animation);

		canvas.addEventListener("click",
		() => {
			canvas.setAttribute('style', 'background:yellow;');
			startAccelerometerIncludingGravity(
				e => {
					const so = window.orientation;console.log(so)
					this.acl.x = so === 0 || so === 180 ? -e?.x : -e?.y;
					this.acl.y = so === 0 || so === 180 ? -e?.y : -e?.x;
					switch(so) {
						case 0:
							this.acl.x = e?.x;
							this.acl.y = -e?.y;
							break;
						case 90:
							this.acl.x = -e?.y;
							this.acl.y = -e?.x;
							break;
						case 180:
							this.acl.x = -e?.x;
							this.acl.y = e?.y;
							break;
						case -90:
							this.acl.x = e?.y;
							this.acl.y = e?.x;
							break;
					}
				}
			);
		}, {
				once: true
			}
		);
		
			
		// Attatch elements
		shadow.appendChild(style);
		shadow.appendChild(wrapper);
		wrapper.appendChild(canvas);
	}
	// connectedCallback() {
	// 	console.log("Connected")
	// }
}

window.customElements.define('my-chalky', MyChalky);