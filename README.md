# Iterable Router

A router for iterable types written in Typescript, influenced by the enterprise integration patterns. More or less it is a simple map-reduce helper for iterables.


## Core concepts

- **Messages**, as fundamental units, encompass both data and metadata essential for effective communication. They serve as carriers of information exchanged between various components.
- **Channels**, the communication conduits, enable seamless message exchange between various components. They offer flexibility, allowing for synchronous or asynchronous communication.
- **Routers** direct messages to different output channels based on specified criteria, providing conditional routing and dynamic message flow control.
- **Filters** selectively allow or block messages based on predefined criteria, enabling efficient message routing and processing.
- **Splitters** break down a single message into multiple, facilitating independent processing and distribution of message parts.
- **Aggregators**, on the other hand, consolidate multiple related messages into a cohesive whole, aiding in data consolidation and streamlined processing.
- **Resequencers** are crucial in reordering messages based on specified sequencing rules, ensuring messages are processed or presented in the correct sequence.
- **Translators** play a role in converting messages from one format or another, bridging the gap between differing data representations.


## Implementation

We can pair the concepts above with javascript language constructs.

- Our channel is an iterable or an async iterable data type.
- A message is any element in this iterable.
- A router is a what we implement in this package, where we can apply all the filtering, splitting, aggregating tasks as a callback function.


## Installation

Install it via npm:

```sh
npm install iterable-router
```


## Usage

```js
import { router } from 'iterable-router';

const input = [1, 2, 3];

const output = router(input, (item) => { ... });

for await (const item of output) {
	// process the output iterable
}
```

## Documentation

### `router<T, R>(iterable: Iterable<T> | AsyncIterable<T>, action: Action<T, R>): AsyncGenerator<R>`

```ts
type Action<T, R> = { (item: T): undefined | R | Iterable<R> | AsyncIterable<R> | Promise<R | Iterable<R> | AsyncIterable<R>> };
```

The `router` function accepts two arguments:

* `iterable`: The input channel of the messages.
* `action`: The callback function that will decide what to do with the item.

> Note: the `router()` call always returns an async iterable object, even when the input and the callback function could work in sync mode.


### `routerSync<T, R>(iterable: Iterable<T>, action: Action<T, R>): Generator<R>`

```ts
type Action<T, R> = { (item: T): undefined | R | Iterable<R> };
```

The sync version of the `router()` call.
The `routerSync` function accepts two arguments:

* `iterable`: The input channel of the messages.
* `action`: The callback function that will decide what to do with the item.

### The `Action` callback

Each concept can be achieved with a well written callback function.

- **Filter**: Return `undefined` and the item is ignored. Return the item to keep it in the output.
- **Splitter**: Tear the input item into pieces, create an iterable (eg. an array) from it and return that.
- **Aggregators**: Keep an internal buffer in the callback function, return `undefined` until the last part, then when the last part is recieved, construct the aggregated item and return that.
- **Resequencers**: Similar to aggregators, but collect items to an array, sort when the last part is recieved, then return it.
- **Translators**: Return a new item in place of the input item.


## Examples

Here are some examples to demonstrate the usage:


### Mapping an array of numbers
```js
import { router } from 'iterable-router';

const data = [1, 2, 3, 4, 5];

const newData = router(data, (item) => {
  return item * 2;
});

for await (const item of newData) {
  console.log(item);
}
```

Output:

```text
2
4
6
8
10
```


### Merging multiple items

```js
import { router } from 'iterable-router';

async function* fetchData() {
  yield 'a';
  yield 'b';
  yield '\n';
  yield 'c';
  yield 'd';
  yield '\n';
}

let buffer = '';
const newData = router(fetchData(), (item) => {
  if (item === '\n') {
    const line = buffer;
    buffer = '';
    return line;
  }
  buffer += item;
});

for await (const item of newData) {
  console.log(item);
}
```

Output:

```text
ab
cd
```

## Contributions

Contributions to `iterable-router` are welcome! If you have any bug reports, feature requests, or improvements, please open an issue on the [GitHub repository](https://github.com/lionel87/iterable-router).

## License

`iterable-router` is licensed under the [MIT License](https://github.com/lionel87/iterable-router/blob/master/LICENSE).
