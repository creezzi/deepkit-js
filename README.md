# deepkit

Deep equality and deep cloning for plain objects, arrays, Maps, Sets and Dates, with cycle support.

## Usage

```js
import { deepEqual, deepClone } from "deepkit";

deepEqual({ a: [1, new Set([2])] }, { a: [1, new Set([2])] }); // true
const copy = deepClone(original);
```

## Test

```bash
npm test
```

## License

MIT
