const isIterable = <T>(x: unknown extends Iterable<T> ? Iterable<T> : any): x is Iterable<T> => typeof x?.[Symbol.iterator] === 'function';
const isAsyncIterable = <T>(x: unknown extends Iterable<T> ? Iterable<T> : any): x is AsyncIterable<T> => typeof x?.[Symbol.asyncIterator] === 'function';

type MaybePromise<T> = T | Promise<T>;

export namespace router {
	export type Action<T, R> = { (item: T): MaybePromise<R | Iterable<R> | AsyncIterable<R> | undefined> };
}

export namespace routerSync {
	export type Action<T, R> = { (item: T): R | Iterable<R> | undefined };
}

export async function* router<T, R>(iterable: Iterable<T> | AsyncIterable<T>, action: router.Action<T, R>) {
	if (!isIterable(iterable) && !isAsyncIterable(iterable))
		throw new Error('Argument type mismatch: The first argument is expected to be "iterable" or "asyncIterable".');

	if (typeof action !== 'function')
		throw new Error(`Argument type mismatch: The second argument is expected to be a "function", but received "${typeof action === 'object' ? (action ? 'object' : 'null') : typeof action}".`);

	for await (const item of iterable) {
		const result = await action(item);
		if (isIterable(result) || isAsyncIterable(result)) {
			yield* result;
		} else if (typeof result !== 'undefined') {
			yield result;
		}
	}
}

export function* routerSync<T, R>(iterable: Iterable<T>, action: routerSync.Action<T, R>) {
	if (!isIterable(iterable))
		throw new Error('Argument type mismatch: The first argument is expected to be "iterable".');

	if (typeof action !== 'function')
		throw new Error(`Argument type mismatch: The second argument is expected to be a "function", but received "${typeof action === 'object' ? (action ? 'object' : 'null') : typeof action}".`);

	for (const item of iterable) {
		const result = action(item);
		if (isIterable(result)) {
			yield* result;
		} else if (typeof result !== 'undefined') {
			yield result;
		}
	}
}

export default router;
