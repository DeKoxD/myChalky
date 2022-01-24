export const startAccelerometerIncludingGravity = (callback) => {
	const onDeviceMotion = (e) => {
			callback(e.accelerationIncludingGravity);
	};
	if ( typeof DeviceMotionEvent !== "undefined") {
		if(typeof DeviceMotionEvent?.requestPermission === "function") {
			DeviceMotionEvent.requestPermission()
				.then( response => {
					if ( response === "granted" ) {
						window.addEventListener( "devicemotion", onDeviceMotion);
					}
				})
				.catch(err => console.error(err));
		} else {
			window.addEventListener( "devicemotion", onDeviceMotion);
		}
	} else {
		alert( "DeviceMotionEvent is not defined" );
	}
};