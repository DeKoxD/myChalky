export default class MultiSetter {
	constructor() {
		this.pending = [];
	}
	add(obj, props) {
		this.pending.push({
			obj,
			props
		});
	}
	apply() {
		this.pending.forEach(item => {
			item.obj = Object.assign(item.obj, item.props);
		});
	}
}