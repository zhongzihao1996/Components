export default {
	groupBy(array, prop) {
		let obj = {};
		array.forEach(item => {
			let key = item[prop];
			if (!(key in obj)) {
				obj[key] = [];
			}
			obj[key].push(item);
		});
		return obj;
	},
	orderBy(arr, prop, order) {
		order = order || 'asc';
		let array = JSON.parse(JSON.stringify(arr));
		array.sort((a, b) => {
			let valueA = a[prop];
			let valueB = b[prop];
			if (typeof valueA === 'number') {
				return order === 'asc' ? valueA - valueB : valueB - valueA;
			} else if (valueA instanceof Date) {
				return order === 'asc' ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime();
			} else {
				return order === 'asc'
					? valueA.toString().localeCompare(valueB.toString())
					: valueB.toString().localeCompare(valueA.toString());
			}
		});
		return array;
	},
};
