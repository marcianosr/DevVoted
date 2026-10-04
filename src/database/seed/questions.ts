import type { CategoryCode } from "~/shared/lib/categories";

export type SeedQuestion = {
	readonly category: CategoryCode;
	readonly question: string;
	readonly options: readonly string[];
	readonly correct: readonly number[];
	readonly codeBlock?: string;
	readonly explanation?: string;
};

const CSS_QUESTIONS: readonly SeedQuestion[] = [
	{
		category: "css",
		question:
			"Which value of `position` removes an element from normal flow and anchors it to the nearest positioned ancestor?",
		options: ["absolute", "relative", "sticky", "static"],
		correct: [0],
		explanation:
			"`absolute` is taken out of flow and positioned against the nearest ancestor whose position is not `static`.",
	},
	{
		category: "css",
		question: "What does `flex: 1` expand to?",
		options: [
			"flex-grow: 1; flex-shrink: 1; flex-basis: 0%",
			"flex-grow: 1; flex-shrink: 0; flex-basis: auto",
			"flex-grow: 1; flex-shrink: 1; flex-basis: auto",
			"flex-grow: 1 only",
		],
		correct: [0],
		explanation:
			"The single-value shorthand sets grow to the value, shrink to 1 and basis to 0%.",
	},
	{
		category: "css",
		question: "Which selectors have higher specificity than a single class?",
		options: [
			"An id selector",
			"An inline style attribute",
			"A type selector",
			"A universal selector",
		],
		correct: [0, 1],
		explanation:
			"Ids (1,0,0) and inline styles outrank a class (0,1,0); type and universal rank below it.",
	},
	{
		category: "css",
		question: "What is the computed width of this box?",
		codeBlock:
			".card {\n  box-sizing: border-box;\n  width: 200px;\n  padding: 20px;\n  border: 5px solid black;\n}",
		options: ["200px", "250px", "240px", "210px"],
		correct: [0],
		explanation:
			"`border-box` makes width include padding and border, so the declared 200px is the final width.",
	},
	{
		category: "css",
		question: "Which unit is relative to the root element's font size?",
		options: ["rem", "em", "ex", "vh"],
		correct: [0],
	},
	{
		category: "css",
		question:
			"Which properties can the browser animate on the compositor without triggering layout?",
		options: ["transform", "opacity", "width", "margin-left"],
		correct: [0, 1],
		explanation:
			"`transform` and `opacity` skip layout and paint; width and margin force reflow.",
	},
	{
		category: "css",
		question:
			"In `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`, what does `auto-fill` do?",
		options: [
			"Creates as many tracks as fit, leaving empty ones",
			"Collapses empty tracks so items stretch",
			"Creates exactly one track per item",
			"Repeats the pattern exactly twice",
		],
		correct: [0],
		explanation: "`auto-fill` keeps empty tracks; `auto-fit` collapses them.",
	},
	{
		category: "css",
		question: "Which of these create a new stacking context?",
		options: [
			"opacity less than 1",
			"transform other than none",
			"position: static with z-index: 10",
			"float: left",
		],
		correct: [0, 1],
		explanation:
			"z-index only applies to positioned elements, so `static` + z-index does nothing.",
	},
];

const JS_QUESTIONS: readonly SeedQuestion[] = [
	{
		category: "js",
		question: "What does this log?",
		codeBlock: "console.log(typeof null);",
		options: ['"object"', '"null"', '"undefined"', '"boolean"'],
		correct: [0],
		explanation:
			"A long-standing bug kept for backwards compatibility since the first JS engine.",
	},
	{
		category: "js",
		question: "What is the result of `0.1 + 0.2 === 0.3`?",
		options: ["false", "true", "It throws", "NaN"],
		correct: [0],
		explanation:
			"IEEE-754 doubles cannot represent 0.1 or 0.2 exactly, so the sum is 0.30000000000000004.",
	},
	{
		category: "js",
		question: "Which of these are falsy in JavaScript?",
		options: ["0", '""', "[]", "{}"],
		correct: [0, 1],
		explanation: "Every object, including empty arrays and objects, is truthy.",
	},
	{
		category: "js",
		question: "What does this log?",
		codeBlock:
			"for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
		options: ["3 3 3", "0 1 2", "0 0 0", "undefined x3"],
		correct: [0],
		explanation:
			"`var` is function-scoped, so all three closures share one binding that ends at 3.",
	},
	{
		category: "js",
		question:
			"Which array method returns a new array rather than mutating in place?",
		options: ["map", "sort", "splice", "reverse"],
		correct: [0],
	},
	{
		category: "js",
		question: "What is the difference between `==` and `===`?",
		options: [
			"`==` coerces types before comparing",
			"`===` compares type and value",
			"They are identical",
			"`===` is slower by specification",
		],
		correct: [0, 1],
	},
	{
		category: "js",
		question: "What does `Promise.allSettled` resolve with?",
		options: [
			"An array of {status, value|reason} objects",
			"The first fulfilled value",
			"An array of values, rejecting on the first error",
			"undefined",
		],
		correct: [0],
		explanation:
			"Unlike `Promise.all`, it never rejects — every outcome is reported.",
	},
	{
		category: "js",
		question: "What does this log?",
		codeBlock:
			"const obj = { a: 1 };\nconst copy = { ...obj };\ncopy.a = 2;\nconsole.log(obj.a);",
		options: ["1", "2", "undefined", "It throws"],
		correct: [0],
		explanation:
			"Spread makes a shallow copy, so writing to the copy leaves the original alone.",
	},
];

const REACT_QUESTIONS: readonly SeedQuestion[] = [
	{
		category: "react",
		question: "When does `useEffect` with an empty dependency array run?",
		options: [
			"After the first render only",
			"After every render",
			"Before the first render",
			"Never",
		],
		correct: [0],
	},
	{
		category: "react",
		question: "Why does React need a stable `key` on list items?",
		options: [
			"To match elements across renders and preserve state",
			"To avoid remounting components unnecessarily",
			"To sort the list automatically",
			"To make the list accessible",
		],
		correct: [0, 1],
		explanation: "Index keys break both guarantees when the list reorders.",
	},
	{
		category: "react",
		question: "What does this component log on every click?",
		codeBlock:
			"const [count, setCount] = useState(0);\n\nconst onClick = () => {\n  setCount(count + 1);\n  setCount(count + 1);\n};",
		options: [
			"count increases by 1",
			"count increases by 2",
			"count increases by 0",
			"It throws",
		],
		correct: [0],
		explanation:
			"Both calls close over the same `count`. `setCount(c => c + 1)` would increase by 2.",
	},
	{
		category: "react",
		question:
			"Which hook returns a mutable value that does not trigger a re-render when changed?",
		options: ["useRef", "useState", "useMemo", "useReducer"],
		correct: [0],
	},
	{
		category: "react",
		question: "What problem does `useMemo` solve?",
		options: [
			"Skipping expensive recomputation between renders",
			"Keeping a referentially stable value for dependency arrays",
			"Preventing network requests",
			"Replacing useEffect",
		],
		correct: [0, 1],
	},
	{
		category: "react",
		question: "What is the rule about calling hooks?",
		options: [
			"Only at the top level of a component or another hook",
			"Never inside conditions or loops",
			"Only inside class components",
			"Only inside useEffect",
		],
		correct: [0, 1],
		explanation:
			"React matches hooks to state by call order, so the order must be identical every render.",
	},
	{
		category: "react",
		question: "What does React's StrictMode do in development?",
		options: [
			"Double-invokes renders and effects to surface impurity",
			"Warns about deprecated APIs",
			"Enables production optimisations",
			"Disables all effects",
		],
		correct: [0, 1],
	},
	{
		category: "react",
		question:
			"Which is the correct way to update state derived from previous state?",
		options: [
			"setCount(previous => previous + 1)",
			"setCount(count + 1)",
			"count = count + 1",
			"setCount(++count)",
		],
		correct: [0],
	},
];

const TS_QUESTIONS: readonly SeedQuestion[] = [
	{
		category: "ts",
		question: "Which utility type makes every property of `T` optional?",
		options: ["Partial<T>", "Required<T>", "Readonly<T>", "Pick<T, K>"],
		correct: [0],
	},
	{
		category: "ts",
		question: "What is the difference between `unknown` and `any`?",
		options: [
			"`unknown` must be narrowed before use",
			"`any` disables type checking entirely",
			"They behave identically",
			"`unknown` is only valid in generics",
		],
		correct: [0, 1],
		explanation:
			"`unknown` is the type-safe counterpart of `any`: assignable from anything, assignable to nothing.",
	},
	{
		category: "ts",
		question: "What does `satisfies` do that a type annotation does not?",
		options: [
			"Checks conformance while keeping the literal's narrow inferred type",
			"Validates at runtime",
			"Widens the type to the annotation",
			"Creates a nominal type",
		],
		correct: [0],
	},
	{
		category: "ts",
		question: "What is the inferred type of `value` here?",
		codeBlock:
			"const config = { mode: 'dark' } as const;\nconst value = config.mode;",
		options: ['"dark"', "string", "never", "unknown"],
		correct: [0],
		explanation:
			"`as const` freezes the literal, so the property keeps its literal type instead of widening to string.",
	},
	{
		category: "ts",
		question: "Which are true of `interface` compared to `type`?",
		options: [
			"Interfaces support declaration merging",
			"Type aliases can express unions",
			"Interfaces can express unions",
			"Type aliases support declaration merging",
		],
		correct: [0, 1],
	},
	{
		category: "ts",
		question: "What does the `never` type represent?",
		options: [
			"A value that never occurs",
			"The return type of a function that always throws",
			"Any value at all",
			"null or undefined",
		],
		correct: [0, 1],
	},
	{
		category: "ts",
		question: "What does this type resolve to?",
		codeBlock: "type Result = Exclude<'a' | 'b' | 'c', 'b'>;",
		options: ["'a' | 'c'", "'b'", "never", "'a' | 'b' | 'c'"],
		correct: [0],
	},
	{
		category: "ts",
		question: "Which narrowing techniques does TypeScript understand?",
		options: [
			"typeof checks",
			"A user-defined type guard returning `x is T`",
			"A comment annotation",
			"Casting with `as`",
		],
		correct: [0, 1],
		explanation:
			"`as` asserts rather than narrows — it silences the checker instead of proving anything.",
	},
];

const HTML_QUESTIONS: readonly SeedQuestion[] = [
	{
		category: "html",
		question:
			"Which element represents navigation links to other pages or sections?",
		options: ["<nav>", "<menu>", "<aside>", "<section>"],
		correct: [0],
	},
	{
		category: "html",
		question: "What does the `defer` attribute on a script do?",
		options: [
			"Downloads in parallel and executes after parsing completes",
			"Preserves execution order between deferred scripts",
			"Blocks the parser until downloaded",
			"Executes immediately on download",
		],
		correct: [0, 1],
		explanation:
			"`async` also downloads in parallel but runs as soon as it arrives, so order is not guaranteed.",
	},
	{
		category: "html",
		question: "Which input type gives a native date picker?",
		options: [
			'type="date"',
			'type="datetime"',
			'type="calendar"',
			'type="text"',
		],
		correct: [0],
	},
	{
		category: "html",
		question: "What is the purpose of the `alt` attribute on an image?",
		options: [
			"Describes the image for screen readers",
			"Shows text when the image fails to load",
			"Sets a tooltip on hover",
			"Improves image compression",
		],
		correct: [0, 1],
		explanation:
			"`title` produces the tooltip; `alt` is the accessible text alternative.",
	},
	{
		category: "html",
		question: "Which elements are void (self-closing, no children)?",
		options: ["<img>", "<br>", "<div>", "<span>"],
		correct: [0, 1],
	},
	{
		category: "html",
		question: 'What does `<label for="email">` bind to?',
		options: [
			'The element whose id is "email"',
			'The element whose name is "email"',
			"The first input in the form",
			"Nothing, it is decorative",
		],
		correct: [0],
	},
	{
		category: "html",
		question:
			"Which attribute makes an element focusable but skipped in tab order?",
		options: ['tabindex="-1"', 'tabindex="0"', 'tabindex="1"', "disabled"],
		correct: [0],
	},
	{
		category: "html",
		question: "What is the correct doctype for HTML5?",
		options: [
			"<!DOCTYPE html>",
			"<!DOCTYPE html5>",
			'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN">',
			"No doctype is needed",
		],
		correct: [0],
	},
];

const GIT_QUESTIONS: readonly SeedQuestion[] = [
	{
		category: "git",
		question: "What is the difference between `git merge` and `git rebase`?",
		options: [
			"Rebase rewrites commit history onto a new base",
			"Merge preserves the original history with a merge commit",
			"They produce identical history",
			"Merge rewrites history",
		],
		correct: [0, 1],
	},
	{
		category: "git",
		question: "What does `git reset --hard HEAD~1` do?",
		options: [
			"Discards the last commit and all working tree changes",
			"Keeps the changes staged",
			"Creates a revert commit",
			"Only moves the branch pointer",
		],
		correct: [0],
		explanation:
			"`--soft` keeps changes staged; `--mixed` unstages them; `--hard` throws them away.",
	},
	{
		category: "git",
		question: "Which command safely undoes a commit that is already pushed?",
		options: [
			"git revert",
			"git reset --hard",
			"git commit --amend",
			"git rebase -i",
		],
		correct: [0],
		explanation:
			"Revert adds a new inverse commit, so shared history is never rewritten.",
	},
	{
		category: "git",
		question: "What does `git stash` do?",
		options: [
			"Saves uncommitted changes and cleans the working tree",
			"Creates a commit on the current branch",
			"Deletes uncommitted changes permanently",
			"Pushes changes to the remote",
		],
		correct: [0],
	},
	{
		category: "git",
		question: "What is a fast-forward merge?",
		options: [
			"Moving the branch pointer forward when there is no divergent history",
			"A merge that creates no merge commit",
			"A merge that always creates a merge commit",
			"A rebase with conflicts",
		],
		correct: [0, 1],
	},
	{
		category: "git",
		question: "What does `git cherry-pick` do?",
		options: [
			"Applies a specific commit onto the current branch",
			"Merges an entire branch",
			"Reverts a range of commits",
			"Squashes all commits",
		],
		correct: [0],
	},
	{
		category: "git",
		question: "Where does `git fetch` put the downloaded commits?",
		options: [
			"In remote-tracking branches, leaving your branch untouched",
			"Directly into your current branch",
			"In the stash",
			"In the index",
		],
		correct: [0],
		explanation: "`git pull` is `fetch` followed by `merge` (or `rebase`).",
	},
	{
		category: "git",
		question: "What does a detached HEAD state mean?",
		options: [
			"HEAD points at a commit rather than a branch",
			"New commits belong to no branch and can be lost",
			"The repository is corrupt",
			"The remote is unreachable",
		],
		correct: [0, 1],
	},
];

const GENERAL_FRONTEND_QUESTIONS: readonly SeedQuestion[] = [
	{
		category: "general-frontend",
		question: "What does the browser's critical rendering path describe?",
		options: [
			"The steps from HTML bytes to pixels on screen",
			"The order in which network requests resolve",
			"The React reconciliation algorithm",
			"The CSS cascade order",
		],
		correct: [0],
	},
	{
		category: "general-frontend",
		question: "Which are Core Web Vitals?",
		options: [
			"Largest Contentful Paint",
			"Cumulative Layout Shift",
			"Time To First Byte",
			"DOM Content Loaded",
		],
		correct: [0, 1],
		explanation:
			"TTFB and DCL are useful diagnostics but are not Core Web Vitals.",
	},
	{
		category: "general-frontend",
		question: "What is the difference between debounce and throttle?",
		options: [
			"Debounce waits for a quiet period before firing",
			"Throttle fires at most once per interval",
			"They are the same technique",
			"Throttle waits for a quiet period",
		],
		correct: [0, 1],
	},
	{
		category: "general-frontend",
		question: "What does CORS protect against?",
		options: [
			"A page reading responses from another origin without permission",
			"Cross-site scripting injection",
			"SQL injection",
			"Clickjacking",
		],
		correct: [0],
		explanation:
			"CORS is about reading cross-origin responses; CSP and X-Frame-Options handle the others.",
	},
	{
		category: "general-frontend",
		question: "Which storage survives a browser restart?",
		options: ["localStorage", "IndexedDB", "sessionStorage", "In-memory state"],
		correct: [0, 1],
	},
	{
		category: "general-frontend",
		question: "What is the purpose of a source map?",
		options: [
			"Mapping minified code back to original sources for debugging",
			"Bundling assets",
			"Compressing images",
			"Caching network requests",
		],
		correct: [0],
	},
	{
		category: "general-frontend",
		question: "What does tree shaking do?",
		options: [
			"Removes unused exports from the final bundle",
			"Requires static ES module syntax to work",
			"Minifies variable names",
			"Splits code into lazy chunks",
		],
		correct: [0, 1],
	},
	{
		category: "general-frontend",
		question: "Which accessibility rule applies to interactive elements?",
		options: [
			"They must be reachable and operable by keyboard",
			"They need an accessible name",
			"They must have a mouse-only handler",
			"They must use a div with onClick",
		],
		correct: [0, 1],
	},
];

const JAVA_QUESTIONS: readonly SeedQuestion[] = [
	{
		category: "java",
		question:
			"What is the difference between `==` and `.equals()` for objects?",
		options: [
			"`==` compares references",
			"`.equals()` compares value, if overridden",
			"They are identical for all objects",
			"`.equals()` compares references",
		],
		correct: [0, 1],
		explanation:
			"For Strings this bites often: two equal strings built at runtime are `.equals()` but not `==`.",
	},
	{
		category: "java",
		question: "What does this print?",
		codeBlock:
			'List<String> names = new ArrayList<>();\nnames.add("Ash");\nnames.add("Misty");\nSystem.out.println(names.size());',
		options: ["2", "1", "0", "It does not compile"],
		correct: [0],
	},
	{
		category: "java",
		question: "Which are true of a `record` in modern Java?",
		options: [
			"It generates equals, hashCode and toString",
			"Its fields are final",
			"It can extend another class",
			"Its fields are mutable",
		],
		correct: [0, 1],
		explanation:
			"Records are implicitly final and cannot extend a class, which is what makes them safe value carriers.",
	},
	{
		category: "java",
		question:
			"What is the difference between a checked and an unchecked exception?",
		options: [
			"Checked exceptions must be declared or caught",
			"Unchecked exceptions extend RuntimeException",
			"Unchecked exceptions must be declared",
			"Checked exceptions cannot be caught",
		],
		correct: [0, 1],
	},
	{
		category: "java",
		question: "What does the Stream API's `map` do?",
		codeBlock:
			"List<Integer> lengths = names.stream()\n    .map(String::length)\n    .toList();",
		options: [
			"Transforms each element into another value",
			"Produces a new stream without mutating the source",
			"Filters elements by a predicate",
			"Sorts the stream",
		],
		correct: [0, 1],
	},
	{
		category: "java",
		question:
			"Which collection guarantees insertion order and allows duplicates?",
		options: ["ArrayList", "HashSet", "TreeSet", "HashMap"],
		correct: [0],
	},
	{
		category: "java",
		question: "What is `Optional` used for?",
		options: [
			"Expressing that a value may be absent without using null",
			"Forcing callers to handle the empty case",
			"Improving performance",
			"Replacing all exceptions",
		],
		correct: [0, 1],
	},
	{
		category: "java",
		question: "What does `final` mean on a field?",
		options: [
			"The reference cannot be reassigned after initialisation",
			"The object it points at can still be mutated",
			"The object becomes immutable",
			"The field becomes static",
		],
		correct: [0, 1],
		explanation:
			"`final List<String> xs` still allows `xs.add(...)` — only rebinding is forbidden.",
	},
];

const PYTHON_QUESTIONS: readonly SeedQuestion[] = [
	{
		category: "python",
		question: "What does this print?",
		codeBlock:
			"def add(item, target=[]):\n    target.append(item)\n    return target\n\nprint(add(1))\nprint(add(2))",
		options: [
			"[1] then [1, 2]",
			"[1] then [2]",
			"[1, 2] then [1, 2]",
			"It raises",
		],
		correct: [0],
		explanation:
			"Default arguments are evaluated once at definition time, so the list is shared across calls.",
	},
	{
		category: "python",
		question:
			"What is a list comprehension's advantage over a for loop with append?",
		options: [
			"It is usually faster and more concise",
			"It produces the list in a single expression",
			"It uses less memory than a generator",
			"It is lazy by default",
		],
		correct: [0, 1],
	},
	{
		category: "python",
		question: "What does the `with` statement guarantee?",
		options: [
			"The context manager's __exit__ runs even if an exception is raised",
			"Resources are released deterministically",
			"The block runs in a new thread",
			"Exceptions are swallowed",
		],
		correct: [0, 1],
	},
	{
		category: "python",
		question: "Which are immutable in Python?",
		options: ["tuple", "str", "list", "dict"],
		correct: [0, 1],
	},
	{
		category: "python",
		question: "What is the GIL?",
		options: [
			"A lock allowing only one thread to execute Python bytecode at a time",
			"A reason CPU-bound threading does not scale in CPython",
			"A garbage collection algorithm",
			"A packaging format",
		],
		correct: [0, 1],
	},
	{
		category: "python",
		question: "What does `*args` collect?",
		options: [
			"Extra positional arguments as a tuple",
			"Extra keyword arguments as a dict",
			"Nothing, it is a syntax error",
			"Only the first argument",
		],
		correct: [0],
	},
	{
		category: "python",
		question: "What does this evaluate to?",
		codeBlock: "print([x * 2 for x in range(3)])",
		options: ["[0, 2, 4]", "[2, 4, 6]", "[0, 1, 2]", "[1, 2, 3]"],
		correct: [0],
	},
	{
		category: "python",
		question: "What is the difference between a generator and a list?",
		options: [
			"A generator yields values lazily, one at a time",
			"A list holds every value in memory at once",
			"A generator can be indexed",
			"A list is lazy",
		],
		correct: [0, 1],
	},
];

const RUBY_QUESTIONS: readonly SeedQuestion[] = [
	{
		category: "ruby",
		question: "What does the `!` suffix conventionally mean on a Ruby method?",
		options: [
			"It mutates the receiver in place",
			"It is the dangerous variant of a safe method",
			"It returns a boolean",
			"It raises on every failure",
		],
		correct: [0, 1],
		explanation:
			"`sort` returns a new array; `sort!` sorts the receiver and returns nil if nothing changed.",
	},
	{
		category: "ruby",
		question: "Which values are falsy in Ruby?",
		options: ["nil", "false", "0", '""'],
		correct: [0, 1],
		explanation:
			"Unlike JavaScript, 0 and empty string are truthy — only nil and false are falsy.",
	},
	{
		category: "ruby",
		question: "What does this return?",
		codeBlock: "[1, 2, 3].map { |n| n * 2 }",
		options: ["[2, 4, 6]", "[1, 2, 3]", "6", "nil"],
		correct: [0],
	},
	{
		category: "ruby",
		question: "What is a Ruby symbol?",
		options: [
			"An immutable, interned identifier",
			"A lightweight alternative to a string for keys",
			"A mutable string",
			"A type of integer",
		],
		correct: [0, 1],
	},
	{
		category: "ruby",
		question: "What does `attr_accessor :name` generate?",
		options: [
			"A `name` reader method",
			"A `name=` writer method",
			"Only a reader",
			"A class method",
		],
		correct: [0, 1],
	},
	{
		category: "ruby",
		question: "What is the difference between a block, a proc and a lambda?",
		options: [
			"A lambda checks arity strictly",
			"`return` in a lambda returns from the lambda, not the enclosing method",
			"A proc checks arity strictly",
			"Blocks are objects by default",
		],
		correct: [0, 1],
	},
	{
		category: "ruby",
		question: "What does `||=` do?",
		options: [
			"Assigns only if the variable is nil or false",
			"Always assigns",
			"Compares two values",
			"Raises if already assigned",
		],
		correct: [0],
	},
	{
		category: "ruby",
		question: "What does `freeze` do to an object?",
		options: [
			"Prevents further mutation of that object",
			"Raises FrozenError on mutation attempts",
			"Makes a deep copy",
			"Frees its memory",
		],
		correct: [0, 1],
	},
];

const GENERAL_BACKEND_QUESTIONS: readonly SeedQuestion[] = [
	{
		category: "general-backend",
		question:
			"Which HTTP status code means the request was understood but the server refuses to fulfil it?",
		options: ["403", "401", "404", "500"],
		correct: [0],
		explanation:
			"401 means unauthenticated; 403 means authenticated but not allowed.",
	},
	{
		category: "general-backend",
		question: "What do the ACID properties guarantee?",
		options: [
			"Atomicity — all or nothing",
			"Durability — committed data survives a crash",
			"Availability under partition",
			"Eventual consistency",
		],
		correct: [0, 1],
	},
	{
		category: "general-backend",
		question:
			"What problem does a database index solve, and what does it cost?",
		options: [
			"Faster reads on the indexed columns",
			"Slower writes and extra storage",
			"Faster writes",
			"Less storage",
		],
		correct: [0, 1],
	},
	{
		category: "general-backend",
		question: "What is an N+1 query problem?",
		options: [
			"One query for a list, then one query per row",
			"A symptom fixed by eager loading or a join",
			"A deadlock between transactions",
			"An index that is never used",
		],
		correct: [0, 1],
	},
	{
		category: "general-backend",
		question: "Which HTTP methods are idempotent?",
		options: ["PUT", "DELETE", "POST", "PATCH"],
		correct: [0, 1],
		explanation:
			"Repeating a PUT or DELETE lands in the same final state; POST typically creates each time.",
	},
	{
		category: "general-backend",
		question: "What does a foreign key with `ON DELETE CASCADE` do?",
		options: [
			"Deletes dependent rows when the parent is deleted",
			"Blocks deletion of the parent",
			"Sets the column to null",
			"Nothing at the database level",
		],
		correct: [0],
	},
	{
		category: "general-backend",
		question:
			"Why should a password never be stored with a fast hash like SHA-256?",
		options: [
			"Fast hashes make brute-force cheap",
			"A slow, salted KDF like bcrypt or argon2 is required",
			"SHA-256 is reversible",
			"SHA-256 cannot be salted",
		],
		correct: [0, 1],
	},
	{
		category: "general-backend",
		question: "What is the purpose of a database transaction?",
		options: [
			"Grouping statements so they commit or roll back together",
			"Isolating concurrent work from partial state",
			"Speeding up single-row reads",
			"Replacing indexes",
		],
		correct: [0, 1],
	},
];

const VUE_QUESTIONS: readonly SeedQuestion[] = [
	{
		category: "vue",
		question: "What does `ref()` return in Vue 3?",
		options: [
			"A reactive object with a `.value` property",
			"A plain unwrapped value",
			"A computed property",
			"A DOM node",
		],
		correct: [0],
	},
	{
		category: "vue",
		question: "What is the difference between `ref` and `reactive`?",
		options: [
			"`ref` works with primitives and objects",
			"`reactive` only works with objects",
			"`reactive` works with primitives",
			"They are identical",
		],
		correct: [0, 1],
	},
	{
		category: "vue",
		question: "What does `v-if` do differently from `v-show`?",
		options: [
			"`v-if` removes the element from the DOM entirely",
			"`v-show` only toggles the CSS display property",
			"`v-show` unmounts the component",
			"They are identical",
		],
		correct: [0, 1],
	},
	{
		category: "vue",
		question: "How does a child component send data to its parent?",
		options: [
			"By emitting an event the parent listens to",
			"By mutating the prop directly",
			"By writing to a global variable",
			"Props are two-way by default",
		],
		correct: [0],
		explanation:
			"Props flow down, events flow up — props are one-way by design.",
	},
	{
		category: "vue",
		question: "What is a `computed` property?",
		options: [
			"A derived value cached until its dependencies change",
			"A value recomputed on every access",
			"A lifecycle hook",
			"A DOM event handler",
		],
		correct: [0],
	},
	{
		category: "vue",
		question: "What does the `key` attribute do in a `v-for`?",
		options: [
			"Gives Vue a stable identity to track each node",
			"Helps Vue patch the list efficiently on reorder",
			"Sorts the list",
			"Is purely decorative",
		],
		correct: [0, 1],
	},
	{
		category: "vue",
		question: "What does `<script setup>` provide?",
		options: [
			"Compile-time sugar exposing top-level bindings to the template",
			"Less boilerplate than the Options API",
			"Runtime-only behaviour",
			"Support for Vue 2 only",
		],
		correct: [0, 1],
	},
	{
		category: "vue",
		question:
			"Which lifecycle hook runs after the component is mounted to the DOM?",
		options: ["onMounted", "onBeforeMount", "onUpdated", "onUnmounted"],
		correct: [0],
	},
];

export const SEED_QUESTIONS: readonly SeedQuestion[] = [
	...CSS_QUESTIONS,
	...JS_QUESTIONS,
	...REACT_QUESTIONS,
	...TS_QUESTIONS,
	...HTML_QUESTIONS,
	...GIT_QUESTIONS,
	...GENERAL_FRONTEND_QUESTIONS,
	...JAVA_QUESTIONS,
	...PYTHON_QUESTIONS,
	...RUBY_QUESTIONS,
	...GENERAL_BACKEND_QUESTIONS,
	...VUE_QUESTIONS,
];
