import assert from 'assert';
import { Readable } from 'stream';
import { router, routerSync } from '../esm/index.js';

const seq = n => Array.from({ length: n }, (v, i) => ({ a: i }));

const toGenerator = function* (source) { yield* source; };
const toAsyncGenerator = async function* (source) { yield* source; };
const toObjectStream = function (source) {
	return new Readable({
		objectMode: true,
		read() {
			this.push(source.shift() || null);
		}
	});
};

const double = ({ a }) => ({ a: 2 * a });
let sumPairsMemoized = undefined;
const sumPairs = ({ a }) => {
	if (typeof sumPairsMemoized === 'undefined') {
		sumPairsMemoized = a;
		return;
	}
	const result = { a: a + sumPairsMemoized };
	sumPairsMemoized = undefined;
	return result;
};
const keepEven = (d) => {
	if (d.a % 2 === 0) return d;
};
const duplicate = ({ a }) => [{ a }, { a: 2 * a }];

describe('General Tests for routerSync()', () => {
	it('can map an array', async () => {
		const input = seq(5);
		const expected = seq(5).map(double);

		const output = [];
		for (const item of routerSync(input, double)) {
			output.push(item);
		}

		assert.deepStrictEqual(output, expected);
	});

	it('can filter an array', async () => {
		const input = seq(5);
		const expected = seq(5).filter(keepEven);

		const output = [];
		for (const item of routerSync(input, keepEven)) {
			output.push(item);
		}

		assert.deepStrictEqual(output, expected);
	});

	it('can merge array items', async () => {
		const input = seq(5);
		const expected = seq(5).map(sumPairs).filter(Boolean);
		sumPairsMemoized = undefined;

		const output = [];
		for (const item of routerSync(input, sumPairs)) {
			output.push(item);
		}
		sumPairsMemoized = undefined;

		assert.deepStrictEqual(output, expected);
	});

	it('can split array items', async () => {
		const input = seq(5);
		const expected = seq(5).map(duplicate).flat();

		const output = [];
		for (const item of routerSync(input, duplicate)) {
			output.push(item);
		}

		assert.deepStrictEqual(output, expected);
	});
});

describe('General Tests for router()', () => {
	it('can map items', async () => {
		const input = seq(5);
		const expected = seq(5).map(double);

		const output = [];
		for await (const item of router(input, double)) {
			output.push(item);
		}

		assert.deepStrictEqual(output, expected);
	});

	it('can filter items', async () => {
		const input = seq(5);
		const expected = seq(5).filter(keepEven);

		const output = [];
		for await (const item of router(input, keepEven)) {
			output.push(item);
		}

		assert.deepStrictEqual(output, expected);
	});

	it('can merge items', async () => {
		const input = seq(5);
		const expected = seq(5).map(sumPairs).filter(Boolean);
		sumPairsMemoized = undefined;

		const output = [];
		for await (const item of router(input, sumPairs)) {
			output.push(item);
		}
		sumPairsMemoized = undefined;

		assert.deepStrictEqual(output, expected);
	});

	it('can split items', async () => {
		const input = seq(5);
		const expected = seq(5).map(duplicate).flat();

		const output = [];
		for await (const item of router(input, duplicate)) {
			output.push(item);
		}

		assert.deepStrictEqual(output, expected);
	});

	it('can iterate over iterable', async () => {
		const input = toGenerator(seq(5));
		const expected = seq(5).map(double);

		const output = [];
		for await (const item of router(input, double)) {
			output.push(item);
		}

		assert.deepStrictEqual(output, expected);
	});

	it('can iterate over async iterable', async () => {
		const input = toAsyncGenerator(seq(5));
		const expected = seq(5).map(double);

		const output = [];
		for await (const item of router(input, double)) {
			output.push(item);
		}

		assert.deepStrictEqual(output, expected);
	});

	it('can iterate over object stream', async () => {
		const input = toObjectStream(seq(5));
		const expected = seq(5).map(double);

		const output = [];
		for await (const item of router(input, double)) {
			output.push(item);
		}

		assert.deepStrictEqual(output, expected);
	});
});



// tap.test('works on iterable inputs', async () => {
// 	const input = toGenerator(seq(5));
// 	const expected = seq(5);

// 	const output = [];
// 	const writer = item => { if (!item.done) output.push(item.value); };

// 	await staticPages({
// 		from: input,
// 		to: writer,
// 	});

// 	tap.match(output, expected);
// });

// tap.test('works on async iterable inputs', async () => {
// 	const input = toAsyncGenerator(seq(5));
// 	const expected = seq(5);

// 	const output = [];
// 	const writer = item => { if (!item.done) output.push(item.value); };

// 	await staticPages({
// 		from: input,
// 		to: writer,
// 	});

// 	tap.match(output, expected);
// });

// tap.test('works on object stream inputs', async () => {
// 	const input = toObjectStream(seq(5));
// 	const expected = seq(5);

// 	const output = [];
// 	const writer = item => { if (!item.done) output.push(item.value); };

// 	await staticPages({
// 		from: input,
// 		to: writer,
// 	});

// 	tap.match(output, expected);
// });

// tap.test('it executes the controller which can alter the output', async () => {
// 	const input = seq(5);
// 	const expected = seq(5).map(x => ({ a: x.a + 1 }));

// 	const output = [];
// 	const writer = item => { if (!item.done) output.push(item.value); };

// 	await staticPages({
// 		from: input,
// 		to: writer,
// 		controller: (d) => ({ a: d.a + 1 }),
// 	});

// 	tap.match(output, expected);
// });

// tap.test('controller can insert additional items to output', async () => {
// 	const input = seq(5);
// 	const expected = [];
// 	for (let i = 0; i < input.length; i++) {
// 		expected.push({ a: input[i].a + 1 });
// 		expected.push({ b: input[i].a });
// 	}

// 	const output = [];
// 	const writer = item => { if (!item.done) output.push(item.value); };

// 	await staticPages({
// 		from: input,
// 		to: writer,
// 		controller: (d) => [{ a: d.a + 1 }, { b: d.a }], // output two items for each input item
// 	});

// 	tap.match(output, expected);
// });

// tap.test('controller can remove items from output', async () => {
// 	const input = seq(5);
// 	const expected = seq(5).filter(x => x.a % 2 === 0);

// 	const output = [];
// 	const writer = item => { if (!item.done) output.push(item.value); };

// 	await staticPages({
// 		from: input,
// 		to: writer,
// 		controller: (d) => d.a % 2 === 0 ? d : undefined, // mod2? d / nothing
// 	});

// 	tap.match(output, expected);
// });

// tap.test('writer.teardown() is called on end', async () => {
// 	const input = seq(5);

// 	const expected = true;
// 	let output = false;
// 	const writer = item => { if (item.done) output = true; };

// 	await staticPages({
// 		from: input,
// 		to: writer,
// 	});

// 	tap.equal(output, expected);
// });
