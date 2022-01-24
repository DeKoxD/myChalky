export function distanceBetweenPoints(p1, p2) {
	return (
		(p1.x - p2.x) ** 2 +
		(p1.y - p2.y) ** 2
	) ** (1/2);
};

export function distanceBetweenPointAndLine(p, lp1, lp2) {
	return (
		Math.abs(
			(lp2.y - lp1.y) * p.x -
			(lp2.x - lp1.x) * p.y +
			lp2.x * lp1.y -
			lp2.y * lp1.x
		) / distanceBetweenPoints(lp1, lp2)
	);
};