-- Migration from Firebase to PostgreSQL
-- User ID: 65ad226e-e3c1-4e7f-a96d-a84156589733

BEGIN;

-- Poll 1: On web there is a small icon seen next in your browser tab i...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('On web there is a small icon seen next in your browser tab is there to sit, what''s the name of it?', 322, NULL, NULL, 'closed', 'single', '2023-08-16T07:46:16.504Z', '2023-08-16T07:46:16.504Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'icon', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'svg', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'image ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'favicon', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'app logo ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'app icon ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'logo', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'browser icon', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'browser logo', false);

-- Poll 2: In TypeScript, inference makes TypeScript smart, what are th...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In TypeScript, inference makes TypeScript smart, what are the facts you can tell apart?', 31, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.853Z', '2025-11-09T18:57:41.853Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Inference means that TypeScript interferes with your code, kind of a spelling checker ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Inference is not part of TypeScript, it’s VSCode who is smart enough to recognize your types', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Inference means that TypeScript can automatically understand types without explicit typing', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Inference means that TypeScript can’t automatically understand types without explicit typing ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Inference is an AI developer by Microsoft especially for TypeScript, running through codebases to allow type inference', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Inference means that TypeScript “interferes” which is some kind of middleware for TypeScript', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Inference means that TypeScript has a system which modulized your code so it doesn’t interfere or clash with other libraries ', false);

-- Poll 3: These polls are full of twists and turns, what is it that an...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('These polls are full of twists and turns, what is it that an async function always returns? ', 379, NULL, NULL, 'closed', 'single', '2024-02-14T09:51:46.008Z', '2024-02-14T09:51:46.008Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'An await ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A boolean ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A function ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A promise', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A json response ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A TypeScript typed interface ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A future', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Another async function ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'An object', false);

-- Poll 4: In React,`context` is a technique you sometimes involve, but...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In React,`context` is a technique you sometimes involve, but what is it and what problem does `context` solve?', 11, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.853Z', '2025-11-09T18:57:41.853Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is the same as the keyword `this` because `this` is `context` dependent and was used very much in class components. Since React is not class based anymore the React team came up with `context` as replacement which can be used in function components', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a built-in “broadcast” mechanism to share and persist data across components. It solves the prop drilling problem because you can call context in any component wrapped with a provider, and helps you manage local/global state', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a mechanism to optimizes your components in a certain context', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is an external state management library like Redux or MobX and often used with React, which makes everyone think it’s built in React', false);

-- Poll 5: In HTML, we browse around with various screens and devices, ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, we browse around with various screens and devices, what attribute can be used to deliver images in different sizes?', 143, NULL, NULL, 'closed', 'single', '2023-07-14T07:53:23.348Z', '2023-07-14T07:53:23.348Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'layout', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'responsive', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'src', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'source', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A JS library is at least required for this', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'resolution', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'srcset', true);

-- Poll 6: See the following code on the screen, what should the output...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, what should the output have been? ', 273, '(function () {\n  const secret = "I am a secret";\n})();\n\nconsole.log(secret);', NULL, 'closed', 'single', '2023-05-08T07:51:28.904Z', '2023-05-08T07:51:28.904Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'undefined ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"secret" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Uncaught ReferenceError: secret is not defined', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Uncaught TypeError: secret is not typed', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"I am a secret"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Syntax Error', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'SecurityError: Secrets should not be stored plainly in code', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'SecretError: The error can''t be shown because it''s a secret', false);

-- Poll 7: In the cascade's gentle sway, which properties inherit by de...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In the cascade''s gentle sway, which properties inherit by default its way?', 424, NULL, NULL, 'closed', 'multiple', '2024-05-01T09:11:09.192Z', '2024-05-01T09:11:09.192Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'color', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'margin', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'font-family', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'line-height', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'word-wrap', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'background-color', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'display', false);

-- Poll 8: Part 2: See these code snippets I make, which of these answe...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Part 2: See these code snippets I make, which of these answers below are a fake?', 290, NULL, NULL, 'closed', 'multiple', '2023-05-15T07:41:16.184Z', '2023-05-15T07:41:16.184Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="text" spellcheck="false" placeholder="No spell check here!">', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<section split-screen="true">', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<p translate="no">This content should not be translated</p>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<details open>\n  <summary>Click to reveal more information</summary>\n  <p>This content is hidden by default</p>\n</details>\n', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<video mode="theather-mode"></video>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<link to="/polls/id">Click me!</link>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="range" step="10" min="0" max="100" value="50">', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<p dir="rtl">This text content is right-to-left</p>\n<p dir="ltr">This text content is left-to-right</p>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<p>I want to know what a <span dictionary="true">specific</span> word means</p>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<meter optimum="40"></meter>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<label pricetag={600} />', true);

-- Poll 9: Non-mobile friendly sites makes me gag, what will happen if ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Non-mobile friendly sites makes me gag, what will happen if you include this metatag?', 214, '<meta name="viewport" content="width=device-width, initial-scale=1" />', NULL, 'closed', 'single', '2023-01-25T08:29:52.110Z', '2023-01-25T08:29:52.110Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The device will provide different screen sizes and instructs the browser to ask the user in which size the user want''s to see the website or app', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You''ll enable a progressive web app when applying this tag', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The HTML compiler will throw an error because without this tag the document is invalid and may cause accidents when people use your website or app ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It removes the need for media queries in CSS ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It applies default screen breakpoints dynamically without the need to define them yourself', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Nothing, but it is injected by the browser by default and nobody knows why ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It makes sure device pixels correctly map to CSS pixels and is consistent on every viewport', true);

-- Poll 10: The following property you may have seen, what is the behavi...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('The following property you may have seen, what is the behaviour of this property you''ll see on the screen? ', 386, 'appearance: none', NULL, 'closed', 'single', '2024-03-21T10:08:25.937Z', '2024-03-21T10:08:25.937Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It hides the element the property is applied on ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It provides a clean state for styling native html elements, which makes it easier ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It determines if it should appear on assistive technologies ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is used to animate elements from invisible to visible (unappearence and appearance state)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It makes sure all elements have native HTML styling (handy for CSS resets for example) ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a property that makes all HTML elements consistent across browser with native styling', false);

-- Poll 11: This codepen shows a trick I recently learned from Roel, wha...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('This codepen shows a trick I recently learned from Roel, what property is used displaying numbers each with the same size, something I think is really cool!', 124, NULL, 'https://codesandbox.io/embed/morning-bush-o60dii?fontsize=14&hidenavigation=1&theme=dark&view=preview', 'closed', 'single', '2022-12-15T09:09:19.147Z', '2022-12-15T09:09:19.147Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'font-width: equal-width', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'font-variant-numeric: tabular-nums', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using serif fonts', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By setting the font-weight to it''s maximum so the font''s are too heavy to move around', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using "display: table" on your font', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By looping over all characters on your app with JavaScript and apply .style.width = "20px"  ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using CSS subgrid ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using line-clamp ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'font-size: minmax(1rem, 2rem)', false);

-- Poll 12: React does something under the hood called state batch, to d...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('React does something under the hood called state batch, to describe this mechanic, what answer from below is the best match? ', 318, NULL, NULL, 'closed', 'single', '2023-10-06T08:11:15.511Z', '2023-10-06T08:11:15.511Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'React batches state updates to reduce the code''s complexity', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'React batches state in favor of Webpack''s complicated code minification process', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'React batches state to show off what the Facebook team is capable of: It''s a USP from developers to developers ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'React batches state to manage state across multiple components', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'React batches state updates to limit the number of render cycles, improving the application''s performance by making state updates more efficient', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'React batches state because each state is a requests to the React servers and they don''t want it to overload it ', false);

-- Poll 13: In JS, there is a statement to make function execution end, ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, there is a statement to make function execution end, now what is this right statement for this you would recommend? ', 14, NULL, NULL, 'closed', 'single', '2022-10-15T19:01:52.740Z', '2022-10-15T19:01:52.740Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'retreat', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'end', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'exit', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':wq', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'return', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'stop', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'rescue', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'back-off', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'kthnxbye', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'break', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can’t do do this manually, a function automatically ends when there is no code to execute anymore', false);

-- Poll 14: It's hard to know frontend inside out, what is the return va...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('It''s hard to know frontend inside out, what is the return value from setTimeout? ', 340, NULL, NULL, 'closed', 'single', '2023-09-13T07:39:11.265Z', '2023-09-13T07:39:11.265Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns a function that can be called as setTimeout is a handler ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns an id that is used to clear timeouts if needed ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns inner scope values based on return values ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns the time until it will tick in milliseconds ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns ''null''', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns ''undefined'' ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns the execution of this function in milliseconds', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns a HTML radio button', false);

-- Poll 15: CSS can have multiple shadows around it's frame, what do you...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('CSS can have multiple shadows around it''s frame, what do you need to do achieve my previous claim?', 215, NULL, NULL, 'closed', 'single', '2023-01-26T14:35:09.302Z', '2023-01-26T14:35:09.302Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By adding multiple box-shadow properties on the element', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using the shadow DOM', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By applying the shadow-box-model', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By adding multiple values to the box-shadow property, each layer shadow applied separated by a comma', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using shadow-z-index property in CSS', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By duplicating the element with a shadow in your HTML', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With the <filter type="shadow"> tag', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With the multi-box-shadow property', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a shame for you designers, CSS is not capable to do this for fancy designs', false);

-- Poll 16: With this question you won’t win a prize, but which HTML tag...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('With this question you won’t win a prize, but which HTML tag is used for text we want to emphasize?', 4, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.854Z', '2025-11-09T18:57:41.854Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<html> ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<marquee>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<b>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<em>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<i>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<li>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<p>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<h1>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<emphasize>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<bold>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<h1 style="font-size: 300px">', false);

-- Poll 17: CSS Media queries help you deliver styles for each screen de...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('CSS Media queries help you deliver styles for each screen device, now when will this background-color change to peachpuff to be precise? ', 89, 'body {\n   background-color: papayawhip\n}\n\n@media screen and (max-width: 992px) { \n	body { \n	   background-color: peachpuff\n	}  \n};\n', NULL, 'closed', 'multiple', '2023-01-11T08:25:58.572Z', '2023-01-11T08:25:58.572Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'when the screen is 993px wide ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'only on screens which are exactly 991px wide', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'when the screen is 991px wide', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'when the screen is equal and smaller than 992px', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'only on screens which are exactly 992px wide', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When the screen is 465px wide', true);

-- Poll 18: In CSS, the box model is wrapped around every HTML element w...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, the box model is wrapped around every HTML element without a doubt, now tell me what does the box model consist of from inside out?', 3, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.854Z', '2025-11-09T18:57:41.854Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'content, padding, margin', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'margin, border, padding, content', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'content, border, padding, border (dashed), border, margin, border (dashed)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'content, padding, border, margin ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'padding, border, margin', false);

-- Poll 19: What data is only known at request time? ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('What data is only known at request time? ', 434, NULL, NULL, 'needs-revision', 'multiple', '2025-11-09T18:57:41.854Z', '2025-11-09T18:57:41.854Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'cookies', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'query string ', true);

-- Poll 20: Circles, squares, ovals, figures your submission for CSS cha...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Circles, squares, ovals, figures your submission for CSS challenges might need, triangles as the trickier one of all, which code from below will help you succeed?', 196, NULL, NULL, 'closed', 'single', '2023-10-02T07:52:01.754Z', '2023-10-02T07:52:01.754Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.tricky-triangle { \n  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);\n  background: red;\n  width: 100px;\n  height: 100px;\n}', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.tricky-triangle { \n  background: red;\n  width: 100px;\n  height: 100px;\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.tricky-triangle { \n  background: red;\n  width: 100px;\n  height: 100px;\n  filter: triangle (10px, 10px, 50px);\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.tricky-triangle { \n  background: red;\n  width: 100px;\n  height: 100px;\n  shape: "triangle" \n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.tricky-triangle {\n   filter: "triangle"\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.tricky-triangle {\n   display: inline-triangle; \n}', false);

-- Poll 21: Dead code is all around but can be removed, what is the term...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Dead code is all around but can be removed, what is the term I''m looking for which is used to make your app lighter and improved?', 223, NULL, NULL, 'closed', 'single', '2023-02-15T08:38:24.191Z', '2023-02-15T08:38:24.191Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Code flattening', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Pack emptying ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Backspacing', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Code purging', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Tree shaking ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Code bundling', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Code clearing ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Cleaning code', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Code grim reaping', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Code janitoring', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Code defragmenting', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Code merging', false);

-- Poll 22: In HTML, image and text are often together created, what tag...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, image and text are often together created, what tags are used when they are related?', 99, NULL, NULL, 'closed', 'single', '2022-10-31T09:07:55.272Z', '2022-10-31T09:07:55.272Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<img> and <p>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<picture> and <p>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<figure> and <figcaption>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<img> and <summary>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<img> and <span>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<img> and <details>', false);

-- Poll 23: What is the danger of using a spread, what functionality cou...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('What is the danger of using a spread, what functionality could become dead?', 409, 'const { aProp, ...rest } = object;', NULL, 'closed', 'single', '2024-03-06T09:53:29.254Z', '2024-03-06T09:53:29.254Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You create a lot more variables, which wil increase the amount of memory used by a lot!', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'functions and other types will be stringified by a JSON process.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'property setters will no longer work, since in the copy process only the read value is moved, and not the property getter/setter', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'you no longer will use the ''object'' item, which gets garbage collected, but will also destroy deeply nested values in the ''rest'' item', false);

-- Poll 24: Showing a table in our console is not a fable, what step is ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Showing a table in our console is not a fable, what step is needed to enable?', 307, NULL, NULL, 'closed', 'single', '2023-07-17T07:44:14.320Z', '2023-07-17T07:44:14.320Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By downloading a chrome plugin', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With a npm package “tablify”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'console.log(“%table %s, data);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'console.table(data);', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using Tailwind in your project ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'console.log("<table>{data}</table>"', false);

-- Poll 25: See the following code on the screen, what is the meaning of...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, what is the meaning of the underscore you might''ve seen? ', 292, 'const pollUsers = 1_000_000_000;', NULL, 'closed', 'single', '2023-06-12T07:56:47.785Z', '2023-06-12T07:56:47.785Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a way to tell JS you are dealing with bigger number than MAX_INT, which automatically reserves more memory space for such high numbers to increase performance', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s to seperate a floating point from a number ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a mandatory way to type big ints in JavaScript ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a bitwise operator used for numerical conversions/computations', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s just for readability of large numbers', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It was an old quirk in the early days of JS: An old way of concatenating numbers and strings, like: 1_000_000 and "frontend_polls_are_cool". It''s hardly used now and makes no sense anymore ', false);

-- Poll 26: In React, if state updates are batched together and depend o...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In React, if state updates are batched together and depend on the current state, which line of code would ensure accurate state update?\n', 319, 'import { useState } from "react";\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n\n  const incrementCount = () => {\n    // what should come here to increase count as implied? \n  };\n\n  return (\n    <div className="App">\n      <button\n        onClick={() => {\n          incrementCount();\n          incrementCount();\n        }}\n      >\n        Click for count: {count}\n      </button>\n    </div>\n  );\n}\n', NULL, 'closed', 'single', '2023-08-28T07:25:29.120Z', '2023-08-28T07:25:29.120Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'setCount(prevCount => prevCount + 1);', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'setCount(count + 1)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'changing onClick to doubleClick', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'setCount(count.reduce(acc, curr, () => acc + curr + 2, 0))', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Upgrade to the newest React', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With a useRef ', false);

-- Poll 27: Sharing the url of your app to get users is essential! How c...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Sharing the url of your app to get users is essential! How can you add a preview picture to this marketing potential?', 359, NULL, NULL, 'closed', 'single', '2023-11-15T09:14:19.867Z', '2023-11-15T09:14:19.867Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You need to send it as a seperate attachment when sharing the URL', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You need to register your URL to different social platforms, and can add meta data there', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can use special meta tags in your HTML, starting with `omg:` to indicate marketing speak, and that you need likes.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can use open graph tags, like ''og:image'' to add preview images', true);

-- Poll 28: Reasons to isolate UI components I want to know, how many ca...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Reasons to isolate UI components I want to know, how many can you show?', 342, NULL, NULL, 'closed', 'multiple', '2023-10-17T08:10:14.532Z', '2023-10-17T08:10:14.532Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Isolated components loose less heat in winter', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Isolated components can be tested easier', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Isolated components can be demonstrated easier (using storybook)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Isolated components are harder, since you need to wire them to redux all the time', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Isolated components have more clear boundaries of functionality', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Isolated components make compositions easier (fast UI prototyping)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Isolated components have no value', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Isolated components can be reused easier', true);

-- Poll 29: Part 2: While writing HTML, semantic tags are to keep in min...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Part 2: While writing HTML, semantic tags are to keep in mind, which tags you see listed here are false and not defined? ', 50, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<address>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<article>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<apple>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<aside>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<audio>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<base>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<dbz>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<data>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<react>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<ruby>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<card>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<dd>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<center>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<mark>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<figure>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<vue>', true);

-- Poll 30: Which of the following statements would you use an <iframe> ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Which of the following statements would you use an <iframe> tag for?', 226, NULL, NULL, 'closed', 'single', '2023-03-22T08:10:14.709Z', '2023-03-22T08:10:14.709Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'To embed a Google Maps map in your website', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Displaying 3D images in your website', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Adding a 3rd party filter for all the images on your website', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Adding a special opacity to an image when users hoven them on your website', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Who the h*ll even uses <iframe> tags anymore? Don''t use it! NEENER! NEENER!', false);

-- Poll 31: See these beautiful answers all aligned, how can we output [...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See these beautiful answers all aligned, how can we output [10, 10, 10] with parseInt and .map combined?', 385, 'let pollPoints = [''10'', ''10'', ''10''];\n\n\nlet parsed = ...', NULL, 'closed', 'single', '2024-01-31T08:53:38.244Z', '2024-01-31T08:53:38.244Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pollPoints.map(parseInt);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pollPoints.filter(parseInt);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pollPoints.map(dontParseInt);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pollPoints.map((point) => parseInt(point));', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'for (var i = 0; i < pollPoints.length; i++) { \n    const pollPoints = []\n    let points; \n    p = parseInt(points); \n    pollPoints.push(p); \n    points = p;    \n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pollPoints.map(!isNaN(parseInt));', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pollPoints.advancedMap(parseInt) ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pollPoints.map((point, parseInt) => { \n\n   if (point == 0) { \n     point++; \n   }\n   else if (point == 1) {\n\n    point = parseInt(point)\n   }\n   else { return point }\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pollPoints.map(parseInt, !isNaN);', false);

-- Poll 32: See the following code on the screen, what should the output...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, what should the output of the TypeScript compiler have been?', 312, 'type X = ''a'' | ''b'';\n\nlet o = {\n    x: ''a'', \n};\n\nconst fn = (x: X) => `${x}-foo`;\n\nconsole.log(fn(o.x)); // ???', NULL, 'closed', 'single', '2023-09-11T08:18:31.155Z', '2023-09-11T08:18:31.155Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"a" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"a-foo"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"a-CHOO!" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'TypeError: usage of indexes for type ''X'' is not possible ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Argument of type ''string'' is not assignable to parameter of type ''X''', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'TypeError: Your type is too literal. Did you mean to use ''string''? ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'null', false);

-- Poll 33: In code, calling a function is often done with parenthesis, ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In code, calling a function is often done with parenthesis, but what is the difference between dependencies and devDependencies?', 298, NULL, NULL, 'closed', 'single', '2023-07-04T08:20:33.026Z', '2023-07-04T08:20:33.026Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“devDependencies" are dependencies that can only be used during the day, while "dependencies" can only be used at night', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“devDependencies” are dependencies which are not production ready, while dependencies are production ready', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“devDependencies” are only available on weekend while “dependencies” can be used throughout the week', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"devDependencies" are dependencies building up a single entity called a "dependency"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"devDependencies" are dependencies that are required by a package to function properly but are expected to be provided by the package''s parent application or environment rather than included in the package itself, which ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“devDependencies” are dependencies only required during development phase, such as testing frameworks, build tools or code quality analysis tools, while “dependencies” are required for the production app', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'They are the same ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“devDependencies” are dependencies meant for experimental use, such as new ES modules, cutting edge CSS etc, while “dependencies” are stable technologies', false);

-- Poll 34: When seeing URLS a structure can be found, now which parts a...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('When seeing URLS a structure can be found, now which parts are forming this structure compound? ', 427, NULL, NULL, 'closed', 'multiple', '2024-04-23T09:20:21.097Z', '2024-04-23T09:20:21.097Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'HTTP Verbs ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Locators', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Domain name', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Environment ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Query string', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Anchor', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Scheme', true);

-- Poll 35: See the following code on the screen, what should the output...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, what should the output of the console.log have been? ', 268, 'console.log(legacy); \nvar legacy = "The usage of var is legacy";', NULL, 'closed', 'single', '2023-07-20T07:57:30.455Z', '2023-07-20T07:57:30.455Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"The usage of var is legacy"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Uncaught ReferenceError: legacy is not defined', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'undefined', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The resource "legacy" was preloaded, but is not ready yet. Please wrap this in a promise', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '""', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '{}', false);

-- Poll 36: In the future world of CSS, new properties are there to acce...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In the future world of CSS, new properties are there to access, the "line-clamp" property is new, what does it do?', 162, '.line-clamp {\n  display: -webkit-box;\n  -webkit-line-clamp: 3;\n  -webkit-box-orient: vertical;  \n  overflow: hidden;\n}', NULL, 'closed', 'single', '2022-12-13T09:08:56.120Z', '2022-12-13T09:08:56.120Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can clamp tags like <img/> or <video/> to a line and it will never change position.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can define how many lines a <p> should contain at a maximum.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The line-clamp cuts off the text at a specific number of lines without any JS needed.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Line-clamp is the new successor to the flex row property.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Online "pirates" can''t hijack content because line-clamp protects the text in HTML.', false);

-- Poll 37: This term you must’ve seen, what does “hydration” mean?...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('This term you must’ve seen, what does “hydration” mean?', 294, NULL, NULL, 'closed', 'single', '2023-04-20T07:26:17.955Z', '2023-04-20T07:26:17.955Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is the process of the browser parsing the DOM and CSSOM', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a saying among developers that got popular back in the hot summer of 2010, because at that time devs literally forgot to stay hydrated', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a saying when among developers when fluids were spilled on your systems: “Ah man, bummer! Your stuff got hydrated!”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means that the client-side “onload” event has been kicked off', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s more of a technical term in Agile Scrum, describing the analogy of  “hydrating” or “watering” a seed in the ground to a full grown plant. In this case it’s building the team from the ground up to be successfull and reach it’s full potential', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s the process of drilling props down React components, which "hydrates" your components with data', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means you are testing and building components in an isolated place, hydrated with server capabilities ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s process of attaching event listeners and updating the DOM with the initial state of a client-rendered component that was initially rendered on the server', true);

-- Poll 38: Part 2: CSS selectors are something we use every day, which ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Part 2: CSS selectors are something we use every day, which types of selectors exist do you say?', 360, NULL, NULL, 'closed', 'multiple', '2024-03-25T09:32:35.479Z', '2024-03-25T09:32:35.479Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'HTML selector', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'General sibling selector', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ID selector', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'jQuery selector', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Attribute selector ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'DOM selector', false);

-- Poll 39: The indexOf is a method which will have the first of a given...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('The indexOf is a method which will have the first of a given element return, when an element is not found, what will indexOf return?', 302, NULL, NULL, 'closed', 'single', '2023-07-31T07:20:33.661Z', '2023-07-31T07:20:33.661Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'NaN', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '404', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '1', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '0', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '-1', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[object Object]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ReferenceError: index not found', false);

-- Poll 40: Selecting elements can go as deep as the HTML tree will be, ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Selecting elements can go as deep as the HTML tree will be, which combinator is used to select only direct children <li>''s? ', 130, '    <section>\n        <h1>A "Serious" Guide to Web Development</h1>\n        <ul>\n            <li>\n                Step 1: Picking Your Editor\n                <ul>\n                    <li>Option A: Use Google Docs - because who needs syntax highlighting when you have fonts like "Comic Sans"?</li>\n                    <li>Option B: Use a typewriter - it''s retro, hipster, and no electricity required! Version control? Just use more paper!</li>\n                </ul>\n            </li>\n            <li>\n                Step 2: Styling Your Website\n                <ul>\n                    <li>Forget CSS, let''s use MS Paint! Pixel art is the future.</li>\n                    <li>Still not satisfied? Doodle with crayons directly on your screen.</li>\n                </ul>\n            </li>\n            <li>\n                Step 3: Boosting Performance\n                <ul>\n                    <li>Convert your DB into a physical library. No more server crashes, only book crashes!</li>\n                    <li>If your website is slow, just add some racing stripes on the sidebar. It always works!</li>\n                </ul>\n            </li>\n        </ul>\n    </section>', NULL, 'closed', 'single', '2023-10-26T08:39:39.727Z', '2023-10-26T08:39:39.727Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '~', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '+', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '||', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':first-child', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'section ul li ul li ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'li ul li ul section', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':direct-child', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':has()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':is()', false);

-- Poll 41: In JS, primitive values are the language fundamental, which ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, primitive values are the language fundamental, which properties does each primitive resemble? ', 1, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Primitives are immutable ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'All datatypes are primitives', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '`null` and `undefined` are not primitives', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Primitives have no properties or methods', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'To date, there are 7 primitives', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Primitives can be altered directly', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Before ES6, there were no primitives in JavaScript yet', false);

-- Poll 42: Filtering out falsy values can be done, to do this, what pie...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Filtering out falsy values can be done, to do this, what piece of code can you run? ', 274, 'const values = [null, "frontend", "polls", "are", "cool", undefined, NaN]; ', NULL, 'closed', 'multiple', '2023-05-10T07:51:43.580Z', '2023-05-10T07:51:43.580Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'values.filter(true);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'values.filter(!!);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'values.filter((value));', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'values.filter(value => value);', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'values.filter(Boolean);', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'values.filter(!falsy);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'values.filter(!"");', false);

-- Poll 43: In TypeScript, “.d.ts” files are very handy for sure, but wh...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In TypeScript, “.d.ts” files are very handy for sure, but what it is it for? ', 32, NULL, NULL, 'closed', 'single', '2022-09-14T08:05:00.182Z', '2022-09-14T08:05:00.182Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'For seperation of concerns: It’s a special file that is used for your types or interfaces which are used in your app. You often see something like “app-types.d.ts” which contains all your types which you import your types from in your app', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'These are settings which are important for your keyboard in favor of use of TypeScript (certain shortcuts, automatic type inference)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Having type information for the library code or other external API’s helps you in coding by providing detailed information about the types, method signatures, etc., and provides IntelliSense.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a file to declare what file types you need to support in your app when you import these files (like .ttf, .woff, .tsx, .jsx)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a method to decide what type version you use for TypeScript, like how Node Version Manager is to Node.js. This enhances testing, because you can test code with current and older TypeScript versions by only changing the file by adding the desired version', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a file where you declare the type of TypeScript rules you need specifically', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a visual way of showing your small atomic types and interfaces to other developers in your team in isolation', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because TS has it’s own ecosystem, this file represents the tools and plugins you use. You can install certain features like type inference, built-in types or custom types from other developers to use in your own projects', false);

-- Poll 44: These polls are road of learning trials, what command is use...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('These polls are road of learning trials, what command is used to download changes but not update all repository files?', 246, NULL, NULL, 'closed', 'single', '2023-04-25T08:07:04.267Z', '2023-04-25T08:07:04.267Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'git');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git fetch', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git download', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git pull', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git init', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git merge —no-ff', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git rebase', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git cache', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git pull --no-merge', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git merge --without-merge', false);

-- Poll 45: In JS, JSON.stringify() has a purpose, what knowledge about ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, JSON.stringify() has a purpose, what knowledge about that can you surface?', 48, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When sending data to a web server, it’s often needed that the data has to be in a serialized JSON string format ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a way to validate JSON and check for null and undefined values. Stringify automatically turns everything into a string and removes null and undefined values', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a way to sanitize data before sending to the server', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a way to improve performance when sending data over the wire', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s just a tradition we all keep in place and is passed on for a long time from senior devs to junior devs', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With JSON.stringify we care about longevity of transferring data over HTTP. It’s is the “greener” and so to say the “environment friendly” way of sending data ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It hasn’t got a real purpose anymore with modern browsers have the built-in SendData API available', false);

-- Poll 46: You want your website to look just right, what is the essenc...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('You want your website to look just right, what is the essence of <!DOCTYPE html> which avoids a bugs fight?', 258, NULL, NULL, 'closed', 'single', '2023-10-11T08:14:50.745Z', '2023-10-11T08:14:50.745Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s essential because it ensures the content is interpreted and displayed correctly across browsers', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s essential because it will indicate this is a web app and won''t be accidentally added to the app store by mistake', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s essential because the document will else default to .docx, which cannot be rendered in browsers', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s essential for seperation of concerns so developers will not lose oversight ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It doesn''t matter, it can be omitted', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It does matter but only makes your HTML document invalid, so no big consequences ', false);

-- Poll 47: In JS, errors can be endowed, what statements in error handl...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, errors can be endowed, what statements in error handling are allowed?', 74, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'try', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'catch', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'begin', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'finally', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'if', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'else', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'switch', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'kick', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'throw', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ensure', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'promise', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'async', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'await', false);

-- Poll 48: This term you could have seen, what does WebRTC mean?...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('This term you could have seen, what does WebRTC mean?', 353, NULL, NULL, 'closed', 'single', '2023-09-22T07:54:50.399Z', '2023-09-22T07:54:50.399Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Web-RemoteTranslationContract', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Web-RunTimeCalculations', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Web-RealTimeCommunication', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Web-RemoteTransferContacts', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Web-RealTransferableCoins', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Web-RichTextCryptography', false);

-- Poll 49: These TS polls might make you delighted, how do you ensure e...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('These TS polls might make you delighted, how do you ensure either a "text" or "icon" property on ComponentProps should be provided?', 372, NULL, NULL, 'closed', 'single', '2024-04-17T07:55:25.997Z', '2024-04-17T07:55:25.997Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type Props = {\n  icon?: SomeType;\n  text?: string;\n};\n\n\ntype ComponentProps = Props;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type Props = {\n  icon?: SomeType;\n  text?: string;\n};\n\n\ntype ComponentProps = Props;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type IconProps = {\n  icon: SomeType;\n  text?: string;\n};\n\ntype TextProps = {\n  text: string;\n  icon?: SomeType;\n};\n\ntype ComponentProps = IconProps | TextProps;', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type IconProps = {\n  icon?: SomeType;\n  text?: string;\n};\n\ntype TextProps = {\n  text?: string;\n  icon?: SomeType;\n};\n\ntype ComponentProps = IconProps | TextProps;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type IconProps = {\n  icon: SomeType;\n  text: string;\n};\n\ntype TextProps = {\n  text: string;\n  icon: SomeType;\n};\n\ntype ComponentProps = <Partial, IconProps | TextProps>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type Props = {\n   icon: undefined\n   text: undefined\n\n}\n\ntype ComponentProps = Props', false);

-- Poll 50: ARIA affects the assistive technologies that come in all sha...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('ARIA affects the assistive technologies that come in all shapes and sizes, can you name which devices?', 266, NULL, NULL, 'closed', 'multiple', '2023-08-03T07:41:28.283Z', '2023-08-03T07:41:28.283Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Screen readers ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Printed paper', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Photo camera''s ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '3D printers', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A potato', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Speech Recognition software', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Keyboard navigation', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Gameboy color (Assisting in showing colors to make screens more clear) ', false);

-- Poll 51: In CSS, flexbox has a property flex-shrink, now how does thi...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, flexbox has a property flex-shrink, now how does this work, do you think? ', 78, NULL, NULL, 'closed', 'multiple', '2023-09-08T07:54:11.687Z', '2023-09-08T07:54:11.687Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It specifies the amount of space a flex item can occupy when hitting built-in browser breakpoints', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It makes sure an element on the page will grow and shrink whenever you resize your browser', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It specifies to the browser that your element is responsive ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a setting to shrink the size of your CSS code', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It ensures all flex items won''t wrap onto the next line', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It specifies how much a flex item will shrink relatively to other flex items ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It allows to shrink the screen size of the users device', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It makes sure to not shrink the size of your elements when a user is zooming out it''s browser', false);

-- Poll 52: In React, having different stacking contexts can be complex ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In React, having different stacking contexts can be complex and cause confusion, in what way can we control stacking contexts which would be a solution?', 93, NULL, NULL, 'closed', 'single', '2022-09-29T07:51:04.662Z', '2022-09-29T07:51:04.662Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By having a well-thought of z-index system from the start ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'z-index: 999999 !important', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'findDomNode', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Microfrontends', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'React refs', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Controlling z-indexes from your react component with css in js or style tags', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'React Context', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'React portals', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By passing an optional parameter at mount in useEffect to render the component somewhere in the tree', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using position absolute for every component you create so layering can be controlled per component', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using CSS flexbox order property', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Believe it or not, but this is sadly still a web limititation: in CSS4 there will be a property `stacking-order` for it', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'React Suspense', false);

-- Poll 53: See the following new CSS syntax on your screen, what should...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following new CSS syntax on your screen, what should the equivalent have been? ', 19, '.post :is(h1, h2, h3) {\n    line-height: 1.2;\n\n}', NULL, 'closed', 'single', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Nothing, this is new syntax and a new feature… ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.post h1, .post h2, .post h3 ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.post h1 h2 h3', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.post h1, h2, h3', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'h1 .post, h2 .post, h3 .post', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'h1.post, h2.post, h3.post', false);

-- Poll 54: In CSS, stacking contexts are created several ways now and t...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, stacking contexts are created several ways now and then, now the stacking context is formed when?', 18, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'At the root element of the DOM <html>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When using floats', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When elements become positioned elements other than “static” ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When using display flex', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When using transform with any other value than none ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When using the stacking-context-name and stacking-context-type properties', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Every html element creates a stacking context down the tree, which is why elements further down the tree lay on top of elements that came before', false);

-- Poll 55: In JS, immutability makes code easier to reason about, now c...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, immutability makes code easier to reason about, now can you list why we immutability is beneficial and please don’t shout? ', 117, NULL, NULL, 'closed', 'multiple', '2022-11-22T08:29:48.494Z', '2022-11-22T08:29:48.494Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because writing immutable code results in smaller files', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Code immutability is a term managers command developers to do when they expect large traffic on their website and hold off releases for a short period of time. Also referred as  temporary "code freeze".', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Immutability is a title you earn which unlocks certain privileges as developer. It can be recognized by developers receiving blackbelts from their company. Privileges are that devs are allowed to merge branches without approvals because of the companies immense trust.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because it''s easier to keep multiple versions of data / state (allowing features like “undo”!)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because if you call a function but not use its return data, you expect that nothing changed', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because when writing immutable code, tests are redundant', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The term immutable comes from IIFE (Immutable Invoking Function Expression), which is a function that makes code run inside immutable', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because immutable objects are directly modifiable', false);

-- Poll 56: While writing HTML, semantic tags are to keep in mind, which...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('While writing HTML, semantic tags are to keep in mind, which tags you see listed here are false and not defined? ', 40, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<kbd>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<details>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<summary>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<time>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<androidframe>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<output>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<currency>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<progress>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<title>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<javascript>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<iframe>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<dialog>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<tbody>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<weak>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<text>', true);

-- Poll 57: Knowing this when writing commit messages is the ultimate ch...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Knowing this when writing commit messages is the ultimate cheat, what can you do when your commit contains a typo or is incomplete? ', 253, NULL, NULL, 'closed', 'single', '2023-06-21T07:50:13.113Z', '2023-06-21T07:50:13.113Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'git');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Use git reset --hard to reset everything', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Push the commit, nobody will look at these messages', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Push the commit and make another commit with the amendments ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Use git correct <commit-hash>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Use git commit --amend', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Use git commit --edit', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git rm garbage-commmit', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git cheat --commit', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git commit --incomplete', false);

-- Poll 58: With dangerouslySetInnerHTML a risk you take, what risk is a...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('With dangerouslySetInnerHTML a risk you take, what risk is at stake? ', 287, NULL, NULL, 'closed', 'single', '2023-04-19T07:17:48.106Z', '2023-04-19T07:17:48.106Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It creates fake html tags which are dangerous', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a function that is perfomance wise pretty expensive and dangerous to use ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You’ll be vulnerable to CSRF attacks', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It allows for SQL injection attacks', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You increase vulnerability on XSS attacks', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is not so dangerous, but the risk is that it sometimes messes up your styles related to your html tags when the code is bundled ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s not dangerous, but it might mismatch the rendering of your client and server HTML which can be problematic', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s not really dangerous, but it lets you use the newest HTML tags which are not fully supported yet (hence the danger)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is dangerous in the sense that it can''t be tested since test frameworks can''t seem to touch this code ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s not dangerous but it is cumbersome because it''s always ran in an iframe', false);

-- Poll 59: rem units are often seen, what beneficial value do they have...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('rem units are often seen, what beneficial value do they have on any screen? ', 238, NULL, NULL, 'closed', 'single', '2023-07-03T07:47:18.613Z', '2023-07-03T07:47:18.613Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'rems are valued because of the way they scale up according to the user''s font setting in the browser ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'rems are valued because they are easy to work with ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'rems are valued because they take care for any border and padding values to be included when specifying a box''s width/height', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'rems are valued because when used they will automatically handle texts that are too long in a neat way for you ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'rems are valued because they are supported in any browser and device; this not the case for some other units ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'rems are valued because they scope your CSS ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'rems are valued because they are native browser units which perform much more efficient compared to ems or px ', false);

-- Poll 60: In TS, utility types have code under the hood which is known...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In TS, utility types have code under the hood which is known, of the following code what utility type is shown?', 175, 'type ??? = T extends U ? never : T;', NULL, 'closed', 'single', '2023-03-07T08:05:39.774Z', '2023-03-07T08:05:39.774Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Never', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'T', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Partial', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Exclude', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Extract', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Omit', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Undo', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'X-ray', false);

-- Poll 61: In CSS, logical properties have a place, do you know a situa...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, logical properties have a place, do you know a situation where we should use them with grace? ', 72, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When we want to use conditionals in CSS', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When writing directions (foreign languages) matter ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When we want to enhance CSS with JS ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Logical properties are used in css-in-js to style your components based on JS logic ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you want to debug your CSS ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you need math in CSS for cool (physics) animations/3d or complex grid layouts (calculate widths/heights/distances/gaps )', false);

-- Poll 62: At this rate users surely will become poll millionaires, how...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('At this rate users surely will become poll millionaires, how is the following array converted to the expected output, an object key value-pairs?', 259, 'const channels = [["name", "frontend"], ["name", "backend"], ["name", "flutter"], ["name", "a11y-only"]]\n\n// expected: \n\n[\n    {\n        "name": "frontend"\n    },\n    {\n        "name": "backend"\n    },\n    {\n        "name": "flutter"\n    },\n    {\n        "name": "a11y-only"\n    }\n]\n', NULL, 'closed', 'single', '2024-03-08T09:28:20.816Z', '2024-03-08T09:28:20.816Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Object.mapToComplexObject(channels)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Object.concat(channels)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Object.entries(channels)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Object.fromEntries(channels)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Array.cloneToDeepObject(channels);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Array.from(channels)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'channels.map(([key, value]) => ({ [key]: value }));', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Object.convert(channels)', false);

-- Poll 63: Multi-paradigm is a term JavaScript applies to, what does it...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Multi-paradigm is a term JavaScript applies to, what does it mean is this knowlegde that lives with you? ', 399, NULL, NULL, 'closed', 'single', '2023-12-21T09:27:47.708Z', '2023-12-21T09:27:47.708Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means JavaScript is a language that can handle multiple languages: Like you can write Node, JSX, TSX, styles (CSS), React but also Java', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means that you can use any library ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means that JavaScript runs on different environments and is therefore "multi-paradigm" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means multiple developers contributed to it ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"Multi-paradigm" is a term that evolved with JavaScript meaning it''s identity crisis since ES6, because every style is allowed ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"Multi-paradigm" means JavaScript was once born out of Java, which uses different paradigms ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means JavaScript supports different programming styles, like functional or OOP', true);

-- Poll 64: To make our websites get server data realtime, what technolo...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('To make our websites get server data realtime, what technologies do we use for this, can you answer my poll rhyme?', 417, NULL, NULL, 'closed', 'multiple', '2024-04-10T09:03:53.336Z', '2024-04-10T09:03:53.336Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Realtime events ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'IndexedDB ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Long polling ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'WebSocks', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'WebSockets', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Server-Sent Events', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Streams', false);

-- Poll 65: In React, development goes rapid, synthetic events are built...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In React, development goes rapid, synthetic events are built-in, do you know why they are added?', 92, NULL, NULL, 'closed', 'single', '2022-09-15T08:19:50.982Z', '2022-09-15T08:19:50.982Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s just something that comes with React: The React team wanted to reinvent the wheel and be “the” modern framework because they believe the web can do better. They created their own DOM API, with features like: jsx, components, app generator (create-react-app), lifecycles and Synthetic Events', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'To expand on the default browser event system with custom events the React team came with like onInput or onBrowserClose', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'To overcome browser inconsistencies', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'They are more performant than default DOM events', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'They are actually “fake” events to use as mocks in your tests with react testing library (hence “synthetic”)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Synthetic events are a wrapper around native events only used in development to prevent firing native DOM events in development. Synthetic events allows for some features in debugging to which makes it much more easy and efficient', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Synthetic events was just the name of a React Amsterdam conference back in 2017 because the conference was in the light of “artificial intelligence” talks with React. As merchandise they also gave away syntethic t-shirts and a blue synthetic React bag, which made the reference', false);

-- Poll 66: See the following code on your screen, what could the shortc...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on your screen, what could the shortcut have been?', 285, '.sidebar {\n   margin-left: 50px;\n   margin-right: 50px;\n}', NULL, 'closed', 'multiple', '2023-06-29T08:06:29.480Z', '2023-06-29T08:06:29.480Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'margin-left-right: 50px;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'margin: 50px;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'padding: 50px:', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'margin-horizontal: 50px;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'margin-rtl: 50px;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'margin-inline: 50px;', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'margin: 0 50px;', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'margin-block: 50px:', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'margin-row: 50px;', false);

-- Poll 67: In Frontend, client-side data storages exist, when the user ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In Frontend, client-side data storages exist, when the user closes it’s browser, what technique is used to have the data persist? ', 70, NULL, NULL, 'closed', 'single', '2022-11-21T08:46:59.415Z', '2022-11-21T08:46:59.415Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'GlobalStorage', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'SessionStorage', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Firebase', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Memory', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CORS', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'WASM', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'SetState', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'LocalStorage', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Extending the browser window object', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It doesn’t exist client-side; you need to store everything serverside if you want to have your data persisted', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Object.freeze', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Redux', false);

-- Poll 68: When this poll app is big this app needs to be moderated, wh...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('When this poll app is big this app needs to be moderated, what can you do to have arrays with a certain number of items populated? ', 242, NULL, NULL, 'closed', 'multiple', '2023-03-28T18:16:58.004Z', '2023-03-28T18:16:58.004Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'new Array(99);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Array.populate(99); ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const arr = [];\n\narr.forEach(function (item, index) {\n   arr.push(index)\n});', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'new Array(99).fill("Marciano");', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Array.apply(99); ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Array.placeholders(new Array(99))', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[...new Array(99)].map(x => "Marciano");', true);

-- Poll 69: CSS has many tools upon it's sleeve but doesn't contain type...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('CSS has many tools upon it''s sleeve but doesn''t contain types, however useful it may sound for sure, what can you use to create an effect of stripes?\n', 88, NULL, NULL, 'closed', 'multiple', '2022-12-20T08:48:32.359Z', '2022-12-20T08:48:32.359Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With a repeating-linear-gradient', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'div:nth-child(odd) {\n    background-color: black\n}\n\ndiv:nth-child(even) {\n    background-color: white\n}', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Just use a table tag, it will have that effect automatically', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'div { @apply var(--zebra) }', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'div:odd-child { background-color: black}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By slicing backgrounds in tools like photoshop and use background-repeat to put all backgrounds together', true);

-- Poll 70: With this in-browser API back and forth you can navigate, th...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('With this in-browser API back and forth you can navigate, the answers provide the names below, which one would be the best candidate?', 233, NULL, NULL, 'closed', 'single', '2024-03-22T09:21:17.071Z', '2024-03-22T09:21:17.071Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'BackAndForth API', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Browser API', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'History API', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Navigator API', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Routing API', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'There is no API, hench the different “router” libraries for each framework', false);

-- Poll 71: Today the subject is React Fragments, what can you say about...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Today the subject is React Fragments, what can you say about this feature gents?', 348, NULL, NULL, 'closed', 'multiple', '2023-12-12T08:50:53.521Z', '2023-12-12T08:50:53.521Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a feature which fragmentises your whole React project so it can be loaded fragment by fragment instead of big chunks of data.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a feature that allows the developer to return multiple elements from a React component.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a feature that allows developers to group a list of children without adding extra nodes to the DOM.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a feature that allows developers to add a single child without adding an extra node to the DOM.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'React Fragments sounds like it really fragmentises your code, but it actually renders quicker and uses less memory.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a feature that allows developers to wrap multiple elements in "<></>" and has a lower memory load.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Fragments is the solution to the must-have constraint of only returning one element per component.', true);

-- Poll 72: In CSS, the position property was implemented long ago, whic...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, the position property was implemented long ago, which values from below remove the elements out of the document flow? ', 33, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'fixed', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'relative', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'sticky', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'absolute', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'static', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'flex', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'transform', false);

-- Poll 73: In React, sibling elements need to be wrapped, how can you d...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In React, sibling elements need to be wrapped, how can you do this and make your code scrapped?', 96, NULL, NULL, 'closed', 'multiple', '2022-10-15T18:59:57.470Z', '2022-10-15T18:59:57.470Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<Fragola>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<Family>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<Fragile>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<..>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<Wrapper>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<Frag>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<Fragrance>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<Fragment>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Sibling elements don’t need to be wrapped', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<Group>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You need an HTML tag ', true);

-- Poll 74: When writing complex types, you won't have local vars for st...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('When writing complex types, you won''t have local vars for storing in-between types, what trick can you apply to overcome these gripes? ', 411, NULL, NULL, 'closed', 'single', '2024-05-07T09:33:32.861Z', '2024-05-07T09:33:32.861Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type Hello<Fn extends (...args: any[]) => any> = K as Parameters<Fn> extends Foo ? K : never; // K is now some var result, by using the ''as'' syntax!', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type Hello<Fn extends (...args: any[]) => any, K = Parameters<Fn>> =  K; // K is now some var result, by using a default assigned extra type argument!', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type Hello<Fn extends (...args: any[]) => any> =  Parameters<Fn> as K, K extends string ? K; // K is now some var result, by using a comma!', false);

-- Poll 76: In JS, these polls try to help us learn, now tell me what da...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, these polls try to help us learn, now tell me what data type filter() will return!', 139, NULL, NULL, 'closed', 'single', '2023-06-23T08:08:45.900Z', '2023-06-23T08:08:45.900Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns a TransformedArray data type', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It depends on what data type you use .filter on: object.filter returns an object, array.filter returns an array', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns a boolean', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns an array', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It changes the values where the filter function is called on, but the output is undefined', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It depends on when you use const or let: with let you’ll get undefined, with const you’ll get an object value (that mostly comes up in the const vs let discussion)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns a tuple', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns fresh air', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns a Symbol Iterator', false);

-- Poll 77: In JS, mutable and immutable methods are indisputable can yo...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, mutable and immutable methods are indisputable can you list the methods which are immutable?', 100, NULL, NULL, 'closed', 'multiple', '2023-03-31T08:06:22.562Z', '2023-03-31T08:06:22.562Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'reduce', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'map', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'push', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'concat', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'every', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'splice', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'slice', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'filter', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pop', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'some', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'forEach', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'sort', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'reverse', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'unshift', false);

-- Poll 78: Hello, what is the issue in the code below?...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Hello, what is the issue in the code below?', 407, 'let item: Record<string, string> | undefined = undefined;\n\nmyFunction(() => { item = { some: "value" }; });\n\nif (!item) return;\n\n// what is the type of ''item'' here?', NULL, 'closed', 'single', '2024-02-05T09:28:58.679Z', '2024-02-05T09:28:58.679Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'undefined', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'never', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Record<string, string>', false);

-- Poll 79: In CSS, "display: none" makes elements hide, what facts abou...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, "display: none" makes elements hide, what facts about "display: none" can you provide?', 154, NULL, NULL, 'closed', 'multiple', '2023-04-21T07:24:04.357Z', '2023-04-21T07:24:04.357Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It removes the element from the document flow', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s possible to animate elements with display: none', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'display: none is the same as opacity: 0', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Elements with display: none are only visually absent; it can be detected by assistive technology', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The <script> tag uses display: none by default', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'display: none only works on semantic tags', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Elements with display: none can’t be interacted with in JavaScript', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"@media screen and (display: none)" is a media query aimed to assist visually impaired users', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'display: none is only applied on the element this property is put on; children are still visible ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"@media screen and (display: none)" allows you to target devices that have very low screen brightness ', false);

-- Poll 80: See the following JS on your screen, what is this technique ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following JS on your screen, what is this technique called you must have seen?', 65, 'isAuthenticated ? "Hallo, welkom bij Oodoo! Uw database verloopt over 20 dagen." : "Toegangsfout: Deze beperking is te wijten aan de volgende regels (''Activiteit (mail.activity) records'')"', NULL, 'closed', 'multiple', '2024-02-07T15:30:56.088Z', '2024-02-07T15:30:56.088Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'variadic function', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ternary operator', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'OAuth 2.0', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'functional programming', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'variable assignment', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'this technique is called invalid JavaScript', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'react conditional', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'nullish coalescing', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'optional chaining', false);

-- Poll 81: In CSS, resets are often used, but what are the things that ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, resets are often used, but what are the things that with it’s use are then improved?', 27, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It removes all styling from a given selector. The reset is done by using: all: unset on the wildcard selector', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It removes all styling from every level (user-agent styles, browser default styles, external and internal styles) from a page and basically gives you a clean sheet as starting point', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It helps reduce browser inconsistencies in things like default line heights, margins and headings font sizes. Meant to be a starting point for your to build on your own default stylings.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CSS reset is according to the W3C “the great reset” and took place when the W3C introduced the modular way of releasing CSS features', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CSS reset means it resets cascade layer so developers can define that order themselves', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CSS reset is actually a script that runs over your CSS code and “purifies” your code (and therefore “resets” properties which are not used', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is actually a way to reset CSS scopes, so style leakage will be prevented', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is just a saying which got popular among CSS developers when they visited a CSS conference and have a drink afterwards or when they a had day full working with hard CSS code. ', false);

-- Poll 82: In JS, debounced function calls keeps your app lean, but wha...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, debounced function calls keeps your app lean, but what is a benefit that can be seen? ', 45, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Debouncing will batch a series of calls into a single call to prevent multiple calls ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Debouncing is a technique to load your script in a lazy manner', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Debounce.js is the new kid on the block concerning frontend frameworks that handles SSR, like Next.js and Remix', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Debouncing will delay function execution and reduce the amount of times a function fires based on a regular interval', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Debouncing is an option within developer tools to check the bounce rate of your users in your app ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Debouncing is a piece of code used to provide modern functionality on older browsers that do not natively support it', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Debouncing doesn’t exist and is another mumbo jumbo term you made up again :@', false);

-- Poll 83: In JS, see these arrays on your screen, when applying "push"...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, see these arrays on your screen, when applying "push" and "concat", what should the output of both arrays have been? ', 167, 'const colors = ["Vermillion", "Saffron", "Celadon", "Cerulean", "Indigo", "Fuchsia"]; \nconst newColors = ["Vermillion", "Saffron", "Celadon", "Cerulean", "Indigo", "Fuchsia"]; \n\ncolors.push("pewter");\nnewColors.concat("pewter");', NULL, 'closed', 'single', '2022-11-29T09:37:52.340Z', '2022-11-29T09:37:52.340Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Colors and newColors both remain as is', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Colors and newColors both get "pewter" added at the end of the array', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Colors get "pewter" added, newColors remains the same', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'newColors get "pewter" added, colors remains the same', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'newColors gets concatenated to colors', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because the array is exactly the same, JS is smart enough to merge both arrays in one. The first declared array "colors" will be undefined ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'This will throw an error', false);

-- Poll 84: In HTML, an element often used is <label>, what benefits wil...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, an element often used is <label>, what benefits will this element enable? ', 34, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<label> has built-in functionality by the W3C, that when screen readers notice a <label> without corresponding input, it automatically informs the user and will send feedback to the developer', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Screen reader users (will read out loud the label, when the user is focused on the element)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s an ready-made element basically to get attention from your user: it may display things like text and a close button, a “status” from a particular object or pricetags for example', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<label> basically relates several input fields together', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When using <label>, it will generate a corresponding input out of the box', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Users who have difficulty clicking on very small regions (such as checkboxes) - because when a user clicks the text within the <label> element, it toggles the input (this increases the hit area).', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It doesn’t have any additional benefits, so the HTML spec deprecated the <label> tag', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Adding <label> auto validates the <input> closest to it', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'On mobile devices, when using <label> next to in an input field, a user can tap on it and it will automatically fill in data that is saved in the browser (e.g name, password, address) ', false);

-- Poll 85: Each of these questions keep you skills excelled, in TypeScr...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Each of these questions keep you skills excelled, in TypeScript what''s the name of a type with exact values that can be held?', 406, NULL, NULL, 'closed', 'single', '2024-04-09T08:35:25.454Z', '2024-04-09T08:35:25.454Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'literal types', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'interfaces', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type primitives', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'memoization types', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'keyboard types', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'generics ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'extends', false);

-- Poll 86: Scopes are important to know, but with what kind of scopes d...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Scopes are important to know, but with what kind of scopes does JS go?', 63, NULL, NULL, 'closed', 'multiple', '2023-03-13T07:59:41.105Z', '2023-03-13T07:59:41.105Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'block scope', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'function scope', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'run-time scope', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'inline-block scope', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'colono scope', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"this" scope', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'object scope', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'MVP scope', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'dynamic scope', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'lexical scope', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'module scope', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'global scope', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'variable scope', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'react scope ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'micro scope', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'app scope', false);

-- Poll 87: More TypeScript questions are coming up if you please, what ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('More TypeScript questions are coming up if you please, what util type is aimed to leave out keys?\n\n', 131, NULL, NULL, 'closed', 'single', '2023-01-23T08:42:42.952Z', '2023-01-23T08:42:42.952Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Forget<Type>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'LeaveOut<Type>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Pick<Type>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Omit<Type>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Don''tNeedThis<Type>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Keep<Type>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ObjectEntries<Type>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Remove<Type>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Delete<Type>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'NotMy<Type>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Ignore<Type>', false);

-- Poll 88: Code executions happen in a blink, what is the expected outp...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Code executions happen in a blink, what is the expected output of this code do you think?', 384, 'let pollPoints = [''10'', ''10'', ''10''];\n\n\nlet parsed = pollPoints.map(parseInt);', NULL, 'closed', 'single', '2023-11-16T09:32:32.146Z', '2023-11-16T09:32:32.146Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[10, 10, 10] ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '["10", "10", "10"] ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[false, false, false]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[true, true, true]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[empty x 3]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[] ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[[[]]]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[{ 10: "10" }, { 10: "10" }, { 10: "10" }]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[NaN, NaN, NaN]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[10, NaN, 2]', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[10, null, 200]', false);

-- Poll 89: See the following code on the screen, what should the TypeSc...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, what should the TypeScript result have been?', 122, 'const key = "name";\n\ninterface Crop {\n    name: string;\n    daysToGrow: number\n}\n\nlet crop: Crop = { name: "Cauliflower", daysToGrow: 14 };\n\n\nlet value = crop[key];', NULL, 'closed', 'single', '2023-12-06T10:21:37.483Z', '2023-12-06T10:21:37.483Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'TypeScript won''t complain about anything and allows to run the code', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Type ''key'' cannot be used as an index type.\n''key'' refers to a value, but is being used as a type here.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Property ''key'' does not exist on type ''Crop''', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Element implicitly has an ''any'' type because expression of type ''Crop'' can''t be used to index type ''string''', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Argument of type ''Crops'' is not assignable to parameter of type ''string''', false);

-- Poll 90: The docs you may have checked, what is a CSS property that a...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('The docs you may have checked, what is a CSS property that allows control of the user to select text? ', 383, NULL, NULL, 'closed', 'single', '2023-11-22T09:44:29.830Z', '2023-11-22T09:44:29.830Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'div::selection', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'div::select ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'user-select ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'select-user', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You need JavaScript for this ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A backend / server is required to have this because text-selection might be insecure in several ways', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'text-selection', false);

-- Poll 91: In these polls some mysteries you explore, what operator mak...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In these polls some mysteries you explore, what operator makes the result of the following code 4?', 393, '10 (operator) 6 = 4', NULL, 'closed', 'multiple', '2023-12-20T10:01:13.960Z', '2023-12-20T10:01:13.960Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '- ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '+ ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '* ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '|| ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '=', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '%', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '/', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '>>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '+=', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '-=', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '~', false);

-- Poll 92: Given the following code where the 4 classes are what you wa...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Given the following code where the 4 classes are what you want to select, what output can you expect?', 216, '.container h3,\n.container h4,\n.container a,\n.container .1a {\n  color: red;\n}', NULL, 'closed', 'single', '2023-08-17T10:20:52.017Z', '2023-08-17T10:20:52.017Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'All three the tags and the class have their color turn red.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Only the <h3>, <h4> and <a> tags have their color turn red.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Only the .1a class will have the color:red applied.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The CSS breaks entirely and you get a plain HTML page.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Nothing happens and none of the CSS in the given code block is applied.', true);

-- Poll 93: I will come up with polls as much as I could, for variable a...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('I will come up with polls as much as I could, for variable a and b what should be the expected output? ', 186, 'const a = Array(10);\nconst b = Array(10, 20);', NULL, 'closed', 'single', '2023-12-07T09:27:42.218Z', '2023-12-07T09:27:42.218Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a: [10]\nb: [10, 20]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]\nb: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20]; ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a: [empty x 10] \nb: [10, 20]', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a: [10]\nb: [ 10, [10, 20] ]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Just "a" and "b" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[Array, Array]', false);

-- Poll 94: In JS, hard to read or a nifty trick, adding a property to a...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, hard to read or a nifty trick, adding a property to an object conditionally, which answer from below would you pick? ', 132, 'const shopItems = [\n    { item: “shovel”, price: 200 },\n    { item: “bombs”, price: 20 },\n    { item: “arrows”, price: 30 }, \n    { item: “shield (level 1)”, price: 100 }\n];', NULL, 'closed', 'single', '2022-12-07T08:39:35.731Z', '2022-12-07T08:39:35.731Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const shopItems = [\n    { item: “shovel”, price: 200 },\n    { item: “bombs”, price: 20 },\n    { item: “arrows”, price: 30 }, \n    { item: “shield (level 1)”, price: 100, if (someCondition) sale: true }\n];', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'shopItems.push("sale")', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'if (someCondition) { \n  shopItems = { ...shopItems, sale: true } \n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const shopItems = [\n    { item: "shovel", price: 200 },\n    { item: "bombs", price: 20 },\n    { item: "arrows", price: 30 }, \n    { item: "shield (level 1)", price: 100, ...(someCondition && { sale: true }) }\n];', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Object.entries(shopItems).map(item => item.sale = true)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Object.entries(shopItems).forEach(item => item.sale = true)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'shopItems.add({ …shopItems, sale?: true })', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'shopItems.pushConditionally({ sale: true }); ', false);

-- Poll 95: Of "narrowing" in TypeScript you must've heard, having this ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Of "narrowing" in TypeScript you must''ve heard, having this answer correct makes you a TypeScript nerd! ', 313, NULL, NULL, 'closed', 'single', '2023-07-06T07:36:24.153Z', '2023-07-06T07:36:24.153Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s the process of precompiling all types so the TypeScript''s compiler compiles faster \n', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a way for TypeScript to automatically know what the type of a result is without having to specify', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s when you are in a TypeScript challenge where the rules narrow you down to only use certain types ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a so-called metaphor: Narrowing in TypeScript is in fact that you may feel ''narrowed'' by it''s strict compiler whiled working on tight deadlines. This pushes the developer in a ''narrow'' position, and is the biggest complain about TypeScript to date. ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s an important step of the TypeScript compiler choosing the right types for each piece of code ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'TypeScript narrowing is the process of refining the type of a variable within a conditional block.', true);

-- Poll 96: In CSS, we can change cursors with a simple command, what sy...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, we can change cursors with a simple command, what syntax is used to change the cursor to a hand? ', 118, NULL, NULL, 'closed', 'single', '2022-10-19T08:05:32.841Z', '2022-10-19T08:05:32.841Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'cursor: hand', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can download an NPM package to implement custom cursors', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'cursor: pointer', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pointer: hand ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pointer: pointer ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'cursor: cursor', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'document.addEventListener(''mousemove'', (e) => {\n    x = e.offsetX;\n    y = e.offsetY;\n    document.styleSheets.item.cursor = "hand"\n});', false);

-- Poll 97: In React, prop drilling is popular and renowned, but what ar...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In React, prop drilling is popular and renowned, but what are disadvantages of passing data this way around?', 7, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Components have a maximum amount of props they can take, so prop drilling should be used sparingly', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Prop drilling comes with a security risk, because passing data around to components that should not be aware of certain data enables data leaks and raises the risks of security, so prop drilling should only be used when you really have to ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Prop drilled components are harder to maintain', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Prop drilled components will load slower and may cause memory leaks (however, this is fixable with useMemo / useCallback)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Components that should not otherwise be aware of the data become unnecessarily complicated', true);

-- Poll 98: See the following code on the screen, when trying to remove ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, when trying to remove the underline from the <i> only, what should the answer have been? ', 414, '<a href="/back">\n <i class="fa fa-chevron-left"></i> Terug naar resultaten\n</a>', NULL, 'closed', 'single', '2024-04-08T12:55:31.260Z', '2024-04-08T12:55:31.260Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a {\n  text-decoration: none;\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a i {\n  text-decoration: none;\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a {\n i {\n    text-decoration: none;\n }\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By assigning an ID to the element ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Only possible with JavaScript because CSS is rendered upfront and can''t know the DOM structure', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can''t do it this way; The seperate text node should be wrapped in an element and the <i> should be explicitly set to not have an underline ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a {\n i {\n    text-decoration: !important;\n }\n}', false);

-- Poll 99: The MDN site you may have checked, which of the following st...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('The MDN site you may have checked, which of the following statements returns the type "object"?', 220, 'const obj = {} \n', NULL, 'closed', 'multiple', '2023-03-08T09:08:24.312Z', '2023-03-08T09:08:24.312Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof 37 ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof obj ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof null ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof []', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof [{}]', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof "object" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof String(1)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof Symbol', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof undefined', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof Boolean', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof function () {}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof Math.max', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof typeof "null"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof new Date()', true);

-- Poll 100: “Magic” numbers may sound like wizards and witchery, what is...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('“Magic” numbers may sound like wizards and witchery, what is the meaning of this term of mystery? ', 300, NULL, NULL, 'closed', 'single', '2023-07-12T07:14:08.298Z', '2023-07-12T07:14:08.298Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is about numbers that are really big which we can’t comprehend and after a certain range is called a “magic” number', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s about the number 7 which is called “lucky” and “magical”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'They are numbers used to when the designers want the design to be pixel perfect ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'These are numbers which values which “work” under some circumstances but are frail and prone to break when those circumstances change', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With magic numbers they refer to the temporary numbers which are seen in for example 2FA auth apps, which expire in a certain amount of time and then “vanish”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'These are numbers you win when answering this poll correctly ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s the number what the browser automatically calculates when creating spaces between elements with “auto” values from CSS', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is referred to the agile scrum poker number when: when everyone  draws the same card at once, and the team is bigger than 5, you’ve got a so-called “magic” number', false);

-- Poll 101: Shown the following input and output clear, what could have ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Shown the following input and output clear, what could have happened here?', 176, 'setTimeout(() => {\n  console.log("2");\n}, 2);\n\nsetTimeout(() => {\n  console.log("0");\n}, 0);\n\n/**\n * Output:\n * > "2"\n * > "0"\n */', NULL, 'closed', 'single', '2023-02-02T09:03:51.994Z', '2023-02-02T09:03:51.994Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The console log is broken, you need to refresh it (it happens sometimes)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'After this code the event loop is busy, so both timers are expired and handled in order of definition', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The setTimeout "0" is a special value, and will only execute if there are not other timeouts left', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The developer of this code is located in Australia, where time spins the other way around', false);

-- Poll 102: In CSS, when creating animations, why is it advised to use t...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, when creating animations, why is it advised to use translate over absolute in these occasions?', 26, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s not advised, always use absolute over translate ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because translate is specifically for animations, you can’t animate other properties', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'According to the CSS spec, translate is more intuitive and has a clearer API to use than using absolute', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Animating with translate is supported by all browsers, while absolute isn’t supported by all browsers, which makes it clear why you would use one over the other ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Both absolute and translate should be used together to create the most efficient animations', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Animating absolute uses CPU and triggers reflow; translate uses GPU and is more efficient', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Absolute positioning removes elements from their natural flow, which makes it less intensive and efficient to animate', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With translate we actually mean a React hook useTranslate(), which is taling care of animation and is more efficient than CSS’ “absolute”', false);

-- Poll 103: A selector to match elements without children exists, which ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('A selector to match elements without children exists, which answer is correct from below''s answers list?  ', 219, NULL, NULL, 'closed', 'single', '2023-02-03T09:09:23.250Z', '2023-02-03T09:09:23.250Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':only-adults()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':no-children', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':18+() ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':!isset()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':clearfix()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':empty() ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':if(condition)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':optional', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':null()', false);

-- Poll 104: With this code in TypeScript this error you can see, do you ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('With this code in TypeScript this error you can see, do you know why you''ll get "Error! Type ''K'' can''t be used to index type ''T''"? \n', 371, 'function getValue<T, K>(obj: T, key: K): any {\n    return obj[key]; \n}', NULL, 'closed', 'single', '2023-10-25T08:06:28.563Z', '2023-10-25T08:06:28.563Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It has got an "any" type which TypeScript doesn''t like ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can''t get values in TypeScript, you can only get types so this function doesn''t make sense ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'TypeScript will complain this function can be written shorter by transforming it in an arrow function', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'TypeScript will complain that this won''t work because it can''t be sure that "key" is actually a key of "obj"', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The error will only occur from TypeScript 5 and higher: TS will complain about that using regular functions with TS are soon to be deprecated since TS moves to arrow function support only (in favor of JS future)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'In TypeScript 5, "key" is a reserved word and can''t be used freely anymore', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It complains about that T and K are not very descriptive', false);

-- Poll 105: It would be cool to have these polls on stage, which HTML ta...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('It would be cool to have these polls on stage, which HTML tags are render-blocking for a web page?', 295, NULL, NULL, 'closed', 'multiple', '2024-04-19T08:34:58.907Z', '2024-04-19T08:34:58.907Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<style>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<link>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<script>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<async>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<article>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<body>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<footer>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<head>', false);

-- Poll 106: Just look at the code below ... such horror ... much terror....
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Just look at the code below ... such horror ... much terror. Which of the following weird JavaScript codes actually give a compiler error?', 188, NULL, NULL, 'closed', 'multiple', '2022-12-16T09:06:32.546Z', '2022-12-16T09:06:32.546Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'console.log''lorem'';', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const a = a => a = a <= a;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const a++ = 0;', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const b = Boolean(() => {});', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"b" + "a" + + "a" + "a";', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const a = [0, 1][2, 3];', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const a = [0, 1, 2, 3,,4, 5, 6];', false);

-- Poll 107: In CSS, this question might be apparent, but how can you mak...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, this question might be apparent, but how can you make only the background, not the text, of this button semi transparent? ', 169, NULL, 'https://codesandbox.io/embed/hopeful-pasteur-vgg62s?fontsize=14&hidenavigation=1&theme=dark&view=preview', 'closed', 'single', '2022-12-06T09:22:48.918Z', '2022-12-06T09:22:48.918Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'opacity', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'disabled state ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'background-opacity', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'background-color-opacity ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With CSS vars', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'rgba ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '-webkit-color-transparency-level', false);

-- Poll 108: In TS, you can define functions to be invoked in multiple wa...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In TS, you can define functions to be invoked in multiple ways, can you name the approaches on how to do that these days?', 120, NULL, NULL, 'closed', 'multiple', '2022-10-20T07:36:23.798Z', '2022-10-20T07:36:23.798Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Type guarding', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Function overloading', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By augmenting arguments in the function signature ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Generics is all you need', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By making sure to implement constraints in your functions', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By adding private methods to your classes', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Function unloading ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By copying the functions and assign each with different function signatures', false);

-- Poll 109: Something we don't speak often about is DOM reflow, what are...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Something we don''t speak often about is DOM reflow, what are things about this process you know?', 358, NULL, NULL, 'closed', 'multiple', '2023-10-03T08:41:26.736Z', '2023-10-03T08:41:26.736Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Reflow occurs when we want to purposely re-render part(s) or all of the document', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Reflow occurs when we do an insert, delete or update operation on an element in the DOM', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Reflow occurs when we delete an item from the DOM with the use of JavaScript', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Reflow occurs when an animation on a DOM element starts and ends', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Reflow occurs when we type text in an input box element', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Reflow occurs when we change CSS styles by using Javascript', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Reflow occurs when the flow of the page changes by scrolling down and up the page', true);

-- Poll 110: In Frontend, content-theft is real, what approach can be use...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In Frontend, content-theft is real, what approach can be used to prevent visitors to steal?', 138, NULL, NULL, 'closed', 'single', '2023-01-05T12:08:33.652Z', '2023-01-05T12:08:33.652Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By making content unreadable by using CSS blurs for instance ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By disallowing text selection, right clicking on the page and disabling all keyboard shortcuts', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s not possible', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By blocking devtools for all users', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using meta tag <meta name="copyright" content="The Owner" />', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By trying to conceal your website from visitors as much as possible (e.g make sure search engines won''t find you)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By rendering content in a unusual and unreadable foreign language for your users', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using a copyright sign next to your content', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By making your website not a11y proof', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By communicating to the user on your website/app that nobody is allowed to steal the content', false);

-- Poll 111: In CSS, selecting parent elements from within a child is som...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, selecting parent elements from within a child is something we all plead, now with what syntax can we achieve this need? ', 94, NULL, NULL, 'closed', 'single', '2022-09-19T09:33:10.982Z', '2022-09-19T09:33:10.982Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With the `:has()` selector', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Only possible when using SASS', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With the `:is()` selector', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With the `:parent()` selector', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With the `<` parent combinator', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JS in at least required for this', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With the lobotomized owl * + * selector', false);

-- Poll 112: Yes, here is a new poll again, a button element is suitable ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Yes, here is a new poll again, a button element is suitable when?', 265, NULL, NULL, 'closed', 'multiple', '2023-08-25T08:20:43.372Z', '2023-08-25T08:20:43.372Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Buttons are specifically meant for game development ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Buttons are useful for form submits', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'For signing up to a newsletter ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'For triggering a popup/modal or tooltip', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'For mashing ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'To navigate to a specific section of a page', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'For navigating to another page', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'For allowing the user to contact a certain email adres or phone number', false);

-- Poll 113: In HTML, <ul> and <ol> are list tags that exist, do you know...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, <ul> and <ol> are list tags that exist, do you know the functionality that''s comes with using <datalist>?', 20, NULL, NULL, 'closed', 'single', '2022-11-15T08:57:43.681Z', '2022-11-15T08:57:43.681Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<datalist> is used for server-side data and has SEO features', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Content wrapped in <dl> will be automatically submitted when submitting a form, even outside a form', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<datalist> can be used as reusable template code HTML code in JavaScript', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<datalist> comes with check/uncheck functionality out of the box (todo list) ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<datalist> enables an autocomplete feature when combining with an input field, based on the items provided in a datalist', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<datalist> is used to display tabular data mostly', false);

-- Poll 114: Generating a type for this code you might have preferred, to...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Generating a type for this code you might have preferred, to do this what is the right keyword?', 404, '{\n    "Stardew Valley": {\n        "release_date": "2016-02-26",\n        "star_rating": "5/5"\n    },\n    "Ocarina of Time": {\n        "release_date": "1998-11-21",\n        "star_rating": "5/5"\n    },\n    "Majora''s Mask": {\n        "release_date": "2000-04-27",\n        "star_rating": "5/5"\n    },\n    "Super Mario 64": {\n        "release_date": "1996-06-23",\n        "star_rating": "5/5"\n    },\n    "Pokemon": {\n        "release_date": "1996-02-27",\n        "star_rating": "5/5"\n    },\n    "Banjo-Kazooie": {\n        "release_date": "1998-06-29",\n        "star_rating": "4.5/5"\n    }\n}\n', NULL, 'closed', 'single', '2024-03-18T09:53:01.585Z', '2024-03-18T09:53:01.585Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'keyof ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'valueof', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'variableof', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'for of', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'instanceof', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'code of', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'gameof', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'propertyof', false);

-- Poll 115: Now this is a term you may not often see, what is a fact abo...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Now this is a term you may not often see, what is a fact about JSONP? ', 413, NULL, NULL, 'closed', 'multiple', '2024-03-12T08:51:42.475Z', '2024-03-12T08:51:42.475Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JSONP is a improved version ov JSON, as it allows you more space or "padding" (where P stands for) in your files which you can''t in JSON, such as: using comments and up to 64 levels nesting', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JSONP was a new version of JSON started back in 2010 and was named after the developer Jason Paige ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JSONP is an extended variant of JSON that was developed by the W3C and stared under project name "JSONP" which was short for JSON Prototype', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JSONP was actually intended to work with the "prototype" object in JavaScript', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JSONP stands for JSON with Padding', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JSONP was meant for circumventing the same-origin policy', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ' JSONP only works with GET requests, limiting its use in applications that require POST, PUT, DELETE, or other HTTP methods', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JSONP has confusingly the same syntax as XML', false);

-- Poll 116: In JS, what you often see are package managers which is no b...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, what you often see are package managers which is no baloney, what token do you need next to your version to update minor/patches only? ', 71, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '-', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '_', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '~', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Nothing, it won’t upgrade packages unless you explicitly run an upgrade command from the concerned package manager', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '^', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '🚧', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '!', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '⚠️', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'lock', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '🔒', false);

-- Poll 117: Advanced typing is sometimes hard to see, do you know the re...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Advanced typing is sometimes hard to see, do you know the result of FuncA and FuncB?', 185, 'type A<Args> = Args extends any ? (a: Args) => unknown : never;\ntype B<Args> = (a: Args) => unknown;\n\ntype FuncA = A<number | string>;\ntype FuncB = B<number | string>;', NULL, 'closed', 'single', '2023-04-17T08:01:55.195Z', '2023-04-17T08:01:55.195Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'FuncA = never; FuncB = (a: number | string) => unknown;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'FuncA and FuncB are both: (a: number | string) => unknown;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'This is invalid syntax: there should be parenthesis around the function signature on line 1', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'FuncA = ((a: number) => unknown) | (a: string) => unknown);\nFuncB = (a: number | string) => unknown;', true);

-- Poll 118: In Frontend, navigating 

when navigating pages the flash of...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In Frontend, navigating \n\nwhen navigating pages the flash of a blank page can be circumvented, what technique can you apply to have this prevented?', 135, NULL, NULL, 'new', 'single', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By wrapping your pages in iframes', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using <a client-href>Link</a> tags when linking to other pages', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using a client-side routing system ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By applying microfrontends ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By not using other routes in your app ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By hooking in on the "onNavigate" DOM event', false);

-- Poll 119: In JS, functions accept parameters in any position, how can ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, functions accept parameters in any position, how can you accept unlimited parameters in your function definition?', 151, NULL, NULL, 'closed', 'single', '2022-12-01T08:26:50.813Z', '2022-12-01T08:26:50.813Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'buildSentence(a, b, c, d, e, f //… expand as needed) => { }', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'buildSentence([…strings]) => { }', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'buildSentence(...strings) => { }', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'buildSentence(strings.reduce((prev, curr) => acc + curr)) => { }', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'buildSentence(Object.entries(strings)) => { } ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'buildSentence(strings!) => { }', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'buildSentence([...a].map(a => a.join("")) => { }', false);

-- Poll 120: In JS, primitive types are strings, do you know what the res...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, primitive types are strings, do you know what the result of this code brings? ', 152, 'const item = "Boomerang"; \n\nitem[1] = "l"; ', NULL, 'closed', 'single', '2023-01-06T08:55:35.858Z', '2023-01-06T08:55:35.858Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns the 2nd character as a boolean, whether its found or not', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It modifies the 2nd character \n', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It crashes because strings are immutable and cannot be modified', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It throws a warning but modifies the 2nd character', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It has no effect and nothing happens ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It concatenates the strings just like you would with .join(""), because of a JS quirk', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It throws an error: ImmutableError: Primitive types are not to be mutated, see https://mozilla.docs.com/immutable-types for more info', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It changes the string "Boomerang" to "Blomerang"', false);

-- Poll 121: Promises are functions we await, what is the name of the fir...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Promises are functions we await, what is the name of the first state? ', 397, NULL, NULL, 'closed', 'single', '2024-01-17T11:06:27.616Z', '2024-01-17T11:06:27.616Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'fulfilled ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'rejected', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'initialized', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'start', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pending', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'await ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'gathering', false);

-- Poll 122: In JS, a promise can be resolved or rejected, now what knowl...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, a promise can be resolved or rejected, now what knowledge is required to make promises work as expected? ', 37, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Promises are a more convenient way to handle asynchrony instead of with callback functions', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The power of promises is attaching chains, but you can’t attach more than 5 chains to your promise because of performance issues. Libraries like bluebird do allow this ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'All JavaScript callbacks are promises ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Promises can run in parallel', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Promises return values automatically, that’s why they are called promises', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.chain is used to chain promises together', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Promises enable multithreading in JS', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Promises improve performance drastically compared to callbacks', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Promises are only used to fetch data from an API', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When a promise is rejected, it automatically stops executing the remaining code and rest of the chain', false);

-- Poll 123: Earlier React had a method to handle logic when a component ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Earlier React had a method to handle logic when a component would unmount, what is the modern approach you may know about? ', 329, NULL, NULL, 'closed', 'single', '2023-09-07T07:48:22.440Z', '2023-09-07T07:48:22.440Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With useComponentUnmount ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With componentWillUnmount', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By returning a function in your useEffect function body', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useUnmountEffect', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By adding "[]" (empty dependency) as second parameter of useEffect', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Just use useEffect, React will do this automatically ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'There is no such thing in React', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The garbage collection API is needed to achieve unmounts', false);

-- Poll 124: For this poll your knowledge is valued and needed, what tag ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('For this poll your knowledge is valued and needed, what tag represents that text is deleted?', 146, NULL, NULL, 'closed', 'single', '2022-12-21T08:40:49.209Z', '2022-12-21T08:40:49.209Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<remove>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<del>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'There is no tag ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<p deleted>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<p style={ display: "none" }>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<destroy>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<p style={ font-size: 0 }>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<kbd>', false);

-- Poll 125: This question has just a single answer to be accepted, how i...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('This question has just a single answer to be accepted, how is only the first <p> tag selected?', 197, '<section>\n   <h1></h1>\n   <p></p>\n   <p></p>\n   <p></p>\n</section>\n', NULL, 'closed', 'single', '2023-01-04T12:01:36.028Z', '2023-01-04T12:01:36.028Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'p:first-child', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'p:only-child', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'p:is', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'p:where', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'p:first-of-type', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'p:first-of-tag', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'p:where(:first-child)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'p', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'section p', false);

-- Poll 126: Old syntax is going nearly extinct, how can you make this un...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Old syntax is going nearly extinct, how can you make this union distinct? ', 394, '\nconst arrA = [1, 2, 3];\nconst arrB = [2, 3, 4]; \n\nconst union = ???', NULL, 'closed', 'single', '2024-02-08T11:10:46.345Z', '2024-02-08T11:10:46.345Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const union = [...arrA, ...arrB]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const union = [...arrA, ...arrB].reduceRight((acc, curr) => { \n   if (acc[curr]) acc[curr] = curr \n   const distinct = []; \n\n   distinct.push(curr)\n   return [\n     ...acc,\n     ...distinct\n   ]\n\n}, [])', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const union = arrA.filter(x => !arrB.includes(x)).concat(arrB.filter(x => !arrA.includes(x)));', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const union = [...new Set([...arrA, ...arrB)];', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const union = arrA.filter(element => !arrB.includes(element));', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const union = arrA.union(arrB)', false);

-- Poll 127: A random output with the following code is correct, which an...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('A random output with the following code is correct, which answer will output either 1, 2 or 3 do you expect? ', 377, NULL, NULL, 'closed', 'single', '2023-11-07T09:12:17.507Z', '2023-11-07T09:12:17.507Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Math.cos(Math.random() * 3);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Math.floor(Math.random() * 3);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Math.round(Math.random() * 3);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Math.max(Math.random() * 3);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Math.ceiling(Math.random() * 3);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Math.ceil(Math.random() * 3);', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Math.up(Math.random() * 3);', false);

-- Poll 128: It’s really fun to see you all play, what is the output of t...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('It’s really fun to see you all play, what is the output of the following array?', 264, 'const array = [1, 2, 3, 4, 5];\n\n[array[1], array[3]] = [array[3], array[1]];\n\nconsole.log(array); // output: ???\n', NULL, 'closed', 'single', '2023-03-16T15:36:17.223Z', '2023-03-16T15:36:17.223Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[1, 2, 3, 4, 5]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Syntax error: Destructuring is not a function', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[2, 3, 1, 4, 5]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[1, 4, 3, 2, 5]', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '5', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[3, 1]', false);

-- Poll 129: I never approve my polls without rhymes, how can you stash u...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('I never approve my polls without rhymes, how can you stash untracked files, something we want sometimes?', 280, NULL, NULL, 'closed', 'single', '2023-04-13T07:05:53.665Z', '2023-04-13T07:05:53.665Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'git');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git stash ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git untracked stash ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git commit ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git stash -u ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git reflog -P', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git add -U ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By adding them to your global .gitstash', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git rm cache', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git help stash', false);

-- Poll 130: In Frontend, making changes in the ECMAScript specification ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In Frontend, making changes in the ECMAScript specification is quite a big transition, what marks the stage as complete and ready for the next ECMAScript edition? ', 69, NULL, NULL, 'closed', 'single', '2022-12-08T08:31:09.082Z', '2022-12-08T08:31:09.082Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Whenever a popular developer writes a blogpost or makes video about it', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When the feature reaches "stage 4: Finished" ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When the feature is released on production ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When the feature contains a W3C-approval sticker ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When the features emerges in the NPM registry', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When the feature underwent all scrum events', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When the ECMAScript elections result in more votes for "RELEASE" then "DON''T RELEASE" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Whenever a new ECMAScript president is chosen, a new feature is also released ', false);

-- Poll 131: In JS, the DOM API contains querySelectorAll, what will be r...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, the DOM API contains querySelectorAll, what will be returned when you give this function a call? ', 81, NULL, NULL, 'closed', 'single', '2022-09-09T07:53:22.404Z', '2022-09-09T07:53:22.404Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'An array of document nodes', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'An object of document nodes ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A set of document nodes ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A list of document nodes wrapped in <li>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A list of divs', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'null', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A nodelist of document nodes', true);

-- Poll 132: See the following code on the screen, when selecting the mos...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, when selecting the most descendant <a> only, what should the correct answer have been? ', 209, '<h1>Your life stories</h1>\n<ul>\n    <li><a href="/poll">Fill in the daily poll</a></li>\n    <li>Finish the sprint</li>\n    <li>Reach my goals\n        <ul>\n            <li>Sub task 1</li>\n            <li>Sub task 2</li>\n            <li>Sub task 3</li>\n            <li><a href="/">Go back to all stories</a></li>\n        </ul>\n    </li>\n</ul>', NULL, 'closed', 'single', '2023-03-17T09:02:49.052Z', '2023-03-17T09:02:49.052Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ul a ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ul > a ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ul ul a ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ul a ul ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a ul ul ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a ul ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a ~ ul ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a:has(ul)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':where(a):has(ul)', false);

-- Poll 133: With architecting apps it's always important to decouple, bu...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('With architecting apps it''s always important to decouple, but what defines a tuple? ', 401, NULL, NULL, 'closed', 'single', '2024-01-09T09:13:10.692Z', '2024-01-09T09:13:10.692Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a term that is used for defining programming with an extra set of eyes: "pair programming" or as we say "tupling" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When your program runs, the start between the execution of code and the end of it is called "tuple" time', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a technique where instead of taking multiple arguments at once, takes the first argument and returns a new function', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Tuple (or Tuple.js) is a library that allows you to produce immutable data with the usage of mutable assignments in your code ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a data structure that can hold a fixed number of elements, and these elements can be of any type', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Other than LAB, HSL, RGB, a "tuple" is a color representation which renders more (and brighter) colors on the screen, closer to the human vision', false);

-- Poll 134: A fun challenge it is to make these polls all rhyme in verse...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('A fun challenge it is to make these polls all rhyme in verse, now how do for loops run in reverse?', 195, NULL, NULL, 'closed', 'single', '2022-12-12T08:37:13.959Z', '2022-12-12T08:37:13.959Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'for (i++; i < array.length; let i = 0) {\n     // process array[i]\n}\n', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'for (let i = 0; i < arr.length; i++) {\n     // process array[i]\n}\n', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'for (let i = array.length; i--; ) {\n     // process array[i]\n}\n', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'for reverse(let i = 0; i < arr.length; i++) {\n     // process array[i]\n}\n', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'for (let i = 0; i < arr.length; i++).sort((a, b) => a - b) {\n     // process array[i]\n}\n', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'rof (tel = 0; i > rra.htgnel; ++i) { \n // process array[i]\n} ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '{\n   // process array[i]\n} (i++; i < arr.length; let i = 0;) for', false);

-- Poll 135: See this "https://poll-app-ivory.vercel.app/polls" URL, whic...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See this "https://poll-app-ivory.vercel.app/polls" URL, which answers are considered same origin, can you tell? ', 332, NULL, NULL, 'closed', 'multiple', '2023-10-27T08:00:45.807Z', '2023-10-27T08:00:45.807Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'https://poll-app-ivory.vercel.app/polls/12345', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'http://poll-app-ivory.vercel.app/polls/12345', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'https://poll-app-ivory.vercel.app/chunks.js', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'https://ing.nl/accounts/marciano/transactions', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'https://backend-api-polls.vercel.app/', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'https://poll-app-ivory.vercel.app/admin', true);

-- Poll 136: In CSS, selector specificity rules should be used wisely, no...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, selector specificity rules should be used wisely, now which answer contains the right order of selectors from lowest to highest precisely?', 10, NULL, NULL, 'closed', 'multiple', '2024-01-29T09:07:03.190Z', '2024-01-29T09:07:03.190Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'classes, attributes and psuedo classes > elements and psuedo elements > id’s > inline styles', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'elements and psuedo elements > classes, attributes and psuedo classes > id’s > inline styles', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'id’s > classes, attributes and psuedo classes > elements and psuedo elements > id’s > inline styles', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'inline styles  > classes, attributes and psuedo classes > elements and psuedo elements > id’s ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It depends on the browser and user settings', false);

-- Poll 137: In HTML, semantic tags it’s what it’s all about, what benefi...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, semantic tags it’s what it’s all about, what benefits of writing semantic tags can you name without doubt?', 75, NULL, NULL, 'closed', 'multiple', '2022-09-22T08:20:13.577Z', '2022-09-22T08:20:13.577Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Semantic tags have display flex by default, which encourages the use of semantic tags and makes styling easier', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Semantic tags are important to SEO; page ranking is influenced', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Semantic tags increases performance of page rendering because the browser can skim easier through meaningful tags than when having a forest of <divs>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Semantic tags can’t be ignored because the browser compiler will throw an error at runtime when semantic tags are not used in the right place', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Apps that use semantic tags will be marked as more trustworthy', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Semantic tags are important for users with screen readers', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Using semantic tags are way to enhance your styling and help to scope your CSS code', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Semantic tags show developer’s intent', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Semantic tags are there to style your page according to the concerned tag. E.g, <form> will provide a styled form without any CSS needed', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Semantic tags have better browser support ', false);

-- Poll 138: A blob of HTML code is presented that's right, how do you di...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('A blob of HTML code is presented that''s right, how do you disable all input fields at once in HTML, what would you write? ', 370, '<form>\n  <fieldset>\n    <legend>Save your ores</legend>\n\n    <input type="radio" id="copper" name="ore" value="C" />\n    <label for="copper">Copper ore</label><br />\n\n    <input type="radio" id="iron" name="ore" value="I" />\n    <label for="iron">Iron ore</label><br />\n\n    <input type="radio" id="gold" name="ore" value="G" />\n    <label for="gold">Gold ore</label>\n\n\n    <input type="radio" id="gold" name="ore" value="I" />\n    <label for="iridium">Iridium ore</label>\n  </fieldset>\n</form>', NULL, 'closed', 'single', '2023-11-14T08:40:50.538Z', '2023-11-14T08:40:50.538Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By applying the disabled attribute on the <form> tag', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By looping through all input elements in JavaScript and put them on disabled', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By applying the disabled attribute on the <fieldset> tag', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By applying the disabled attribute on the <legend> tag', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By wrapping the inputs with a <disabled> tag ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By applying the needed styling with CSS ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By wrapping inputs with a <disabled> tag', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By removing all "for" attributes', false);

-- Poll 139: Type casting, there is something which is good to know, what...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Type casting, there is something which is good to know, what is that fact listed below?', 282, NULL, NULL, 'closed', 'single', '2024-04-15T08:46:03.933Z', '2024-04-15T08:46:03.933Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Using type casting always slows down performance significantly', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Type casting is error prone because it’s still in beta', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Type casting is not supported in Firefox and should therefore be polyfilled', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you use type casting, you can only use the built-in typescript types such as number, boolean, string, tuples, array, object, never, unknown and any', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Type casting is the same as using any for your types', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a technique used to inform the TypeScript compiler about the type of an object more explicitly than it can infer on its own.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Using const value: number = 5 intentions are the same as using “as number”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Type casting is such a complicated operation it can only be used with simple primitive types', false);

-- Poll 140: A bunch of statement about CSS I give you, which ones of the...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('A bunch of statement about CSS I give you, which ones of these are true?', 357, NULL, NULL, 'closed', 'multiple', '2024-01-16T09:27:03.192Z', '2024-01-16T09:27:03.192Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'margin-top and margin-bottom have an effect on inline elements', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Pseudo-elements enable us to generate elements that typically aren''t present in the document structure', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Pseudo classes are classes you can set at pseudo elements to style them', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The vh and vw units are used to measure the vertical height and width of a web component', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The vh and vw units are used to measure the height and width in percentages with respect to the viewport', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CSS Preprocessors are used in browsers to process all the loaded CSS files before they are rendered by the browser engine', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CSS Preprocessors are tools to extend the basic functionalities of CSS', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The order of matching selectors in CSS goes from RIGHT to LEFT of the expression', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The order of matching selectors in CSS goes from LEFT to RIGHT of the expression', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The float property is used to position HTML elements on the horizontal axis towards the left or right of the container', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The float property is used to let HTML elements float around other elements on the horizontal axis', false);

-- Poll 141: In CSS, when block level element margins vertically collide,...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, when block level element margins vertically collide, what explanation from this behaviour can you provide?', 60, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.855Z', '2025-11-09T18:57:41.855Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The adjacent element will dissappear', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The adjacent block element will behave as inline element', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Nothing, it will just behave as instructed in CSS or default browser styles are applied', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The margins will collapse, meaning that the margin of the biggest element will win ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The adjacent block element will be out of the document flow', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The adjacent block element will ignore all CSS rules applied', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Margins will be removed from both elements ', false);

-- Poll 142: TypeScript increases our codebases predictability, what stat...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('TypeScript increases our codebases predictability, what statement is used to make object or array values have immutability?', 221, NULL, NULL, 'closed', 'single', '2023-03-27T07:59:00.699Z', '2023-03-27T07:59:00.699Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'as Immutable', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'as ImmutableArray', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'as ImmutableUnionGuardConstValue', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'as Constraint', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'as const', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'as PollAnswer', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'as typeof keyof', false);

-- Poll 143: Mathematics was not my favourite in class, but by answering ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Mathematics was not my favourite in class, but by answering this one question right, you shall pass! The difference with plus and minus in Javascript you can see, what will the cause be?', 350, 'const plus = "1111" + 11\nconsole.log(plus); // Output here is: 111111\n\nconst min = "1111" - 11\nconsole.log(min); // Output here is: 1100', NULL, 'closed', 'multiple', '2023-10-30T09:27:35.574Z', '2023-10-30T09:27:35.574Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The developers only made the plus operator smart enough to ignore types and only look at the values.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The difference lies in how Javascript handles string concatenation and it converts the numeric values to a string and concatenates the strings together.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Javascript doesn''t allow subtraction on strings, so it converts the strings to a number and subtracts them.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'This is a known bug in ECMAScript 6 and will be fixed in version 7.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You need Typescript in order to use plus and minus on strings without type casting your values in advance.', false);

-- Poll 144: In JS, sometimes errors raise unexpected, what is the name o...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, sometimes errors raise unexpected, what is the name of this type of error produced by this code which should be corrected?  ', 12, 'const favoriteFood = "pizza";  favoriteFood.reverse();', NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'SyntaxError', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'EvalError', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'TypeError ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'UriError', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'RangeError', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ReferenceError', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Error', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'MethodError', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It doesn’t return an error, it will just return undefined', false);

-- Poll 145: In CSS, there is a psuedo class combo to prevent elements fr...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, there is a psuedo class combo to prevent elements from being selected, now how do you select all list items but leave the last one unaffected?', 91, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':not(:last-child)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':where:not(:last-child)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':where:is:not(:last-child)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '::but(:last-child)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '::before:last-child', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '::after:second-last-child', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':not(::tail)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '::last', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':is:not(:last-child)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s not possible with psuedo classes and it’s therefore mandatory to add a “.last” class to the last element and then style it', false);

-- Poll 146: Knowlegde about frontend is crucial, which statement from be...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Knowlegde about frontend is crucial, which statement from below about CSS is truthful? ', 206, NULL, NULL, 'closed', 'single', '2023-05-17T07:42:12.363Z', '2023-05-17T07:42:12.363Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When specificities of declarations are equal in the same origin type, the last declaration takes precedence ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Element selectors have a higher specificity than classes ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The box model changes based on the element shapes you create: for example, if you create a CSS triangle, triangle model rules will apply', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Media queries are dedicated for controlling the viewport only', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CSS selectors :is and :where are exactly the same ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CSS'' parent selector is a pseudo element and can be used with ":parent"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<div> element''s semantic meaning is "division" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<span> element''s semantic meaning is to span across space', false);

-- Poll 147: See the following code on the screen, what should the output...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, what should the output have been? ', 395, '!!!/**/1111;;;;!!!(((console!!!.log!!!(((`"''wow''"`!)))!!!)))!!!;;;111///!!!', NULL, 'closed', 'single', '2024-01-25T08:47:58.406Z', '2024-01-25T08:47:58.406Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Identifier expected.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Expression expected.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'wow', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"''wow''"!', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"''wow''"', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'wow!', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ''';'' expected', false);

-- Poll 148: Sometimes programming feels like a maze, what is the value o...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Sometimes programming feels like a maze, what is the value of both arrays? ', 390, 'const array = [1, 2, 3, 4]; \n\nconst reverseArray = array.reverse(); \n', NULL, 'closed', 'single', '2023-12-11T09:10:10.936Z', '2023-12-11T09:10:10.936Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array: [1, 2, 3, 4]\nreverseArray: [1, 2, 3, 4]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array: [4, 3, 2, 1]\nreverseArray: [4, 3, 2, 1]', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array: [1, 2, 3, 4]\nreverseArray: [4, 3, 2, 1]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array: [4, 3, 2, 1]\nreverseArray: [1, 2, 3, 4]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array: [5, 4, 3, 2, 1]\nreverseArray: [5, 4, 3, 2, 1]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array: []\nreverseArray: []', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array: [1, 2, 3, 4]\nreverseArray: [0.25, 0.33333, 0.5, 1]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array: []\nreverseArray: [4, 3, 2, 1]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array: [1, 2, 3, 4]\nreverseArray: [ᛚ ˎ𐑕 ˎԐ ˎ𐊀]\n', false);

-- Poll 149: See the following code on the screen, when I set the CSS rul...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, when I set the CSS rules "color: burlywood; margin: 3rem" on <section>, what should the result have been?  ', 207, '\n    <section>\n      Front-endless Magazine\n      <article>\n        <h1>Newsflash!</h1>\n        <p>This is an article about the daily poll.</p>\n        <aside>\n          <h2>Advertisement</h2>\n          <p>Your Advertisement here!</p>\n        </aside>\n      </article>\n    </section>', NULL, 'closed', 'single', '2024-04-12T09:07:49.559Z', '2024-04-12T09:07:49.559Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The text node within <section> and the textnode gets a margin and will contain the "burlywood" color (so only "front-endless magazine"). Everything starting from <article> will stay in default browser styling', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Every single element will be colored burlywood and will have a margin of 3rems ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Every element will have a margin of 3rem, but only the text node in section will have a color burlywood', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The <section> get''s a margin of 3rems, the color "burlywood: will be applied on everything within the <section>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The margin will be on <section>, but color will have no effect since it only works on so called text elements like <h1> and <p>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Margin''s don''t work on <section> elements because it''s an inline element', false);

-- Poll 150: In JS, why would you recommend the use of eval, to other dev...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, why would you recommend the use of eval, to other developers as function fundamental?', 64, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is not recommended because it opens a security leak, eval is evil', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You don’t use it because it’s a special function used by the JIT compiler to make your JS more performant when it’s runs in the browser', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s used, but not so much because it makes code less readable. It is only used if code needs to be really performant, like in (older) JS environments where functional programming style is even too heavy', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s just a function used for regular expressions', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a useful function when you want to parse CSS styles in your JavaScript e.g when you don’t use CSS modules. It provides a ready-made object (much like the CSS modules “styles” object)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a function used by build tools and uglifiers to provide the fastest build times and hot module reloads', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s not recommended because it’s deprecated', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s only used for older browsers when code is transpiled because JS runs way faster when code is ran in eval', false);

-- Poll 151: Using 'git push -f' should make you wary, why could it make ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Using ''git push -f'' should make you wary, why could it make a situation hairy? ', 325, NULL, NULL, 'closed', 'single', '2023-07-27T07:27:43.301Z', '2023-07-27T07:27:43.301Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'git');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because when using this command, Git will use more server power to push your work to their servers. This might take your repo server down or translate in more costs for hosting', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because you might change the commit history ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because doing things forcefully is never good ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because it''s and outdated command and should not be used anymore ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because it will hide the commit author and messages, which makes it very hard to track back changes ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because it deploys your apps to production', false);

-- Poll 152: Before CSS existed we used inline styles and HTML markup, wh...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Before CSS existed we used inline styles and HTML markup, what are the advantages and limitations of CSS without looking it up?', 355, NULL, NULL, 'closed', 'multiple', '2023-09-25T07:58:52.861Z', '2023-09-25T07:58:52.861Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'HTML became so complicated new developers couldn''t understand their own code anymore. So that''s why CSS was invented.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CSS was invented to separate content from presentation, thus present the same content in multiple formats like desktop, laptop and mobile.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Writing everything in HTML took up a lot of bandwidth. By introducing CSS developers code create multiple style sheets, store them in the browser cache and use them across multiple pages.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'One of the problems with CSS is that is was easier to maintain only the HTML markup instead of multiple files. ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Each browser has different behaviours and changes the outcome of some CSS selectors.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Another problem with CSS is that not every browser supports all given selectors. This has to do with the expensive costs to buy it from the W3C.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Another problem with CSS is that not every browser supports all given selectors. We have to check that with the @support selector.', true);

-- Poll 153: In HTML, character entities is a subject you may know or not...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, character entities is a subject you may know or not, if you want to use "<" and ">", choose an answer below and remember one chance is all you got!\n', 147, NULL, NULL, 'closed', 'single', '2022-11-08T08:33:51.453Z', '2022-11-08T08:33:51.453Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '#leftarrow and #rightarrow', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '@lt= and @rt=', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '@lt; and @gt;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '&lefttag; and &righttag;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '&lt; and &rt;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '&lt; and &gt;', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '#lefttag; and #greatertag;', false);

-- Poll 154: How to get all 8 directions on a compass rose, written with ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('How to get all 8 directions on a compass rose, written with only 4 of those? ', 425, 'type Result = "North" | "South" | "West" | "East" | "NorthEast" | "NorthWest" | "SouthEast" | "SouthWest";', NULL, 'closed', 'multiple', '2024-04-26T09:44:04.831Z', '2024-04-26T09:44:04.831Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type Result = `${"North" | "South"}${"West" | "East"}`;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type Result = Exclude<`${"North" | "South" | ""}${"West" | "East" | ""}`, "">;', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type Result = Exclude<`${"West" | "East" | ""}${"North" | "South" | ""}`, "">;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type Result = Exclude<"", `${"North" | "South" | ""}${"West" | "East" | ""}`>;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type Result = `${"North" | "South"}${"East" | "West" | ""}`;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type Result = Exclude<`${"South" | "North" | ""}${"East" | "West" | ""}`, "">;', true);

-- Poll 155: Adding an UTF arrow for display introduces a quirk, how can ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Adding an UTF arrow for display introduces a quirk, how can you make the intended behavior work?', 337, '<span>←</span>', NULL, 'closed', 'single', '2024-03-27T09:42:17.475Z', '2024-03-27T09:42:17.475Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It needs to be written as &ShortLeftArrow;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You need to add &#65038; or else iOS > 6 will render it as an emoji', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It needs to be written as &#8592;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You need to add proper aria roles, or else the arrow will not display', false);

-- Poll 156: See, my laptop screen is not always dazzling and gleaming, d...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See, my laptop screen is not always dazzling and gleaming, do you know why each Node.js major version has a distinct meaning? ', 415, NULL, NULL, 'closed', 'single', '2024-03-26T09:33:08.827Z', '2024-03-26T09:33:08.827Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Even versioning numbers are meant to be used for production, while uneven numbers are used for local development environments on your projects. Perks are for instance readable errors you migh encounter', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Even versioning numbers are considered long term support (LTS), while odds are intended for introducing new features and innovation  ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'There are no differences, you should always get the latest (stable) version whenever possible', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Even versioning numbers are meant for speed performance, while odds provides better error tracking', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Even versioning numbers are used when you need the ''bare minimum'' API, while using the odds provide you with the full node API', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Even versioning numbers are focussed on security of the node runtime, while odd versioning numbers are focussed on performance', false);

-- Poll 157: In CSS, colors are what makes the web shine so bright, how c...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, colors are what makes the web shine so bright, how can you apply transparency to a background color from a var that''s always right?', 315, '--color: orange;\n--color: #FFFF00;', NULL, 'closed', 'single', '2023-09-12T07:51:08.793Z', '2023-09-12T07:51:08.793Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'background-color: var(--color);\nopacity: 0.2;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'background-color: rgba(var(--color), 0.2);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'background-color: color-mix(in srgb, var(--color) 80%, transparent);', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'background-color: rgb(var(--color) / 20%);', false);

-- Poll 158: When we put up regular functions and arrow functions in a fi...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('When we put up regular functions and arrow functions in a fight, which of the following statements are right?', 346, '// This is a regular (classic) function\nfunction multiply(x, y, z,) {\n  return x*y*z;\n}\n\n// This an arrow function\nconst multiply = (x, y, z) => {\n  return x*y*z;\n}', NULL, 'closed', 'multiple', '2023-09-19T08:22:28.557Z', '2023-09-19T08:22:28.557Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Both regular functions and function expressions can utilize "this" to refer to their parent object.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Both regular functions and arrow functions can utilize "this" to refer to their parent object.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Regular functions can access the "arguments" keyword.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Arrow Functions can access the "argument" keyword.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Arrow functions can''t access the "argument" keyword.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Arrow functions allow for more readable code by using syntactic sugar (hmmm yummy!)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Omitting curly braces and the "return" keyword is one of the key features of Regular Functions.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Omitting curly braces and the "return" keyword is one of the key features of arrow functions.', true);

-- Poll 159: We have polls all year round, what equivalent of the followi...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('We have polls all year round, what equivalent of the following code snippet can be found?', 380, 'function getPolls() {\n  return Promise.resolve();\n}', NULL, 'closed', 'single', '2023-11-17T09:04:56.002Z', '2023-11-17T09:04:56.002Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'function* getPolls(poll) {\n    yield poll;\n\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'async function getPolls() {\nreturn { poll: "We have polls all year round, what equivalent of the following code snippet can be found?" }\n}', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'await getPolls() ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const getPolls = setTimeout(() => ({ poll: "We have polls all year round, what equivalent of the following code snippet can be found?" })', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof async getPolls = () => yield polls;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'function getPolls() { \n   return { poll: "We have polls all year round, what equivalent of the following code snippet can be found?" }\n}', false);

-- Poll 160: Answer this right if you want to score, with inputs, what is...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Answer this right if you want to score, with inputs, what is the ''name'' attribute used for? ', 308, NULL, NULL, 'closed', 'single', '2023-08-31T08:21:24.420Z', '2023-08-31T08:21:24.420Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is used to identify the form data when the form is submitted to the server', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s an attribute tat expects a unique value so HTML can render more efficiently', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s meant as hook for referencing input fields in JavaScript', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s used in conjunction with <label> to improve a11y ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s used to come up with nicknames for your input, every developer nicknames their custom input fields ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a simple way to have a "text" above your input field without using a label tag ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s used to provide the user with a little tooltip', false);

-- Poll 161: See the following code on your screen, what is the name of t...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on your screen, what is the name of this technique you’ve seen?', 24, 'concatenated("It''s")("always")("Christmas")("in")("Freezeezy")("Peak")', NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Ketchup’ing', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Promises', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Reducers', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Prototype chain ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Inheritance', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Concatenation', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Curry’ing', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'This is just a regular function', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Higher order components', false);

-- Poll 162: JSON we use everyday, which of these statements are ok?...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('JSON we use everyday, which of these statements are ok?', 362, NULL, NULL, 'closed', 'multiple', '2023-10-20T08:05:00.601Z', '2023-10-20T08:05:00.601Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JSON.parse("null")', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JSON.parse(null)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JSON.parse("''null''")', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JSON.parse(undefined)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JSON.parse("undefined")', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JSON.parse(''"undefined"'')', true);

-- Poll 163: Some of these polls need to be emended, when having an objec...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Some of these polls need to be emended, when having an object, how can we make sure properties and methods cannot be appended? \n', 229, NULL, NULL, 'closed', 'single', '2023-02-21T08:42:45.039Z', '2023-02-21T08:42:45.039Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Objects are immutable by default ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When assigning an object as const the object is already immutable ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JavaScript doesn''t support this, a library is required ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Using TypeScript guards to protect the object is atleast required to make objects immutable ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With the Object.immutable() function ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With the Object.freeze() function ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By adding a passphrase to an existing ssh key for the object in question, so only devs with this passphrase can access this object', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By encrypting your objects with bcrypt', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By going up the prototype chain and replace the object "append" function', false);

-- Poll 164: In HTML, tooltips are often seen in a user interface, what i...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, tooltips are often seen in a user interface, what is required to create the simplest tooltip in this case?', 90, NULL, NULL, 'closed', 'single', '2022-09-09T06:54:24.970Z', '2022-09-09T06:54:24.970Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CSS code is atleast required for a simple tooltip', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JS code is atleast required for a simple tooltip', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With bootstrap or any kind of CSS framework is required for a tooltip', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With an attribute applied on an element called “title” ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With the psuedo element ::tooltip', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With the <tooltip> element', false);

-- Poll 165: See the following CSS query on your screen, can you explain ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following CSS query on your screen, can you explain what the effect should have been? ', 373, 'td:has(:not(:only-child))', NULL, 'closed', 'single', '2024-03-05T08:38:19.741Z', '2024-03-05T08:38:19.741Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Invalid CSS syntax', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Whenever there is a single <td> element, apply style rules on <td>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Whenever the <td> has multiple children elements, apply the CSS rules on all children', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Whenever the <td> has a single element, style the <td>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When <td> has siblings, apply the CSS rules on all sibling <td>''s', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When <td> does not have siblings, apply the CSS rules only when there are multiple <td>''s', false);

-- Poll 166: You must've come across Object.values, from the code below f...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('You must''ve come across Object.values, from the code below find the correct output, what piece of code will you choose? ', 194, 'const scrambled = { 2: "e", 5: "o", 1: "h", 4: "l", 3: "l" };\n\nconst result = Object\n  .values(scrambled)\n  .reduce((agg, el) => agg + el, "");\n\nconsole.log(result);', NULL, 'closed', 'single', '2023-01-12T08:32:31.932Z', '2023-01-12T08:32:31.932Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'elloh', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'eohll', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'hello', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '2, 5, 1, 4, 3', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '1, 2, 3, 4, 5', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '{ 2: "e", 5: "o", 1: "h", 4: "l", 3: "l" }', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'goodbye', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'TypeError: Object.values(...) cannot be used with scrambled objects keys', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CompilerFault: The compiler couldn''t match this complex string into a meaningful word', false);

-- Poll 167: This language we use to create UI’s that impress, what are k...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('This language we use to create UI’s that impress, what are key differences between classes and IDs in CSS?', 201, NULL, NULL, 'closed', 'multiple', '2023-03-24T08:12:40.389Z', '2023-03-24T08:12:40.389Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ID''s can only have a single level of specificity, while when using classes you can chain specificity', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ID''s have a lower specificity than classes', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'An element can only have a single ID. Classes can be applied to multiple elements', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'An ID is used for repeated elements like lists items to improve performance, classes are not unique', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ID''s have a higher specificity than classes', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Classes default to the element to be block, when using ID''s the default is display of the element is inline ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When using ID''s on an element you cannot use classes on an element', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'An ID can only be applied once like: <div id="unique">, while the following <div id="unique another-unique-id"> is not allowed', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ID''s create scope, while classes do not', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Using an ID is evenly specific when using .class.class.class.class.class.class.class.class.class.class', false);

-- Poll 168: A piece of text can be checked if it occured, how would you ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('A piece of text can be checked if it occured, how would you do that with the following word? ', 236, '"Chris P. Bacon"', NULL, 'closed', 'multiple', '2023-03-10T08:22:08.796Z', '2023-03-10T08:22:08.796Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"Chris P. Bacon".indexOf("Chris P.") !== -1', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"Chris P. Bacon".includes("Chris P.")', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"Chris P. Bacon".contains("Chris P.")', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"Chris P. Bacon" === "Chris P." ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"Chris P. Bacon".has("Chris P.")', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"Chris P. Bacon".includes("chris p.")', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'strpos("Chris P. Bacon", "Chris", 0)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'str_contains("Chris P. Bacon", "Bacon")', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"Chris P. Bacon".include?("Chris P.")', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'if ("C") { \n  if ("H") { \n    if ("I") { \n       if ("S") {\n\n       }\n    }\n  }\n\n} ', false);

-- Poll 169: In CSS, this code example you probably understand, what code...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, this code example you probably understand, what code for min-width an max-width is an equal shorthand? ', 179, '.ಠ_ಠ {\n  min-width: 288px;\n  max-width: 900px;\n}', NULL, 'closed', 'single', '2023-09-21T07:09:50.842Z', '2023-09-21T07:09:50.842Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.ಠ_ಠ {\n   width: clamp(288px, 100%, 900px);\n}\n', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'There is no shorter way defining this ಠ_ಠ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.ಠ_ಠ {\n  width: minmax(288px, 900px); \n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.ಠ_ಠ {\n   width: shorthand(288px, 900px)\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.ಠ_ಠ {\n   w: 288px, 900px\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.ಠ_ಠ {\n   widths: [288px, 900px]\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Only possible with CSS container queries ಠ_ಠ', false);

-- Poll 170: In JavaScript the .find() method is designed, but what does ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JavaScript the .find() method is designed, but what does this method allow you to find?', 260, NULL, NULL, 'closed', 'single', '2023-03-20T08:14:57.405Z', '2023-03-20T08:14:57.405Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It finds the answer to this question ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The lowest number of an array', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The length of an array', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The first element in an array that passes a certain test', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It finds bugs in your app', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It finds the this context', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It finds the result of a promise', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It finds the last value of an object ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It finds code that might be useful for your app', false);

-- Poll 171: See the following code on the screen, what should the output...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, what should the output have been? ', 263, 'const characters = [[ "name", "Mumbo Jumbo"], [ "name", "Motzhand"], [ "name", "Salty Joe"], [ "name", "Unga Bunga"]];\n\nObject.fromEntries(characters); \n', NULL, 'closed', 'single', '2024-02-09T09:49:58.983Z', '2024-02-09T09:49:58.983Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[{name: ''Mumbo Jumbo''},\n{name: ''Motzhand''},\n{name: ''Salty Joe''},\n{name: ''Unga Bunga''}]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '{name: ''Unga Bunga''}', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '{}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Syntax error', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'undefined ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[{name: ''Unga Bunga''}]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '{name: ''Mumbo Jumbo''}', false);

-- Poll 172: ServiceWorkers make web apps more evolved, do you know their...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('ServiceWorkers make web apps more evolved, do you know their lifecycle steps and order involved?', 352, NULL, NULL, 'new', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Installation, Waiting, Detection', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Detection, Verification, Installation, Waiting, Activation', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Verification, Waiting, Installation, Activation, Detection', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Detection, Verification, Waiting, Activation, Installation', false);

-- Poll 173: Look at the code you see. Can you define a type that verifie...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Look at the code you see. Can you define a type that verifies each dependency? What would the type of PDC be?', 271, 'const diagram = {\n  "findKey": {},\n  "getOil": {},\n  "oilHinges": { dependsOn: ["getOl"] },\n  "openDoor": {\n    dependsOn: ["findKey", "oilHinges", "openDoor"]\n  }\n} as const;\n\nconst pdc: PDC<typeof diagram> = diagram;\n// The type should detect the typo in ''getOl'' and disallow ''openDoor'' to depend on itself', NULL, 'closed', 'multiple', '2023-07-11T07:36:52.756Z', '2023-07-11T07:36:52.756Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Not possible!', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type PDC<T> = T extends Record<infer Key, unknown> ? {\n  readonly [K in Key]: { dependsOn?: readonly Exclude<Key, K | number | Symbol>[] };\n} : never;', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Easy! Its the answer with the code in it.', true);

-- Poll 174: In CSS, a useful property is outline, what is it's main purp...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, a useful property is outline, what is it''s main purpose when implementing an app design?', 129, NULL, NULL, 'closed', 'single', '2022-10-12T07:34:13.930Z', '2022-10-12T07:34:13.930Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s main purpose is to use it as decorative border to circumvent the box model', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Outline is used when you know upfront that you want a border around your entire element as outline doesn''t allow to style a single side ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Outline is used when you need more interactive borders, e.g for animation', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Outline is used for making elements more accessible, e.g on elements that need focus', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Outlines are mainly used for tabular elements', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Outlines are used to mark the "boundaries" of a web page within a users''s view', false);

-- Poll 175: All files will be added to your repo with git init, how do y...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('All files will be added to your repo with git init, how do you tell git these files should not be added in your repo when you want to commit?', 254, NULL, NULL, 'closed', 'single', '2023-12-08T16:05:35.515Z', '2023-12-08T16:05:35.515Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'git');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can’t, files in your repo are always committed to your repo and there is no way to get rid of them ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using rm -rf node_modules', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By adding them in your .gitignore', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By cherry-picking files in your local repository', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By placing them in your global .ohmyzsh file', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By adding a comment in your files “@git-ignore”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When adding .git to your file, files will be added to your repo when committed. If you exclude this, they won’t', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By placing needed files and folders (e.g node_modules) outside your repo ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using a what we call the "microservices architecture" for versioning control which isolates files and folders from git, but allow them to be used in your projects', false);

-- Poll 176: Lists, you should know them well, for which of these lists s...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Lists, you should know them well, for which of these lists should you prefer an ol over a ul?', 156, NULL, NULL, 'closed', 'multiple', '2022-12-02T09:05:04.252Z', '2022-12-02T09:05:04.252Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A list of steps in a recipe', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A timeline of events in an incident report', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A list of criteria in a definition of done', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A list of ingredients in a recipe', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A list of quizzers on a leaderboard in a poll app', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A list of answers to a poll question', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A list of stories in a Scrum backlog', true);

-- Poll 177: In JS, runtime errors are caught so be assured, can you expl...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, runtime errors are caught so be assured, can you explain how the following error occurred? ', 62, '(Error: "[”FREE”, “KABISA”, “DRINKS”].toLowerCase()" is not a function)', NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It occurred because you are trying to call a value as a function but the value is not a function', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It occurred because you didn’t export your React component', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It occurred because you are trying to access a function before it is initialized', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It occurred because the code was not transpiled ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It occurred because the code was not polyfilled ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It occurred because it is a syntax error', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It occurred because a variable name is missing ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It occurred because you forgot to include the necessary libraries', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It occured because you are running JS in an environment where usage of JS is limited', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It occurred because you are trying to access a property on a null object', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It occured because it’s not adhering the JS syntax', false);

-- Poll 178: As font specialist this is probably not new, what does font-...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('As font specialist this is probably not new, what does font-face allow us to do?', 275, NULL, NULL, 'closed', 'single', '2023-05-09T07:28:50.078Z', '2023-05-09T07:28:50.078Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It defines what kind of font we use for our webpages', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It allows fonts to be displayed on browsers that don’t support normal fonts', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is an old deprecated rule that was used to load fonts', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It allows you to define custom fonts and use them on your web pages, even if the font is not installed on the user''s computer\n\n ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It allows you to select from a library of fonts from a user’s computer', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It allows you to specify the specs if a font with the font-face API; you can basically create your font programmatically', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a way to allow fonts to load async', false);

-- Poll 179: For these polls there so many subjects to explore, what is t...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('For these polls there so many subjects to explore, what is the purpose of gitignore? ', 321, NULL, NULL, 'closed', 'single', '2023-09-04T10:11:39.233Z', '2023-09-04T10:11:39.233Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'git');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It makes sure git ignores all your commands in the terminal so you won''t accidentally push or commit', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a setting to ignore Git when using other version control system such as SVN or Mercurial ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a file where you specify what Git users you wan''t to block/ignore ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a file where you specify what repositories you want to ignore', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a file where you specify what client projects you never want to see again so Github, Bitbucket etc. won''t show them to you and will automatically remove you as member ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a file to specify which files should not be tracked', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a file where you specify what files should not be committed', false);

-- Poll 180: Undefined is something you have seen alot, but can you expla...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Undefined is something you have seen alot, but can you explain what it means, or not? ', 212, NULL, NULL, 'closed', 'single', '2023-11-28T09:52:39.453Z', '2023-11-28T09:52:39.453Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means the variable is there, but has no value at the moment ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means the variable doesn''t exist and you are trying to reach it ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means that your variable name is called "undefined" which is not allowed and returns undefined', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means that you are trying to use syntax that doesn''t exist and is therefore undefined ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means that you forgot to type your variable ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means your variable has not been loaded yet ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means the garbage collector came to clean unneeded undefined values in your code ', false);

-- Poll 181: See the following code on your screen, when the condition "r...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on your screen, when the condition "rupees" evaluates to 0, what output is to be seen? ', 134, 'export default function App() {\n  const rupees = 0;\n\n  return <div>{rupees && <h1>Rupees: {rupees}</h1>}</div>;\n}', NULL, 'closed', 'single', '2022-10-26T07:40:40.702Z', '2022-10-26T07:40:40.702Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It won''t render anything, the <h1> will not render since 0 is a falsy value ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will render "<h1>Rupees: 0</h1>"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will render "<h1>Rupees: </h1>"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It renders "0" ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It crashes the app because in React you should atleast render something', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It renders "undefined" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will render "<h1>Rupees: null</h1>"', false);

-- Poll 182: Here is another poll that continues my poll pursuit, what is...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Here is another poll that continues my poll pursuit, what is the purpose of the <form>''s ''action'' attribute? ', 281, NULL, NULL, 'closed', 'single', '2023-07-18T07:58:20.362Z', '2023-07-18T07:58:20.362Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It allows you to trigger some client-side code when a form is submitted, for instance showing a "thank you popup" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It specifies whether you want to POST or GET the form submission', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It allows you to load ActionScript files, because forms are highly interactive and are therefore built with ActionScript', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It allows you to specify what actions should be taken when the form is loaded', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because forms are complex and are mostly standalone apps on themselves, actions allow you to build and test your forms automatically on every form submission', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It specifies the URL where the form data should be submitted', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It lets you specify what type of form this is used for and displays default form fields depending on your value (e.g login shows a login form, registration shows a form with needed fields, search shows a single field with a magnifying glass). ', false);

-- Poll 183: Have this answer correct and points are there for you to win...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Have this answer correct and points are there for you to win, what html element should you wrap the following text in?', 309, '2023-05-13 20:39 ', NULL, 'closed', 'single', '2023-10-24T09:16:07.369Z', '2023-10-24T09:16:07.369Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<clock>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<span>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<t>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<date>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<time>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<spacetime>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<temporal>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<birthday>', false);

-- Poll 184: In JS, ensuring code quality is no jest, what are reasons ca...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, ensuring code quality is no jest, what are reasons can you give why we should test?', 83, NULL, NULL, 'closed', 'multiple', '2022-09-28T08:57:18.997Z', '2022-09-28T08:57:18.997Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'To encapsulate your code ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a mandatory step to fulfill the needs for a CI/CD pipeline process, before going to production', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'We do it because It actually is a requirement when working with agile scrum: Each sprint we don’t have to go to production, but we should strive to writing tests to successfully conclude a sprint', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It helps increasing your LoC and code coverage, which reflects your activity and shows your commitment and is important for measuring individual performance in the team and the company ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It builds confidence in your code because you can run it whenever you make changes in code', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s just code etiquette we all adhere to, e.g: at casual companies, tests are often not required, but if the company is more corporate, etiquettes like this have to be followed', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is only beneficial when you don’t have manual testers in you team', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a way to guide visual impaired developers in codebases and help them get familiar with it', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will probably reduce code maintenance', true);

-- Poll 185: In HTML, attributes adjusts behaviour of elements which is n...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, attributes adjusts behaviour of elements which is noticable, what attribute is used to make to interactive elements keyboard focusable?', 102, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'autofocus', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With keyboard event listeners', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'keyfocus', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With CSS psuedo class :focus', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'onFocus', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'onBlur', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'tabindex', true);

-- Poll 186: In CSS, knowing box-sizing is essential for layout, what are...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, knowing box-sizing is essential for layout, what are facts of setting box-sizing to know that’ll pay out? ', 25, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'box-sizing: border-box changes how the width and height of elements are being calculated, border and padding are also being included in the calculation.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'box-sizing: border-box is a neat way to debug your CSS as it puts borders around every element', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'box-sizing: content-box is the default setting according to the CSS standard', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Using box-sizing in IE11 required a polyfill', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When box-sizing: content-box is set and width is 200px + and padding is 20px, the total width is 240px ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When box-sizing: content-box is set and width is 200px + and padding is 20px, the total width is 200px ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Prefixes are still required to support box-sizing on all browsers and devices because sadly  it’s still not implemented in all browsers yet', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Box-sizing setting controls from accessibility perspective the focus (or highlight) of certain elements like a button or a link where the user can click / tab through. ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Box-sizing is another way with CSS logical properties to determine width of an element', false);

-- Poll 187: See the following code on the screen, what output should thi...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, what output should this have been? ', 240, 'const categories = [“html”, “css”, “javascript”, “typescript”];\n\nconst getCategories = (x, ...y, z) => console.log(x, y, z);', NULL, 'closed', 'single', '2023-03-15T08:23:29.809Z', '2023-03-15T08:23:29.809Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“html” [“css”, “javascript”] “typescript”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“html” [undefined, undefined] “typescript”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“html” undefined “typescript”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[“html”, “css”, “javascript”, “typescript”]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"html" [“css”, “javascript”, “typescript”]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"html" “css” [“javascript”, “typescript”]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'This will result in a syntax error', true);

-- Poll 188: Often my polls consist of jabroni, keywords are a standard i...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Often my polls consist of jabroni, keywords are a standard in every language, find the "keywords" that are baloney!', 327, NULL, NULL, 'closed', 'multiple', '2023-08-22T09:33:06.138Z', '2023-08-22T09:33:06.138Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'for ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'after ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'switch', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'undefined ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'new', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'private', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'enum', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'throw', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pitcher ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'interface', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'internose ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'try ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'eval', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'that', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'inyourface', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'finally', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'evil', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'this ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'NaN', true);

-- Poll 189: In CSS, images come in all different shapes and sizes, to le...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, images come in all different shapes and sizes, to let the image fit it’s container, what property you may already know now arises? ', 187, NULL, NULL, 'closed', 'single', '2023-01-30T08:10:42.168Z', '2023-01-30T08:10:42.168Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'object-size ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'image-size ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'image-fit ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'object-fit', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array-fit', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'box-sizing', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'container queries', false);

-- Poll 190: This question is though so beware, when using "opacity" what...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('This question is though so beware, when using "opacity" what side effect will happen are you aware? \n', 115, NULL, NULL, 'closed', 'single', '2023-10-16T08:36:02.614Z', '2023-10-16T08:36:02.614Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It creates a stacking context', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It takes elements out of the DOM flow', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It makes elements inline automatically', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Opacity is a shorthand property, so it implicitly sets properties values tied to opacity like “opacity-rate” or “opacity-color”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By design mistake it ignores the CSS specificity rules', false);

-- Poll 191: In HTML, a web page has event flows built into, now what are...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, a web page has event flows built into, now what are the ways it flows through?', 47, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Circling (event flow cycle)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Square (event square model: top, left, right, bottom)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Passing down events (Event delegation)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Top to Bottom(Event Capturing) and Bottom to Top (Event Bubbling)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'EventEffect (events on dependency mamagement)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Synthetic event flow', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Event flow artifacts', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Event loop (queue based)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'What the heck are you talking about? There is no such thing as event flows', false);

-- Poll 192: In CSS, "scroll-chaining" is a thing happening when we scrol...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, "scroll-chaining" is a thing happening when we scroll, what property can you use to make it under your control?', 112, NULL, NULL, 'closed', 'single', '2022-09-27T08:09:54.040Z', '2022-09-27T08:09:54.040Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'scroll-chain', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The JS Intersection Observer API ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'overflow', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'overscroll-behaviour ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'scroll-snap', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'window.scrollTo()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'var notChangedStepsCount = 0;\nvar scrollInterval = setInterval(function() {\n    var element = document.querySelector(".element-selector");\n    if (element) { \n        // element found\n        clearInterval(scrollInterval);\n        element.scrollIntoView();\n    } else if((document.documentElement.scrollTop + window.innerHeight) != document.documentElement.scrollHeight) { \n        // no element -> scrolling\n        notChangedStepsCount = 0;\n        document.documentElement.scrollTop = document.documentElement.scrollHeight;\n    } else if (notChangedStepsCount > 20) { \n        // no more space to scroll\n        clearInterval(scrollInterval);\n    } else {\n        // waiting for possible extension (autoload) of the page\n        notChangedStepsCount++;\n    }\n}, 50);', false);

-- Poll 193: In React, the code below returns the following error on your...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In React, the code below returns the following error on your screen, what would your solution have been? ', 119, 'Warning: Each child in a list should have a unique "key" prop.\n\n// Code\n<dl>\n  {items.map(item => \n     <>\n       <dt>item.name}</dt>\n       <dd>{item.description}</dd>\n     </>\n  )}\n</dl>', NULL, 'closed', 'single', '2024-01-30T09:33:30.903Z', '2024-01-30T09:33:30.903Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<dl>\n  {items.map(item => \n     <key={item.id}>\n       <dt>{item.name}</dt>\n       <dd>{item.description}</dd>\n     </>\n  )}\n</dl>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<dl>\n  {items.map(item => \n     <Fragment>\n       <dt>{item.name}</dt>\n       <dd>{item.description}</dd>\n     </Fragment>\n  )}\n</dl>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<dl>\n  {items.map(item => \n     <Fragment key={item.id}>\n       <dt>{item.name}</dt>\n       <dd>{item.description}</dd>\n     </Fragment>\n  )}\n</dl>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<dl>\n  {items.map(item => \n     <div>\n       <dt>item.name}</dt>\n       <dd>{item.description}</dd>\n     </div>\n  )}\n</dl>', false);

-- Poll 194: Babel is used in projects many times, now what does it do an...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Babel is used in projects many times, now what does it do and what are it’s facts,  for sure is that it’s quite hard to come up with these rhymes!', 55, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a special tool designed by Google to make the web a better place specially aimed at IE11', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a tool to transform your code to make it more efficient and faster in browsers', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When using Babel in your app you are adhering to the code quality standards according to the EcmaScript committee. This allows your company to wear the Babel quality mark. Once a year Babel auditors randomly visit companies for code quality inspections and taking coding assignments with the people working at the company', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Babel detects what features a browser has to offer. You can serve great experiences for each user per device', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Babel is a tool that converts not native supported browser code into backwards compatible code so you can write the newest features in all browsers', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Babel has nothing to do with web, it’s just a one-on-one interaction (mostly used in user research fields) to gather information from a person, which is called “even Babelen” that has been "accepted" as the multilingual term people understand', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a library you can include that provides functions like “.map” or “.reduce” out of the box and places those methods on the datatype they belong to', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Babel-testing-library is a fast and popular testing framework ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Babel is a tool that allows developers to test their websites and apps in different emulated browsers', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Babel compiles JavaScript code to a low level language that provides low level languages like C or Rust to run in the browser', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Babel is a module bundler like webpack or rollup', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Babel is software to track all your hours in, manage your resources or propose your time off (the nicer competitor to Oodoo)', false);

-- Poll 195: In JavaScript not only errors may be something you won't exp...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JavaScript not only errors may be something you won''t expect, which of these answers calling .toString() on are correct?', 305, NULL, NULL, 'closed', 'multiple', '2023-08-21T08:25:22.767Z', '2023-08-21T08:25:22.767Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[].toString // "[]"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[].toString()  // ""', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[1,2,3].toString()  // ["1", "2", "3"]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[1,2,3].toString()  // 1,2,3', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[null, undefined].toString() // ,', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[null, undefined].toString()  // ["null", "undefined"]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[].toString() // [array Array]', false);

-- Poll 196: This question is not that hard so you can relax, what featur...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('This question is not that hard so you can relax, what feature does CSS modules have that CSS lacks? ', 193, NULL, NULL, 'closed', 'single', '2022-12-19T08:47:41.271Z', '2022-12-19T08:47:41.271Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Determining specificity ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Container queries', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A set of utility classes', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Write actual CSS in your JavaScript', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Importing CSS files into other CSS files', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Scope isolation', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Bundling and minimize CSS code for production builds', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It adds CSS spec modules to the language so you can write the newest CSS ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a library providing utility components fully styled like buttons, grids, badges, headers, nav etc.', false);

-- Poll 197: All of my polls are still in rhyme, tell the difference betw...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('All of my polls are still in rhyme, tell the difference between Git and Github this time!  ', 336, NULL, NULL, 'closed', 'single', '2023-09-20T08:39:48.214Z', '2023-09-20T08:39:48.214Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'git');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Git is only run in your terminal, GitHub is where you create pull requests', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Git is your computer''s memory for code changes, while GitHub is a social network where you showcase your best code selfies', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Git is the version control system, while GitHub is needed to authenticate users to use Git ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Git is where you development of your code that is not ready yet for production, while on Github all your code is ready for production ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Git is the version control system that drives Github, where Github allows you to simply host repositories, coming with additional features', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'There is no difference between the two, they can be used interchangibly', false);

-- Poll 198: In our eat guild our craftsmanship is what we refuel, what c...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In our eat guild our craftsmanship is what we refuel, what combination of git commands exist of when using “git pull”?', 244, NULL, NULL, 'closed', 'single', '2023-03-03T07:58:37.445Z', '2023-03-03T07:58:37.445Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'git');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git merge + git status', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git merge + git rebase', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git add + git subtract', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git divide + git fetch', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git fetch + git merge', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git hub + git status', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git revert --no-commit HEAD~3...HEAD and git reset', false);

-- Poll 199: CSS knows continued advancement. For values, how to use prog...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('CSS knows continued advancement. For values, how to use progressive enhancement?', 363, NULL, NULL, 'closed', 'single', '2023-09-26T08:26:18.622Z', '2023-09-26T08:26:18.622Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.my-button {\n  background-color: red; /* fallback */\n  background-color: color-mix(in srgb, red 80%, transparent); /* enhanced */\n}', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.my-button {\n  background-color: color-mix(in srgb, red 80%, transparent); /* enhanced */\n  background-color: red; /* fallback */\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.my-button {\n  background-color: red; /* fallback */\n}\n@supports (color-mix) {\n  .my-button {\n    background-color: color-mix(in srgb, red 80%, transparent); /* enhanced */\n  }\n}', false);

-- Poll 200: ARIA roles provide you a11y with control, on which elements ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('ARIA roles provide you a11y with control, on which elements identify under the "textbox" role? \n', 374, NULL, NULL, 'closed', 'multiple', '2024-03-07T10:03:03.821Z', '2024-03-07T10:03:03.821Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<textbox> ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<textarea>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<p>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<span>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="number">', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="text">', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="date">', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<section>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<h1> to <h6>', false);

-- Poll 201: In CSS, specificity is basic stuff, now name a fact about it...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, specificity is basic stuff, now name a fact about it that’ll make your CSS knowledge tough?', 111, NULL, NULL, 'closed', 'single', '2022-10-15T18:59:03.543Z', '2022-10-15T18:59:03.543Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Specificity is so-called code style, meaning that you write very specific, pure and immutable CSS', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Specificity is “special” CSS aimed at advanced CSS’ers, referring to a learning phase after mastering the fundamentals', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Specificity is the second S in CSS: Cascading Specificity Styles', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Specificity is the algorithm used by browsers to determine the CSS declaration  that is the most relevant to an element', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Specificity applies to the term “specificity classes” like :active, :is, :where, :has, :link, :hover etc. ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Specificity is applied when you nest your styles: when applying, you will create specific CSS code ', false);

-- Poll 202: These poll app categories do expand, tell me what the functi...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('These poll app categories do expand, tell me what the function is of "git add"? ', 243, NULL, NULL, 'closed', 'single', '2023-02-27T09:08:58.605Z', '2023-02-27T09:08:58.605Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'git');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It adds git to your project ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It adds git on your system', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Git is a calculator, with "git add" it adds a series of numbers and returns the total ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It adds a new poll to this app', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It adds one or more files to the staging area', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It adds a new local branch ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It adds the new update fetched from the source branch ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It installs a new Git library package', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It adds Git to your OS', false);

-- Poll 203: Equality checks are not something we use everyday, but what ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Equality checks are not something we use everyday, but what is the following output and why is that you would say?', 349, 'const firstNumber = 1;\nconst secondNumber = "1";\n\nif (firstNumber == secondNumber) {\n  console.log(true)\n} else {\n  console.log(false);\n}\n\n// Output #1 is?\n\nif (firstNumber === secondNumber) {\n  console.log(true);\n} else {\n  console.log(false);\n}\n\n// Output #2 is?', NULL, 'closed', 'single', '2024-04-11T09:12:04.943Z', '2024-04-11T09:12:04.943Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Output #1 is true, output #2 throws an error. This is because the === operator doesn''t work in plain Javascript.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Output #1 is true, output #2 is false. This is because the === operator forces the comparison of values and its types.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Both output #1 and #2 are true. This is because both the == and === operators don''t care about types and just check the values in a smart way.', false);

-- Poll 204: To make an object with one number and the rest is string, in...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('To make an object with one number and the rest is string, in TypeScript how would you define such a thing?', 296, 'type A = Record<string, string> & { number: number };\ntype B = { number: number } & Record<string, string>;\ntype C = { number: number } | Record<string, string>;\ntype D<Key extends string = string> = { number: number } | Record<Key extends "number" ? never : string, string>;\ntype E = { number: number } | Record<Exclude<string, "number">, string>;\ntype F = { number: number } | Omit<Record<string, string>, "number">;\n\n\nconst test: /* A B C D E or F */ = {\n    hello: "helo",\n    world: "world",\n    number: 12\n}', NULL, 'closed', 'single', '2023-11-03T08:54:26.774Z', '2023-11-03T08:54:26.774Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'B', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'C', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'D', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'E', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'F', false);

-- Poll 205: In JS, notice alot of weird things are still due, which stat...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, notice alot of weird things are still due, which statements evaluate to true? ', 168, NULL, NULL, 'closed', 'multiple', '2023-02-20T08:42:08.801Z', '2023-02-20T08:42:08.801Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '1.0 + 2.0 === 3.0', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '0.1 + 0.2 === 0.3', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '0.2 + 0.3 === 0.5', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '0.1 + 0.6 === 0.7', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '0.1 + 0.7 === 0.8', false);

-- Poll 206: Don’t ask me why these polls all rhyme, getting the last 2 i...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Don’t ask me why these polls all rhyme, getting the last 2 items of this array, how do you adjust the following line?', 44, 'const me = {\n   id: "1",\n   name: "Marciano",\n   what: ["Keyboard tapper", "Side project manager", "FE Poll Master"]\n}', NULL, 'closed', 'multiple', '2024-01-08T09:26:32.298Z', '2024-01-08T09:26:32.298Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const [2,3] = me', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const [first, …rest] = me', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const [“Side project manager”, “FE Poll Master”] = me;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'me.lastTwo()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'me.last().last()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'me.pop(2)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'first, *rest = me', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const { what: [first, ...rest] } = me', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'me.what.slice(-2);', true);

-- Poll 207: Parallel or on demand bundles can be loaded, what is term I’...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Parallel or on demand bundles can be loaded, what is term I’m looking for that requires this and prevents your app from being bloated?', 222, NULL, NULL, 'closed', 'single', '2023-10-04T08:09:41.514Z', '2023-10-04T08:09:41.514Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'minimizing', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'tersering', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'code splitting', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'webpacking', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'gulping', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'grunting', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'browserifying', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array splitting', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'parceling ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'minifying', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'web scraping', false);

-- Poll 208: In TypeScript the question mark operator has it’s use, it’s ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In TypeScript the question mark operator has it’s use, it’s not there very long, but what functionality did it introduce?', 261, NULL, NULL, 'closed', 'single', '2023-03-30T19:58:57.037Z', '2023-03-30T19:58:57.037Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“?” means the property that comes after doesn’t matter what the type the value is ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It the line code you write is not ready yet and with “?” you inform your fellow colleagues about that', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means the code you write with an “?” is actually a way of questioning your own code when you’re not sure about what you wrote', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"?" means that you communicate in your code that type of the value can be random ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"?" means the value is awaiting a promise ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '\n"?" means the property or method you want to access may be accessed on a value that may not exist ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '?', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s to express this is temporary code', false);

-- Poll 209: See this CSS error on your screen, what type of error will b...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See this CSS error on your screen, what type of error will be seen?', 368, '.selector { \n   display: "A cool website" \n}', NULL, 'closed', 'single', '2024-04-16T08:39:51.430Z', '2024-04-16T08:39:51.430Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'SyntaxError', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'SelectorError: This selector is not supported', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ValueError: The value "A cool website" is not supported for property "display" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Undefined ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CSS automatically will mark the area as "dangerous" with borders to draw developers attention that there has been  an error', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Nothing happens, CSS will just happily continue cascading around!', true);

-- Poll 210: My sea of polls comes sometimes like a wave tidal, what fact...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('My sea of polls comes sometimes like a wave tidal, what facts do you know about the tag <title>?', 277, NULL, NULL, 'closed', 'multiple', '2023-04-18T07:13:03.584Z', '2023-04-18T07:13:03.584Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<title> is required because you need to give your document a name to be saved in your filesystem ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is very important for SEO purposes because search engines use it to understand the topic of the page and display it in search results', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will display in the browsers title bar ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<title> is the most important title tag of the heading group, even more important than <h1> ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When no <title> is defined, your document will automatically contain "Untitled" as title', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When using <title> within the <body> tag, a special easter egg built-in by the W3C will be shown', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The <title> tag is the same as the title attribute ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The <title> tag provides the page title when it is added to favorites', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The <title> tag has a very specific semantic meaning which is it should only be used for people who have a "title" e.g "President" or "Senior Java Developer" ', false);

-- Poll 211: Touch events are triggered when hitting the surface now that...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Touch events are triggered when hitting the surface now that is a fact, now what is used for this point of contact? ', 316, NULL, NULL, 'closed', 'multiple', '2023-07-13T07:28:59.811Z', '2023-07-13T07:28:59.811Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'your finger ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'your elbow ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'your ear ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'your nose ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'whatever other body parts ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a stylus ', true);

-- Poll 212: An element that allows you to create dynamic graphics and an...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('An element that allows you to create dynamic graphics and animations, what tag is this which is used for these kind if applications?', 249, NULL, NULL, 'closed', 'single', '2023-04-26T07:52:23.329Z', '2023-04-26T07:52:23.329Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<figma>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<painting>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<cloth color=“white”>\n', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<canvas>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<craftsman>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<drawingboard>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<picture>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<body>', false);

-- Poll 213: In JS, memoization is a technique often applied, in what con...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, memoization is a technique often applied, in what context is the use of memoization justified?  ', 80, NULL, NULL, 'closed', 'multiple', '2022-09-21T07:26:30.977Z', '2022-09-21T07:26:30.977Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Memoization should by default be applied on all computations to improve the expense of allocated memory when writing code', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you notice your UI reacts very slow', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Memoization is actually the process of storing values in variables which means values are “remembered” or to stay with the term: “memorized/memoized”; Values are “memorized” in computer memory, so basically it’s always applied without realizing it', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Memoization is not dedicated to JS only: it’s a “human cognition technique” researched and encouraged by neuroscientists and often used by programmers when they want to study something new concepts or a new programming language efficiently', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When memory leaks occur memoization is used to fix the memory leaks ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you have heavy computations doing the same thing ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You don’t manually: When storing variables in JS, your allocating memory, which is what “memoization” is', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When your function is pure ', true);

-- Poll 214: Background-clip can be used to create cool gradient text, bu...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Background-clip can be used to create cool gradient text, but what should you then be aware of to prevent you being perplexed? ', 306, NULL, NULL, 'closed', 'single', '2023-09-05T08:15:28.335Z', '2023-09-05T08:15:28.335Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That the text automatically comes with an animated gradient, which is not what you always need', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That it is not supported in the latest Chrome ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That you can''t copy the text ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That the text is reversed', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That an attacker might use the gradient text for CSRF attacks ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That when you select the text, the text goes missing ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That the text is split up in separate divs per letter ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That the gradient text can only have a few basic colors: red, green, blue and orange, pink, yellow', false);

-- Poll 215: In CSS, UI controls are mostly hard to style, now what is th...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, UI controls are mostly hard to style, now what is the name of the CSS property that eases styling UI controls and make you smile? ', 85, NULL, NULL, 'closed', 'single', '2022-09-26T07:49:09.610Z', '2022-09-26T07:49:09.610Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'accent-color', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'form-color', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'background-color', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'color', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CSS variables', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a SASS mixin', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ui-color', false);

-- Poll 216: In React, when working with arrays or iterators the key prop...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In React, when working with arrays or iterators the key prop is required, but how does it help React to manage effects that are undesired?', 28, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Key prop helps React identify which items have changed, are added, or are removed, which increases performance', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Adding the key prop only helps React if you have ordered lists, not when the order of your array data doesn’t matter', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Keys are not needed in React if you sort arrays correctly beforehand so React doesn’t have to worry about identifying items', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Keys are not needed in React if you have an array of objects which contains an ID property', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Key prop should be used with Object.keys() so it will generate keys', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is only required when you use a mix of types in your array or iterable (number, string, boolean). When you have items of the same type (e.g: string, string, string) you can omit the key prop', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The key prop is an operator that takes an component and produces a string or numeric literal union of its keys.', false);

-- Poll 217: When we want to blend (background-)color(s) in our browser s...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('When we want to blend (background-)color(s) in our browser screen, which CSS property has to be seen?', 301, NULL, NULL, 'closed', 'single', '2023-06-26T07:59:11.227Z', '2023-06-26T07:59:11.227Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'background: blend-gradient()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'background-color: blend-gradient()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'blend-background: full', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'color-blend-mode: mixed', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'mix-blend-mode: difference', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'background-color-blend: invert', false);

-- Poll 218: For the 50th time now it’s hard to come up with a question r...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('For the 50th time now it’s hard to come up with a question rhyme, but what in JS is a statement that halts execution of code and allows to inspect it in the browser at runtime?', 61, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'inspect', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'return', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'break', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'trace', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'console.log', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'debugger', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'throw new error', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'eval', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By installing the debug.js package', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s not a JS feature but something default since Chrome 47', false);

-- Poll 219: In CSS, now don’t get confused, but to create space between ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, now don’t get confused, but to create space between elements what property is used?', 107, NULL, NULL, 'closed', 'single', '2022-10-28T07:50:24.914Z', '2022-10-28T07:50:24.914Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'margin', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'padding', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'flex', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'grid', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'gap', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'border', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'margin-block-start', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'padding-inline-start', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'word-spacing', false);

-- Poll 220: Making these polls requires subjects to be perused, which HT...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Making these polls requires subjects to be perused, which HTML tags are outdated and should not be used?', 177, NULL, NULL, 'closed', 'multiple', '2023-04-03T08:10:27.364Z', '2023-04-03T08:10:27.364Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<b>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<applet>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<acronym>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<abbr>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<strike>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<kbd>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<p>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<hr>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<font>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<center>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<h6>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<marquee>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<main>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<fieldset>', false);

-- Poll 221: These answers below I will give, which of these answers will...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('These answers below I will give, which of these answers will not make a hidden div?\n\n', 227, NULL, NULL, 'closed', 'single', '2023-02-23T09:00:41.348Z', '2023-02-23T09:00:41.348Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'div {\n  visibility: hidden;\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'div {\n  opacity: 0;\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'div {\n  appearance: off;\n}', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<div hidden>I''m still visible tho</div>', false);

-- Poll 222: In CSS, this poll you can answer with ease, what differs con...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, this poll you can answer with ease, what differs container queries from media queries?', 161, NULL, NULL, 'closed', 'single', '2022-11-30T09:02:04.954Z', '2022-11-30T09:02:04.954Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Container queries are a way to retrieve server-side data in CSS; media queries are limited to client-side data', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Container queries enables scope isolation CSS by container; media queries enables scope isolation CSS by page', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Container queries allows you to change the layout based on the size of your container; media queries allows to change the layout based on the size of the viewport', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Container queries removes the need of adding "container divs" for styling; With media queries you still need those', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Container queries support types with TypeScript, media queries do not', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Container queries have a set of built-in sizes of popular screen sizes; with media queries you have to come up with screen sizes yourself', false);

-- Poll 223: Voting on answers may sometimes be a gamble, what answer is ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Voting on answers may sometimes be a gamble, what answer is closest to what is happening in this code example?', 310, 'div {\n  width: min(100%, 800px);\n}', NULL, 'closed', 'single', '2023-08-14T07:35:05.742Z', '2023-08-14T07:35:05.742Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The width will be randomly selected on every page refresh and is either 100% or 800px', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The width will be automatically tied to your breakpoints; When declaring more breakpoints, you can add more arguments', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The width will always get the lowest value under every circumstance', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'If the available space is below 800px, it matches 100%. If it''s more than 800px, it matches 800px. This is basically a shorter version of this.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It removes the need of using breakpoints', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It calculates the distance between 100% and 800px and returns the result and puts it in the width property', false);

-- Poll 224: See the following code on the screen, what should the output...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, what should the output have been? ', 400, 'type Letters = "a" | "b" | "c";\n\ntype Generic<T> = T extends "c" ? never : T;\n\ntype Result = Generic<Letters>;', NULL, 'closed', 'single', '2024-01-11T09:34:12.457Z', '2024-01-11T09:34:12.457Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"a" | "b" | "c"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'string', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'never', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'any ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"b" | "c"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"a" | "b"', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"x" | "y" | "z"', false);

-- Poll 225: A CSS Challenge it might become so remembering this might re...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('A CSS Challenge it might become so remembering this might reward, what is the correct answer for creating a checkersboard? ', 133, NULL, NULL, 'closed', 'single', '2023-02-16T08:45:01.952Z', '2023-02-16T08:45:01.952Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'This can only be done in JS', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'background: repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%)  50% / 20px 20px', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With SASS, you can import popular background patterns like a checkersboard: @use "patterns/checkersboard"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.checkersboard {\n  margin: 4px;\n  height: 32px;\n  box-sizing: border-box;\n  border: 2px solid lightgray;\n  border-radius: 4px;\n  display: flex;\n  flex-direction: row;\n  flex: 1 1 0;\n  align-items: center;\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.checker-box-black {\n   display: block:\n   background-color: black;\n}\n\n.checker-box-white {\n   display: block:\n   background-color: white;\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.board {\n   widows: 5\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.checkersboard { \n    filter: "checkersboard" \n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.checkersboard { \n    background: patterns("checkersboard")\n}', false);

-- Poll 226: Mamma mia! Will you let me know? Why do we give the swedish ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Mamma mia! Will you let me know? Why do we give the swedish timezone a go?', 361, NULL, NULL, 'closed', 'single', '2023-12-01T11:04:02.061Z', '2023-12-01T11:04:02.061Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The timezone is almost UTC so it is ''good enough'' in most cases', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The timezone: "sv-SE" can be used in things like "toLocaleString" to display a date/time as ISO order, since sweden uses that ISO as date format', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The date in sweden has better support for leap years than other timezones', false);

-- Poll 227: What happens when you try to copy and paste an emoji family ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('What happens when you try to copy and paste an emoji family with a string size of 11 into an input with maxLength=10?', 248, '<p>👨‍👨‍👧‍👦</p>\n<input maxLength=10/>', NULL, 'closed', 'single', '2023-06-13T08:05:28.408Z', '2023-06-13T08:05:28.408Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can''t add it to the input field', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'One of the children will disappear', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will be added as Unicode', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will be added without issues because a family shouldn''t be split apart', false);

-- Poll 228: Part 3: While writing HTML, semantic tags are to keep in min...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Part 3: While writing HTML, semantic tags are to keep in mind, which tags you see listed here are false and not defined? ', 54, NULL, NULL, 'closed', 'multiple', '2022-10-18T07:37:06.448Z', '2022-10-18T07:37:06.448Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<h7>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<h6>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<legend>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<option>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<flex>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<grid>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<name>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<hr>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<li>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<meter>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<fortissimo>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<pre>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<textarea>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<cookie>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<photo>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<serverside>', true);

-- Poll 229: These polls are in galore, what does HTML stand for?...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('These polls are in galore, what does HTML stand for?', 364, NULL, NULL, 'closed', 'single', '2023-09-28T07:46:36.416Z', '2023-09-28T07:46:36.416Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s not abbreviated; it''s a special sequence term like "qwerty" keyboard or "asdf" manager', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Happy Turtles Making Lasagna ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s based on the first 4 elements HTML started with: <head>, <table>, <main> and <link>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Hyper Taxing Modularization Logic', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Hypertext Markup Language ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Heading Text Markup Language', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Hyper Text Markup Leverages', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Hypertext Preprocessor', false);

-- Poll 230: In CSS, animations can be used to engage people on your site...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, animations can be used to engage people on your site, but which media query controls if the user wants the animations you write?', 23, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'prefers-reduced-motion', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'monochrome', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'display mode', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'animation', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'allow-animation', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'prefers-boring-website', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Not possible with CSS, this requires tools like Modernizr', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is not done with media queries, but in another CSS way', false);

-- Poll 231: For CSS devs this might be a no-brainer, but what flex prope...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('For CSS devs this might be a no-brainer, but what flex property makes sure items are forced on multiple lines when they don’t fit their container?', 59, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'flex-contain', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'contain', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'currently not possible with flexbox but will come with CSS4', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'container-wrap', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'overflow-wrap', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'flex-burrito', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'apply a class “wrapper” to a html element will do it ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'flex-shrink', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'flex-grow', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'flex', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'flex-wrap', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'flex-basis', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'max-width', false);

-- Poll 232: In JS, preventDefault is used to prevent default user-agent ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, preventDefault is used to prevent default user-agent actions, but when having preventDefault and clicking on <a> do you know what happens?', 46, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It blocks the link from following the url', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will create soft links (routing without page refresh)  instead of the default hard links (routing with page refresh)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will disable a link tag and make it unclickable. Often used when you want to prevent the user from going to the next step when user data is required and still misses', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will open a link in a new tab', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will open a link in the same tab', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will change from behaviour from an <a> to what a <button> does', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will force the user to double click the link', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will prevent that the current link won’t be taken into account for SEO', false);

-- Poll 233: In JS, we have a new thing called nullish coalescing, what i...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, we have a new thing called nullish coalescing, what is the effect of this thing?', 41, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'it checks whether a variable is null or undefined and returns the truthy value ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'it checks whether a variable is falsey and returns the truthy value', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'it sets the variable to a non-null value', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'it checks whether a variable is falsey, and if so returns the the falsey value', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It nullifies values, which means for a string that holds “this is a string” it returns “”, for numbers that holds 34 it returns the number 0, for booleans which hold a true value, it returns false', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With nullish coalescing it is possible to assign custom values to null, like: null = “null is now a string”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Nullish coalescing is a technique that nullifies the JavaScript in your app, which gives you the ability to overwrite JS keywords like “class”, “static”, “function” and add keywords yourself', false);

-- Poll 234: Some of these polls didn’t make the cut, async functions wil...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Some of these polls didn’t make the cut, async functions will return what?', 288, NULL, NULL, 'closed', 'single', '2023-06-20T07:45:42.671Z', '2023-06-20T07:45:42.671Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A Future', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'An EventLoop', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A Timeout', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A word of honour', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A Pledge', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A Vow', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A Promise', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Void', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Async', false);

-- Poll 235: In CSS, see this example you must have seen, what pseudo cla...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, see this example you must have seen, what pseudo class can be used to produce the result on the screen?', 149, NULL, 'https://codesandbox.io/embed/festive-pascal-gb0ekj?fontsize=14&hidenavigation=1&theme=dark&view=preview', 'closed', 'single', '2022-11-04T09:01:09.896Z', '2022-11-04T09:01:09.896Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':first-child, :second-child, :third-child, :fourth-child', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'This can only be done in JavaScript', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':nth-child(-n + 4)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':nth-child(n + 4)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Will be possible with CSS4 pseudo module', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':has:(:content:1), :has:(:content:2), :has:(:content:3), :has:(:content:4)', false);

-- Poll 236: In HTML, `<meta>` tags are useful, but which answers listed ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, `<meta>` tags are useful, but which answers listed below are untruthful? ', 2, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Meta tags are a way to enhance information about a website', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Meta tags are added in the footer', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Meta tags are used to control “viewport settings” for example', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Some meta tags have control of the users visible area of a page', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Meta tags provide information for search engines', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Meta tags are used to integrate metaverse in websites/apps, hence “meta” ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Meta tags are rendered and visible to the end user. To hide them, CSS is often used (display:none). Nowadays CSS resets also takes care of that.', true);

-- Poll 237: Part 1: CSS selectors are something we use every day, which ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Part 1: CSS selectors are something we use every day, which types of selectors exist do you say?', 356, NULL, NULL, 'closed', 'multiple', '2024-02-06T10:01:25.545Z', '2024-02-06T10:01:25.545Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Parent selector', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Universal selector', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Element type selector', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Element class selector', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Child combinator', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Oldest sibling combinator', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Product selector ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Descendant combinator', true);

-- Poll 238: Working with fonts seems to be a market goldmine, what optio...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Working with fonts seems to be a market goldmine, what options would you consider factually right this time?', 428, NULL, NULL, 'closed', 'multiple', '2024-05-08T08:19:12.296Z', '2024-05-08T08:19:12.296Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.woff2 fonts are 30% smaller than .woff fonts', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.woff2 is an abbreviation of World of Food Foodcourt 2', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.woff2 files lack compression and don''t perform well', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.woff2 is supported by all modern browsers', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.woff2 is the most modern way of using fonts', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.woff2 is lacking special characters in every font-family as they don''t support it ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.woff2 is a company that supports better web fonts', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.woff2 is an abbreviation of Web of Font Faces', false);

-- Poll 239: Commits from another branch we sometimes want to bring, what...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Commits from another branch we sometimes want to bring, what git command does this kind of thing? ', 255, 'Needs revision: Git merge does basically the same ', NULL, 'closed', 'single', '2023-03-14T08:24:29.468Z', '2023-03-14T08:24:29.468Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'git');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git merge', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git commit —get <hash>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git fruit-pick <hash>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git pick <hash>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git omit <[hash, hash ...etc]>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git rewrite <hash>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git cherry-pick <hash>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git mv commit <hash> ', false);

-- Poll 240: Some code we find might seem like a code smell, this isn't, ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Some code we find might seem like a code smell, this isn''t, as how can we run promises in parallel?', 432, NULL, NULL, 'closed', 'single', '2024-05-21T08:50:41.301Z', '2024-05-21T08:50:41.301Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Promise.parallel()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Promise.runAll()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Promise.then().then().then()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Promise.allSettled()', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Promise.concurrent()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Promise.prototype.all', false);

-- Poll 241: These polls I have a lot from waiting in my stash, this one ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('These polls I have a lot from waiting in my stash, this one asking about why accessing properties or calling methods on primitives work and doesn’t make your code crash?', 213, NULL, NULL, 'closed', 'single', '2023-09-27T07:52:23.473Z', '2023-09-27T07:52:23.473Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because JavaScript is a higher level language compared to C (where JavaScript is based on), which means C technology is actually running in certain operations like this', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because JavaScript applies it’s JIT Compiler (just-in-time) on all methods, variables, properties and functions and adds various methods to them, and therefore also foresees errors "just-in-time" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because these methods and properties on primitives come from jquery, which is running at the core of JavaScript applying properties and methods on primitive types', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because it’s using a method called autoboxing: it transforms primitives to an object with the corresponding methods/properties', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s something modern browsers take care of in devtools to make things easier; in a node or runtime application primitive types don’t have access to methods and properties ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because JavaScript doesn’t have primitives', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because the interpreter ignores these methods, which means undefined is returned ', false);

-- Poll 242: This poll is hard but can make you wiser, the following code...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('This poll is hard but can make you wiser, the following code is shown, are you able to decipher? ', 272, 'setTimeout(() => console.log(1), 0);\n\nconsole.log(2);\n\nnew Promise(res => {\n  console.log(3)\n  res();\n}).then(() => console.log(4));\n\nconsole.log(5);', NULL, 'closed', 'single', '2023-12-04T09:52:42.152Z', '2023-12-04T09:52:42.152Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '1, 2, 3, 4, 5', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '5, 4, 3, 2, 1 ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '1, 3, 2, 4, 5 ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '2, undefined, 5', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '2, 5', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '2, 3, 5, 4, 1', true);

-- Poll 243: Bugs occur all of the sudden without you wanting to, can you...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Bugs occur all of the sudden without you wanting to, can you find it after a thorough code review? ', 391, '\n.element {\n --stepCircleSize: 30px;\n --circleOffset: calc(var(--stepCircleSize / 2));\n   top: var(--circleOffset); \n}', NULL, 'closed', 'single', '2023-12-13T09:06:19.139Z', '2023-12-13T09:06:19.139Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'There is no bug, the code works fine!', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'calc is not supported in native CSS, you need a preprocessor for that ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can''t use calc with units, they need to be unitless', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"/ 2" is positioned incorrectly, it should be calc(var(--stepCircleSize) / 2);', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'calc can''t be used with var() ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'calc can''t be used with pixel values', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '--stepCircleSize is undefined somehow (note somehow, which is mostly what we developers say when something is broken beyond our knowlegde) ', false);

-- Poll 244: Stop everything in it’s tracks, it’s time tell some facts ab...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Stop everything in it’s tracks, it’s time tell some facts about rest and spread syntax!', 228, NULL, NULL, 'closed', 'multiple', '2023-03-02T13:05:22.987Z', '2023-03-02T13:05:22.987Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Rest can be used to “gather” remaining parameters', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Spread and rest do exactly the same; they are just synonyms', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Spread is used on arrays, rest is specifically for objects', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The spread operator uses .push() and .splice() under the hood', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The spread operator goes multi level deep when copying', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can spread objects, arrays and strings', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When having a function argument, the rest operator can have any position in the argument list (first, second or last, doesn’t matter)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Rest and spread operators can only be used with immutable functions such as .map(), .filter() and .reduce()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The rest operator is typically used for variadic functions', true);

-- Poll 245: See the following code on the screen, what should the output...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, what should the output have been? ', 291, '"+" + 1 + 1', NULL, 'closed', 'single', '2023-06-30T08:38:08.868Z', '2023-06-30T08:38:08.868Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"+2": It firsts counts the sum, and then concatenates the + and returns it as string', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"+1":It first tries "++1", which returns 0 as string', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '3: because 1 + 1 and ++ operator and returns as number', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"+11": because + operator works from left to right and it encounters a string and a number so type coercion happens', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will return a syntax error', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"11": It will concatenate the string and omit "+" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will return NaN simply', false);

-- Poll 246: Alot of polls I have already shared, what is the term used f...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Alot of polls I have already shared, what is the term used for when a variable or function is used before it''s declared?', 267, NULL, NULL, 'closed', 'single', '2023-03-23T08:32:37.649Z', '2023-03-23T08:32:37.649Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Bubbling ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Capturing', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Hoisting', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Undeclaring ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Call site ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Global scope', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Closure ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Currying', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'IIFE', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Event listener', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Initializer', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'constructor', false);

-- Poll 247: With the wondrous knowledge of ChatGPT, whose generated ques...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('With the wondrous knowledge of ChatGPT, whose generated question I will promote, what is the output of the following code?', 217, 'const obj1 = { a: 1 };\nconst obj2 = { b: 2 };\nconst obj3 = { c: 3 };\n\nconst newObj = Object.assign({}, obj1, obj2, obj3);\n\nobj1.a = 10;\nconsole.log(newObj.a);\n', NULL, 'closed', 'single', '2023-03-06T08:25:43.451Z', '2023-03-06T08:25:43.451Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '1', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '10', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'undefined', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'error', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[object Object]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '3', false);

-- Poll 248: A code example for you to peek, which of the answers is the ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('A code example for you to peek, which of the answers is the right one you seek?', 155, '<html>\n  <head>\n    <style>\n      .highlight {\n        background-color: yellow;\n      }\n    </style>\n    <script>\n      const highlightButton = () => {\n        document.querySelector(".highlight").classList.toggle("highlight");\n      };\n    </script>\n    <title>Toggle class</title>\n  </head>\n  <body>\n    <button class="highlight" onClick="javascript:highlightButton();">\n      Click me!\n    </button>\n  </body>\n</html>\n', NULL, 'closed', 'single', '2022-11-17T11:24:29.718Z', '2022-11-17T11:24:29.718Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A grey button will be shown. The button will become yellow when clicking and stays yellow when clicking again.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A yellow button will be shown. The button will become grey when clicking and stays grey when clicking again.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A yellow button will be shown. The button will become grey when clicking and yellow when clicking again.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A yellow button will be shown. The button will stay yellow when clicking and grey when clicking again.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A grey button will be shown. The button will become yellow when clicking and grey when clicking again.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A yellow button will be shown. The button will remain yellow when clicking.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A grey button will be shown. The button will remain grey when clicking.', false);

-- Poll 249: In CSS, the float property knew glory for a long time, altho...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, the float property knew glory for a long time, although barely useful now, in what situation is it’s use not a crime?', 16, '-', NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you want to achieve complex responsive layouts ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you want to wrap text around elements (an image)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you users use Edge, because it does not yet support flex / grid', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you want to enforce a stacking context', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you want to enforce to take out an element of the document flow to place it on top of an element', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is used in combination with anchor tags, which normally scrolls to a place like an anchor, but the float adds a “smooth” and “floaty” experience to it', false);

-- Poll 250: With regular expressions, many "if" conditions can be past t...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('With regular expressions, many "if" conditions can be past tense.\nBut regexp can sometimes be a tough Rock!\nWhich of the following is correct? The right one to select the last word from any sentence.\nAnd use the words in this example text Block.', 137, 'Correct search result array: ["tense", "Rock", "correct", "sentence", "Block"]', NULL, 'closed', 'single', '2023-04-24T07:27:52.687Z', '2023-04-24T07:27:52.687Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '/\b\w+(?=[.?!]\s)/gm', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '/\w*?\b\s/gm', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '/\s[a-z]{*}.?!/gmi', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '/\b\w*\b\.\?!/gm', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '/^\w*?$/gm', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '/\s*\w*?[.?!]/gm', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '/(?<=\s)\w*?(?=.$)/gm', false);

-- Poll 251: Some more knowledge here I'd like to share, text-stroke and ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Some more knowledge here I''d like to share, text-stroke and it''s vendor declaration, why would you need the pair?', 381, '-webkit-text-stroke: 4rem #ff09123;\ntext-stroke: 4rem #ff09123;', NULL, 'closed', 'single', '2023-11-08T10:46:30.882Z', '2023-11-08T10:46:30.882Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s because you can only use a limited amount of set properties. In this case hex codes and rems are not supported by text-stroke, but they are hwhen you use vendor prefixes', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s to create a double text-stroke effect ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s to confirm to the browser that you want to use the text-stroke property ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s to maximize compatibility across browsers ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s to aid the W3C track down the usage of new properties so they know which property should be prioritised, based on popularity usage', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s not needed as these properties get automatically prefixed in browsers nowadays ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s not needed because all properties are all fully supported in browsers. Vendor prefixing was in a time when browser enginges were very unstable and different from each other ', false);

-- Poll 252: In JS, errors will annoy you to the bone, what type of error...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, errors will annoy you to the bone, what type of error from the following code will be thrown? ', 73, 'callFunction());', NULL, 'closed', 'multiple', '2023-10-09T07:44:11.920Z', '2023-10-09T07:44:11.920Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Function error', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'SyntaxError', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'TypeError', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'UnexpectedError', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CallbackError', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'undefined', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'null', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'RangeError', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'UriError', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ReferenceError', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'No error, since JavaScript is a forgiving language', false);

-- Poll 253: In CSS, the “*” selector does exist, what effects of this se...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, the “*” selector does exist, what effects of this selector can you list? ', 38, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It selects all elements on the top level of the page ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It selects all elements except elements with id’s and classes ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It selects all elements on the page', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It doesn’t hold a specificity value ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It selects all elements except elements with id’s and classes ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It enables CSS debugging by drawing borders around every element when putting “*” in your CSS ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It selects a random element', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a specific way in CSS to style password input: a single “*” selector determines how a single character might look like, but you can also style multiple characters by selecting “*:nth-child(n)” for example. ', false);

-- Poll 254: In HTML, the <article> should be used tag for certain intent...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, the <article> should be used tag for certain intents, do you know what it represents?', 178, NULL, NULL, 'closed', 'multiple', '2023-06-15T08:11:43.490Z', '2023-06-15T08:11:43.490Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A forum post', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A blog entry', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A sidebar with filters', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A piece of text that atleast contains 80 characters', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you have a dutch webshop and you want to sell your items as "artikelen"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<article> should be used only when a text is written by a professional editor and is considered an "article" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Every text element should be a wrapped in an <article>', false);

-- Poll 255: Among it’s array elements this method will return a boolean ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Among it’s array elements this method will return a boolean when the element is found, as what array method does this sound?', 198, NULL, NULL, 'closed', 'single', '2023-08-29T07:45:14.225Z', '2023-08-29T07:45:14.225Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'find', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'map', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'reduce', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'includes', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'findIndex', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'at', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'findElement', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'querySelector', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'mapBoolean', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'haystack', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'findBoolean', false);

-- Poll 256: These polls you don't want to miss, going to your previous b...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('These polls you don''t want to miss, going to your previous branch, how would you do this? ', 256, NULL, NULL, 'closed', 'multiple', '2023-08-02T08:23:02.663Z', '2023-08-02T08:23:02.663Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'git');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git prev', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git reset --hard ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git start ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git branch -P ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git switch - ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git branch --previous ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can''t do that directly, you need to use git checkout <branchname> ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git checkout -P ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git checkout - ', true);

-- Poll 257: Overloading is a magic spell, what is a format to define it ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Overloading is a magic spell, what is a format to define it well?', 184, NULL, NULL, 'closed', 'single', '2022-12-09T08:52:32.885Z', '2022-12-09T08:52:32.885Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type PaddedBox = \n  (padding: number) => BoxPadding |\n  (vertical: number, horizontal: number) => BoxPadding;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type PaddedBox = \n  ((padding: number) => BoxPadding) |\n  ((vertical: number, horizontal: number) => BoxPadding);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type PaddedBox = \n  ((padding: number) => BoxPadding) &\n  ((vertical: number, horizontal: number) => BoxPadding);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type PaddedBox = {\n  (padding: number): BoxPadding;\n  (vertical: number, horizontal: number): BoxPadding;\n};', true);

-- Poll 258: Today I present you with the Javascript Promise, can you say...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Today I present you with the Javascript Promise, can you say what the output of the "console.log(value)" statement is?', 347, 'const promise1 = new Promise ((resolve) => \n  setTimeout(() => resolve("one"), 1000)\n);\n\nconst promise2 = new Promise ((resolve) => \n  setTimeout(() => resolve("two"), 500)\n);\n\nPromise.race ([promise1, promise2])\n  .then((value) => {\n    console.log(value); // What is the output of this console.log()?\n  })\n  .catch((error) => {\n    console.error(error);\n  })', NULL, 'closed', 'single', '2023-10-13T07:53:50.377Z', '2023-10-13T07:53:50.377Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'We can''t determine the output because it is a race, you never know which Promise will win.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is always "one" because number one always wins in a race.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is always "one" because that Promise was defined earlier so the setTimeout() will start earlier than the one for promise2.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is always "two" because promise2 resolves first because of the shorter setTimeout() of 500.', true);

-- Poll 259: Some codebases might make you screech, a thousand elements o...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Some codebases might make you screech, a thousand elements on the screen, how do you efficiently handle events for each? ', 369, NULL, NULL, 'closed', 'single', '2023-11-01T08:23:48.312Z', '2023-11-01T08:23:48.312Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'elements.listenAll(click => () => { // rest of code } ) ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'elements.onReceiveBigEvent(() => { // rest of code  } )', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using event delegation: adding an event listener to the parent of those thousand elements', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'elements.addEventListener((event) => {\n    if (event.type === "lazy") {\n        // code\n    }\n\n}, { lazy: true })', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Just looping over each element and adding event listeners is fine: JavaScript can handle event listeners concurrently and while the callbacks are async, JavaScript can handle millions of event listeners at once\n', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using the third parameters .addEventListener("click", fn, { children: true } on the elements', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'let handlerElement = document.querySelector("#handlerElement");\nelements.propagateTo(handlerElement, "click", (event) => {\n    // handle event\n});', false);

-- Poll 260: With all these polls your knowledge will be broader, seeing ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('With all these polls your knowledge will be broader, seeing this code, what is the right execution order?', 396, 'reverse(appendWithLastname(getResult(uppercase(getName({ name: ''Marciano'' })))))', NULL, 'closed', 'single', '2023-12-18T09:33:31.382Z', '2023-12-18T09:33:31.382Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Order of execution will start at the outermost function and will work it''s way inward', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Order of execution will run parallel', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"getResult" will always run last, as this is a special keyword function in JavaScript to show the result of data transformations like this ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Order of execution will be executed in a "grid" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Order of execution will start at the innermost function and work it''s way out', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Order of execution will starts in "reverse" order ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Order of execution happens horizontally ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Order of execution will start at the center and move it''s way outward', false);

-- Poll 261: In React, markup and JS is what you apply, what is the name ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In React, markup and JS is what you apply, what is the name of the syntax that renders UI?', 86, NULL, NULL, 'closed', 'single', '2022-09-12T08:08:02.474Z', '2022-09-12T08:08:02.474Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'tsx', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'HTML', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'elements', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'components', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'fragments', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'synthetic HTML', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'strings', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'XML', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'jQuery', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'jsx', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Virtual DOM elements', false);

-- Poll 262: In HTML, see the code example below and test your wit, what ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, see the code example below and test your wit, what semantic tags would be best fit? ', 180, NULL, 'https://codesandbox.io/embed/gracious-field-3z49er?fontsize=14&hidenavigation=1&theme=dark&view=preview', 'closed', 'single', '2023-01-10T08:31:56.306Z', '2023-01-10T08:31:56.306Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<removed> and <inserted>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<ins> and <del>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Just spans, semantic tags are missing here', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<p> tags', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<red> and <green> ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<add> and <min> ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<style> tags', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<mario> and <luigi>', false);

-- Poll 263: In TypeScript, never is a type, but when do functions return...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In TypeScript, never is a type, but when do functions return the never type, would you describe? ', 30, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'In a function without the word return, because it never returns', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'In a function with an unending loop ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'In a function that returns falsy values', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'In a function that crashes halfway your app at runtime', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'In a function that has a break statement: it breaks and never returns', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'In a function that has an empty body', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Typescript never returns a never unless you explicitly say so', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'In a function that is never written', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'In a promise function, because you can never be sure what it returns', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'In a function that throws an error ', true);

-- Poll 264: Each of these polls undergo a process to have them refined, ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Each of these polls undergo a process to have them refined, how in TypeScript is a "union type" defined?', 330, NULL, NULL, 'closed', 'single', '2023-08-23T07:40:52.902Z', '2023-08-23T07:40:52.902Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With "&" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With 🧅', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With "&&" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With "-" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With "_" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With "|" ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With "=>" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With "|>"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With "🇪🇺"', false);

-- Poll 265: In React, state management can be hard I admit, when compone...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In React, state management can be hard I admit, when component B and C require state to be in sync, what approach would be the best fit? ', 84, NULL, NULL, 'closed', 'single', '2022-09-23T07:54:06.053Z', '2022-09-23T07:54:06.053Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Redux ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Context', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Lifting state up', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'LocalStorage', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Hooks', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Firebase', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'IndexedDB', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'React-query', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useState', false);

-- Poll 266: Hello, how to FIX the issue in the code below? Let your craf...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Hello, how to FIX the issue in the code below? Let your craftsmanship show!', 408, 'let item: Record<string, string> | undefined = undefined;\n\nmyFunction(() => { item = { some: "value" }; });\n\nif (!item) return;\n\n// how to turn ''item'' into a Record<string, string> here?', NULL, 'closed', 'single', '2024-04-03T08:52:10.997Z', '2024-04-03T08:52:10.997Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'let item: any = undefined', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const itemAfter = item as unknown as Record<string, string>;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'let item = undefined as Record<string, string> | undefined', true);

-- Poll 267: Functional concepts about taking control of function executi...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Functional concepts about taking control of function execution in this poll, name these concepts that''ll help you to control?', 398, NULL, NULL, 'closed', 'multiple', '2023-12-19T09:22:38.226Z', '2023-12-19T09:22:38.226Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'composer', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'chain', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'call', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'compose', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pipe', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'curry', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'prototype', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'arrowing ', false);

-- Poll 268: Each poll contains answers that tries to fool, what answers ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Each poll contains answers that tries to fool, what answers from below are a valid JavaScript rule?\n', 344, NULL, NULL, 'needs-revision', 'multiple', '2024-03-21T09:49:35.484Z', '2024-03-21T09:49:35.484Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Strings are mutable ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'NaN is equal to NaN when compared', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'In JavaScript, null and undefined are the same and can be used interchangeably', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The "break" keyword is used to communicate to fellow programmers it should take a break from work at that moment, when encountered', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JavaScript has ChatGPT build in on the global object: "window.chatGPT("Create a button which expands a tooltip")', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JavaScript supports tuples', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Functions in JavaScript can return multiple values at once', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The maximum number of parameters a function can accept is 10 to keep JavaScript a light language ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A JavaScript function must always return a value; if no return value is specified, it throws an error.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '++"5" will be converted to a number', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JavaScript has built-in types', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JavaScript can''t edit CSS directly ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JavaScript needs to be installed on your system before it can run', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.prototype properties is a way for te W3C to quickly prototype new features among developers and collect feedback', true);

-- Poll 269: To count items matching criteria, how can reduce help in thi...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('To count items matching criteria, how can reduce help in this area?', 338, '// before\nlist.filter(test).length\n// after\nlist.reduce((n, i) => test(i) ? n + 1 : n, 0)', NULL, 'closed', 'multiple', '2024-02-21T09:00:54.678Z', '2024-02-21T09:00:54.678Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Reduce always reduces amount of CPU cycles in memory, that''s why it is called that way', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The filtered list is not used (only its length) so the new array created is a waste', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'awcktually, it could be faster still with a plain `for`, but that is way more verbose.', true);

-- Poll 270: See the following code on the screen, implemented with inter...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, implemented with interfaces, what is the "type alias" equivalent you must''ve seen? ', 311, 'interface A {\n    a: string;\n}\ninterface B {\n    b: string;\n}\ninterface Y extends A, B {\n    y: string;\n}', NULL, 'closed', 'single', '2024-04-05T09:51:21.466Z', '2024-04-05T09:51:21.466Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s the same, only with changing "interface" to "type" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s exactly the same ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'There is no equivalent. If you want intersection of types you need to define interfaces ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using intersection observer ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type A = {\n    a: number;\n};\ntype B = {\n    b: number;\n};\ntype Y = { y: string} & A & B;', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using ''as const'' after every type alias ', false);

-- Poll 271: When modals are displayed backdrops are often seen, when usi...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('When modals are displayed backdrops are often seen, when using the <dialog> element what action is required to show the backdrop on your screen?', 199, NULL, NULL, 'closed', 'multiple', '2023-12-05T08:57:55.005Z', '2023-12-05T08:57:55.005Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Calling a function called ".getBackdrop()"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will automatically show the backdrop when applying “open” attribute on the <dialog> element', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The useBackdrop() hook should be initialised ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'There is no backdrop coming with <dialog>, you have to create it yourself with custom divs', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By calling a function called ".showModal()"', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By adding a post-css plugin that support <dialog> backdrops', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Just implement <dialog> and it will work ', false);

-- Poll 272: In JS, when the output of `false === "false"` is `false` , `...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, when the output of `false === "false"` is `false` , `true === “true”` is `false`, NaN == NaN is `false`,  what will the output of `true == “true”` bring you? ', 76, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'true', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'false', true);

-- Poll 273: This is a CSS prop you might have never seen, what does the ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('This is a CSS prop you might have never seen, what does the `mso-number-format` mean?', 354, NULL, NULL, 'closed', 'single', '2023-10-05T07:48:22.139Z', '2023-10-05T07:48:22.139Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s the ''More System Oriented'' number format, to have the proper `.` or `,` decimal separators', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a Microsoft Office number format, if you put content in Excel sheets', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s the ''Mac Special OS'' number format, invented by Apple, to be ''different''', false);

-- Poll 274: WARNING! In TS, different types are offered of which there a...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('WARNING! In TS, different types are offered of which there are many, what would be a good use case to use “any”?  ', 66, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you are working on a feature or pressing bug and it needs to be shipped quickly', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you really don’t know what else type it should be so you can fallback to any(time!)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When the TypeScript Guru is not available and you are losing development speed in your 2-pointer user story', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When your “Navi” intellisense suggests “any” ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When your codebase is at a level it needs flexibility at every level', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When run-time errors are contextually more informative (depends on the project)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you’re working on simple/small applications (<1000 lines of code)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you are using TypeScript but don’t really need the types', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When the code is written in a defensive way and when comments are self-documenting, “any” should be acceptable', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you already know upfront that this code is going to be refactored or changed often', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you have tests, linters and code climate, usage of any is valid', true);

-- Poll 275: Sometimes code makes you feel like a dunce, what is the outp...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Sometimes code makes you feel like a dunce, what is the output of "count" when clicking the button once? ', 317, 'export default function App() {\n  const [count, setCount] = useState(0);\n\n  const incrementCount = () => {\n    setCount(count + 1);\n  };\n\n  return (\n    <div className="App">\n      <h1>Hello poll voter!</h1>\n      <button\n        onClick={() => {\n          incrementCount();\n          incrementCount();\n        }}\n      >\n        Click for count: {count}\n      </button>\n    </div>\n  );\n}\n', NULL, 'closed', 'single', '2023-07-19T07:57:29.672Z', '2023-07-19T07:57:29.672Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The output is 0: React auto ignores function calls that are seen as duplicate as this is a common error in development according to the React team', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The output is 1: React uses state batching to combine the calls ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The output is 2: Simply because "incrementCount" is called twice ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The output is 0: The "incrementCount" is function is never called because it is wrapped in a function ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The output is 4: On the first render "incrementCount" is called already twice and after the click it is also called twice ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The output is 0: setCount is never called', false);

-- Poll 276: A property of the following type you can pluck, what syntax ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('A property of the following type you can pluck, what syntax is used to make it work? ', 110, 'type Guild = { \n  name: string; \n  members: { \n     name: string; \n  }[],\n  activities: {\n     name: string; \n     date: Date;\n  }[],\n  leader: string;\n  startedAt: Date; \n}', NULL, 'closed', 'single', '2023-01-09T09:35:45.966Z', '2023-01-09T09:35:45.966Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Pluck<Guild>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Guild[0]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Guild["members"] ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Guild.at(0)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Guild.members', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Array.from(Guild).map(guild => guild.members) ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[...Guild][0]', false);

-- Poll 277: See the following TypeScript on your screen, what answer of ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following TypeScript on your screen, what answer of below is a fact you may have seen?', 297, 'const polls:{ [index:string] : {question: string} } = {};', NULL, 'closed', 'multiple', '2024-02-19T09:17:56.674Z', '2024-02-19T09:17:56.674Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'To index polls array, it must be called “index” like so: polls[“index”] or you will get an error', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The index type has to be a string', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Typing the index makes no sense here: The index type can be both a string and number since index types are always numbers or strings', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“index” is a default name that has to be provided and is always a number automatically', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'polls[“question”] = { question: “” } is valid', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'polls.question is valid', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'polls[“jodelait”] = { question: “” } is valid', true);

-- Poll 278: I try to keep the quality high for these polls and don't acc...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('I try to keep the quality high for these polls and don''t accept less, what is the purpose of HTTPS?', 279, NULL, NULL, 'closed', 'single', '2023-09-18T07:43:25.736Z', '2023-09-18T07:43:25.736Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'HTTPSlow: It’s a protocol to which is used to customers when their data bundle limit is reached; after that their internet will be 2 times slower depending on the provider ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'HTTPSuper: it allows for faster and data efficient connections for premium users\n', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'HTTPSecure: is a protocol for secure communication over the internet', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'HTTPSunshine: is a protocol which is powered on the power of the sun to increase environmental awareness', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'HTTPSockets: It''s a way to work with WebSockets ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'HTTPState: It''s a way to provide state to HTTP ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'HTTPScript: It''s the scripting language of the HTTP Protocol', false);

-- Poll 279: With comments in our code we can address, why would we use c...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('With comments in our code we can address, why would we use comments in our code is your guess?\n\n', 247, NULL, NULL, 'closed', 'single', '2023-06-16T07:39:02.890Z', '2023-06-16T07:39:02.890Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Code is always hard to read and doesn''t follow the English Language rules; Comments are useful to describe each piece of code to be described in valid english to enhance understanding and readability ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'To have non-coders also more involved in our codebase ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'To make the codebase more friendly for beginner coders', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'To add more boilerplate ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When the code is not enough to express why certain things are done the way it is done ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because code is always unreadable. Commenting is best practice and should always be done to make it understandable for developers, testers, PO''s and the client itself', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'To make sure your theme color scheme in your IDE matches', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s mostly done because developers can vent about pieces of code here; It''s a place to have hot debates about implementations. Files are often to be seen +1000 long because of that ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Originally it''s done to keep track of refactor history: A short message with when, who and a small signature to provide information for future developers when they touch the code', false);

-- Poll 280: See the following code on the screen, what should the correc...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, what should the correct alternative shorthand have been?', 283, 'if(val === null || val === undefined) {\n    val = “poll app”\n}', NULL, 'closed', 'single', '2023-06-27T07:50:06.908Z', '2023-06-27T07:50:06.908Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'val && “poll app”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'val || “poll app”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'val // “poll app”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'switch(val) {\n  “null”: \n    val = “poll app”\n  “undefined” \n    val = “poll app”\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'val ??= “poll app”', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'when(val) is !null\n   val = “poll app”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'val ^ “poll app”', false);

-- Poll 281: In HTML, some tags play nicer when used in conjunction, whic...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, some tags play nicer when used in conjunction, which tags listed below will then better function?', 153, NULL, NULL, 'closed', 'multiple', '2023-03-01T08:33:31.452Z', '2023-03-01T08:33:31.452Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<label> and <input>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<article> and <p>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<label> and <progress> ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<meter> and <progress>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<header> and <footer>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<hr> and <h1>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<video> and <track>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<ul> and <ol>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<em> and <strong>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<map> and <area>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<fieldset> and <legend>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<select> and <option>', true);

-- Poll 282: This poll may be an easy one to get right, what's the name o...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('This poll may be an easy one to get right, what''s the name of the DOM that is supposed to be light? ', 13, NULL, NULL, 'closed', 'single', '2023-01-19T08:33:05.038Z', '2023-01-19T08:33:05.038Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Qwik DOM: React uses the latest FE technology build by Qwik', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Shadow DOM: The DOM below the normal DOM. It''s way faster and convenient for operations React performs', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Virtual DOM: a concept implemented by libraries in JavaScript on top of browser API', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'React DOM: The DOM used by React as object tree', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s just called the "DOM": The React team just uses DOM to operate ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'DOM 2.0: The React team came with an upgrade of the DOM, with corresponding facets like Synthetic Events', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Vue DOM: React relies Vue technology for this', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Sonic DOM: Inspired from the fastest Hedgehog in history ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'FB-DOM: Facebook owns React, but nobody really knows that so Mark Zuckerberg wanted to increase brand awareness ', false);

-- Poll 283: In JS, this question might be difficult, when clicking on th...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, this question might be difficult, when clicking on these buttons, what is needed to have "Button 0" and "Button 1" in your console as result?', 142, 'for (var i = 0; i < 2; i++) {\n  const button = document.createElement("button");\n  button.innerText = `Button ${i}`;\n  button.onclick = function () {\n    console.log(`Button ${i}`);\n  };\n  document.body.appendChild(button);\n}', NULL, 'closed', 'single', '2022-11-09T09:05:20.466Z', '2022-11-09T09:05:20.466Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By clicking on both buttons', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By duplicating the code ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By replacing "i < 2" with "i =< 1"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By moving "document.body.appendChild(button);" out of the for loop ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using const instead of var ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using let instead of var ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using a do-while loop', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By replacing "console.log(`Button ${i}`);" with "console.log(`Button ${i - 1}`);"', false);

-- Poll 284: See the following code on the screen, what should the output...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, what should the output of the code have been?', 388, 'const guilds = [\n    { id: "1", name: "Backend" },\n    { id: NaN, name: "Flutter" },\n    { id: undefined, name: "Frontend" },\n    { id: 4, name: "Architecture" },\n    { id: null, name: "Agile" },\n    { id: false, name: "Meme" },\n    { id: 0, name: "Eat" },\n    { id: "", name: "UI/UX" },\n]\n\nconst output = guilds.filter(guild => guild.id); \n\n// output ?', NULL, 'closed', 'single', '2024-02-20T09:24:59.130Z', '2024-02-20T09:24:59.130Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[\n    {\n        "id": "1",\n        "name": "Backend"\n    },\n    {\n        "id": 4,\n        "name": "Architecture"\n    }\n]', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[\n    {\n        "id": null,\n        "name": "Flutter"\n    },\n    {\n        "id": undefined\n        "name": "Frontend"\n    },\n    {\n        "id": null,\n        "name": "Agile"\n    },\n    {\n        "id": false,\n        "name": "Meme"\n    },\n    { "id": 0, "name": "Eat" },\n    { "id": "", "name": "UI/UX" }\n]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[\n    {\n        "id": "1",\n        "name": "Backend"\n    },\n    {\n        "id": null,\n        "name": "Flutter"\n    },\n    {\n        "id": undefined,\n        "name": "Frontend"\n    },\n    {\n        "id": 4,\n        "name": "Architecture"\n    },\n    {\n        "id": null,\n        "name": "Agile"\n    },\n    {\n        "id": false,\n        "name": "Meme"\n    },\n    { "id": 0, "name": "Eat" },\n    { "id": "", "name": "UI/UX" }\n]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'undefined ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Uncaught TypeError: Cannot read properties of undefined (reading ''filter'')', false);

-- Poll 285: In JS, with `const` assignments you communicate immutability...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, with `const` assignments you communicate immutability, now what are technical features to know about this instantly? ', 8, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const is block scoped ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const can only be declared with uppercase letters ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Even with const, arrays and objects can be reassigned because they are not primitive values', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const doesn’t have to be assigned when they are declared', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const is still not supported in the latest browsers, so you need transpiling', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can use a const variable before it’s declared', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Arrays and objects assigned with const can be updated', true);

-- Poll 286: Debugging is harder in CSS than in JS, for CSS the following...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Debugging is harder in CSS than in JS, for CSS the following code is often used, but why is outline used to debug your CSS?', 252, '* {\n  outline: 1px solid red;\n}', NULL, 'closed', 'single', '2023-06-14T08:06:14.364Z', '2023-06-14T08:06:14.364Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because outline is a special property in CSS that is only visible in development environments', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because outline is used to highlight elements when hovering over them', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because everyone uses it when you debug so why not?', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Outline is not used, it''s the border property that is used', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because it''s part of the box model ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because it is supported in all browsers', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because it will not add to the element’s computed DOM size (meaning elements will stay in their original position)', true);

-- Poll 287: The CSS var() function has two arguments to accept, what doe...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('The CSS var() function has two arguments to accept, what does sort of argument does the last argument expect?', 251, NULL, NULL, 'closed', 'single', '2023-05-02T14:45:41.508Z', '2023-05-02T14:45:41.508Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A second color for a gradient', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A fallback value when the first value is invalid', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A breakpoint so you can use CSS vars per breakpoint', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'There is no second argument', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A shortname to reference the variable when used', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A JavaScript hook to get the values if needed in JS', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A value to tell CSS to ignore styles whenever the value id undefined', false);

-- Poll 288: In CSS, "ch" is a unit that can be applied, what risk of usi...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, "ch" is a unit that can be applied, what risk of using it should not be denied? ', 157, NULL, NULL, 'closed', 'single', '2022-11-14T08:37:15.597Z', '2022-11-14T08:37:15.597Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That this unit is pretty new and not yet supported by all browsers', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Applying ch on elements is somewhat risky because it''s not used often and may confuse developers who might not understand it ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That developers above the rivers are not familiar with "ch" due to their "harde G" pronunciation', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That this unit can never guarantee the given amount of "ch", because different fonts have different widths ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That this is a deprecated unit and should not be used in favour of rems and ems', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That the effect of ch is not applicable on large screens ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When using ch, the font will automatically change to a font with equal widths', false);

-- Poll 289: CSS and regex may sound like something from another dimensio...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('CSS and regex may sound like something from another dimension, what answer will style this ".pdf" extension?', 241, '<a href="kabisa.pdf">Download</a>', NULL, 'closed', 'single', '2023-06-22T08:06:23.627Z', '2023-06-22T08:06:23.627Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[href$=".pdf"]', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.+\.pdf$', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.pdf ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '#pdf ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pdf ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[href=".pdf"]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[href="pdf"]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Lol, you serious? This is impossible in CSS ', false);

-- Poll 290: Url Query string after query string we sometimes extend, wha...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Url Query string after query string we sometimes extend, what''s the character needed for this blend?', 416, NULL, NULL, 'closed', 'single', '2024-03-28T09:08:35.309Z', '2024-03-28T09:08:35.309Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '? ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '?=', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '&', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '-', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '_', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '??', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '&&', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '🧵', false);

-- Poll 291: In React this piece of code is common and is often seen, but...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In React this piece of code is common and is often seen, but what does it mean? ', 430, 'return () => {\n   // some code \n};', NULL, 'new', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a way of showing the other developers that a feature should be implemented but isn''t implemented yet ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a special code block in React that allows developers to "program in English" within this scope ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a code block to import your components dynamically on the fly', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a way of "cleanup" after certain actions in a useEffect hook or refs', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a way of commenting or writing some documentation on your components in React', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s the default mandatory way to render JSX ', false);

-- Poll 292: In JS, newly added features do impress, now name something u...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, newly added features do impress, now name something unique about “Sets”', 42, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.856Z', '2025-11-09T18:57:41.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Sets allows you to manage returns of values as sets of a given number: Set(5) returns a set of 5 items', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Sets allows you to manage a collection of unique values in a subjectively nice way', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can store arrays and objects interchangeably and work with these datatypes with the same API', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A Set is a newly added datatype that allows you to find and return matching values in arrays more easily', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A Set is a newly added datatype that eventually will deprecate arrays, because Sets are much more performant then arrays', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A Set holds data and tries to automatically find the “matching set” based on the type of value what is put in the Set. This means for instance that when you have: new Set(“mumbo jumbo”, 655, true, “wahay”), it only returns the two strings (“mumbo jumbo”and “wahay”) because it’s a “set of strings”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Sets are a way to use new methods on arrays and objects in older browsers like IE9 and lower. Because it was harder and less performant to implement newly added methods on objects and arrays, Sets were a solution not many developers are aware of', false);

-- Poll 293: When we are stacking contexts in our view, escaping these is...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('When we are stacking contexts in our view, escaping these is what we want to do. What CSS property do we use, if the current stacking context is what we want to lose?', 293, NULL, NULL, 'closed', 'single', '2023-07-21T07:38:32.488Z', '2023-07-21T07:38:32.488Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'z-index: 9999;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'transform: translateZ(1);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'isolation: isolate;', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'align-stacking-context: auto;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The “this” context', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You need @layers for this', false);

-- Poll 294: Table elements usage have a place, do you know a case?...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Table elements usage have a place, do you know a case?', 232, NULL, NULL, 'closed', 'single', '2023-07-28T07:37:58.455Z', '2023-07-28T07:37:58.455Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'For complex responsive layouts ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'For lots of information, precise values, and data sets', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you need a grid and CSS grid is not supported in the browser', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you want to structure page layout: Everything is a little box', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you read data from an SQL table', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Tables don’t fit in web development anymore and are outdated', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you have are a CSS drawing artist and drawing a painting of a (wooden) table', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you want to draft a cool 90''s look for your website', false);

-- Poll 295: In the world of the Javascript Math object, what output from...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In the world of the Javascript Math object, what output from the following code can we expect?', 231, 'const output = Math.floor(Math.random() * 0xffffff).toString(16);\nconsole.log("Output:", output);', NULL, 'closed', 'single', '2023-05-04T08:04:59.015Z', '2023-05-04T08:04:59.015Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You get the floor number of the building on which the Math object was created in the past. ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'This is some old school Windows 3.1 Math calculation with random hexadecimal numbers, who still uses this anno 2023?', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You get a random integer of 16 numbers long.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You get a random hexadecimal number which you can use to generate a random custom color.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Google Chrome has not enough RAM accessible for this calculation, thus the browser tab will just freeze.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You get a string with just the number 16 in it.', false);

-- Poll 296: In JS, this question might not be your thing which is a grip...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, this question might not be your thing which is a gripe, what operator would you use to check if a value is a boolean type?', 109, NULL, NULL, 'closed', 'single', '2023-07-10T08:19:59.689Z', '2023-07-10T08:19:59.689Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof variable === “boolean”', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof === Boolean', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'valueof === “boolean”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'isBooleanType(variable)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s done with TypeScript', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'isBoolean(variable)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'value === “boolean”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Boolean(variable)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof === 1', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'True(variable) ', false);

-- Poll 297: In CSS, flex items can be "ordered" around with the property...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, flex items can be "ordered" around with the property "order", what concern should not be ignored? ', 128, NULL, NULL, 'closed', 'single', '2022-11-01T08:38:44.077Z', '2022-11-01T08:38:44.077Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That the order prop will affect the UX of users using assistive technology if the order of elements is important', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That the order prop is not effective on elements other than flex elements', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That the order prop is a single-threaded property which may impact performance if used ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It confuses the browser painting rules when using order which makes your page rendering slower', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The order prop is not supported in all modern browsers. It can be polyfilled but in most cases it is not worth it', false);

-- Poll 298: Copying values from arrays until copying from StackOverflow ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Copying values from arrays until copying from StackOverflow is what we do, which answers from below are valid ways to make an array copy, do you have a clue?', 192, 'const mainArray = [''one'', ''two'', ''three'', ''five'', ''four''];', NULL, 'closed', 'multiple', '2023-11-30T09:06:16.830Z', '2023-11-30T09:06:16.830Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const copy = mainArray;  ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const copy = [...mainArray];  ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const copy = [];\n\nmainArray.forEach(item => {\n  copy.push(item);\n});', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const copy = mainArray.map(item => item);', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const copy = mainArray.slice()', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const copy = mainArray.copy()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const copy = mainArray.splice()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const copy = mainArray.toString()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const copy = mainArray.clone()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const copy = Array.from(mainArray);', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const copy = JSON.parse(JSON.stringify(mainArray));\n', true);

-- Poll 299: For this question seasoned developers can take a nap, name s...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('For this question seasoned developers can take a nap, name some facts to be aware of when using .map?', 79, NULL, NULL, 'closed', 'multiple', '2023-01-31T08:13:20.422Z', '2023-01-31T08:13:20.422Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.map creates an array for each element it loops over', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.map always creates a new array as return value', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.map should always be preferred over for and forEach because .map is immutable', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.map can be used on array and array-like (e.g node lists) items', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.map is a higher order function used to transform data', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.map is a higher order function used to filter items in your array', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.map is a function google came with', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.map doesn’t run when the array is empty', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.map mutates the array you are working with', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.map returns the data type you return in your callback function e.g: when returning an object, you’ll get an object as result', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.map is not a browser standard yet, and has to be babelified', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.map and .forEach are the same', false);

-- Poll 300: In Frontend, translating user experience to the browser is a...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In Frontend, translating user experience to the browser is an important task to focus on, what is the technique called where interfaces are updated before a backend request is done? ', 67, NULL, NULL, 'closed', 'single', '2022-09-16T09:19:50.982Z', '2022-09-16T09:19:50.982Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Client-side rendering ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Server-side rendering ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Response handling ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Reactive programming ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Modern web UI ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Optimistic UI', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'React UI', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Agile UI ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Directives', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Observables', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Long polling', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Perceived performance', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'User experience enhancing', false);

-- Poll 301: It's always fun how these polls are differently interpretabl...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('It''s always fun how these polls are differently interpretable, what elements can you assign with the attribute disable? ', 320, NULL, NULL, 'closed', 'multiple', '2023-07-26T07:29:36.564Z', '2023-07-26T07:29:36.564Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<button>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<div>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<a> ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<h1>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<script>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<textarea> ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<select> ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<p>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<small>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<dd>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<body>', false);

-- Poll 302: Both examples do exactly the same would be your first reply,...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Both examples do exactly the same would be your first reply, the output of both is not the answer I seek, but which of these examples is created more efficiently and why?', 191, 'const arr = [1, 2, 3];\n\n\n// A: \nconst a = arr.reduce(\n  (acc, el, i) => ({ ...acc, [el]: i }),\n  {}\n);\n\n\n// B: \nconst b = {};\nfor (let i = 0; i < arr.length; i++) {\n  b[arr[i]] = i;\n}', NULL, 'closed', 'single', '2023-02-22T09:21:42.849Z', '2023-02-22T09:21:42.849Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s A: One of the advantages of immutable functions is also performance ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s A: Because this example has less characters than the other ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s B: Because .reduce is reducing performance, hence it''s name ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Its A: Because in example B an empty object is created and not in example A ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s A: Because the code looks cleaner ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s B: A shallow copy of an object is created each iteration, which is more expensive', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s A: .reduce function does some performance optimisations under the hood which are neglected in example B ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s A: The example in B is very intensive because the variable is reassigned each iteration which costs performance', false);

-- Poll 303: Another question about CSS units you might not have guessed,...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Another question about CSS units you might not have guessed, what answer from below describes "vmin" the best? ', 205, NULL, NULL, 'closed', 'single', '2024-04-04T15:05:44.331Z', '2024-04-04T15:05:44.331Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can set the minimum vont-size for an element ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is 1% of the viewport''s width', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is 100% of the viewport''s width', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a way to use negative values in CSS ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is exactly 54% of the viewport''s width', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a relative length unit that is equal to the smaller value of the viewport''s dimensions ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'vmin is just a made up custom property and doesn''t exist in CSS', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'vmin is 1/6th of 1 inch', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a unit which only works on mobile devices', false);

-- Poll 304: A sticky element is the newest position property of all, wha...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('A sticky element is the newest position property of all, what is reason adding the "top" property can you recall?', 237, '.stickyElement { \n  position: sticky; \n  top: 0;\n}', NULL, 'closed', 'multiple', '2023-07-07T09:24:19.733Z', '2023-07-07T09:24:19.733Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is required to make it work for all browsers; modern browser don''t need this ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is not required but you can let your team know that this code implementation is "top" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is required to define an offset point when using sticky ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is required to make it work when you have scroll interactions', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is required to make it "stick" to the top of the page', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is just required but it has no relation to anything whatsoever due to a CSs inconsistency ', false);

-- Poll 305: This is a poll that made the selection, how we can control a...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('This is a poll that made the selection, how we can control animations in the normal and reverse direction?', 257, NULL, NULL, 'closed', 'multiple', '2023-04-06T09:06:02.856Z', '2023-04-06T09:06:02.856Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'animation-direction: forwards ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'animation-direction: backwards', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'animation-direction: both', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'animation-direction: all', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'animation-direction: alternate', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'animation-direction: flex', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'animation-direction: alternate-reverse', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'animation-direction: -', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'animation-direction: rtl', false);

-- Poll 306: A PWA can function as a Native mobile app. Some things are n...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('A PWA can function as a Native mobile app. Some things are not possible (yet), what is the gap?', 345, NULL, NULL, 'closed', 'multiple', '2024-01-19T09:31:10.393Z', '2024-01-19T09:31:10.393Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t show a badge on their App', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t be placed in the apply App store', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t use fullscreen on the phone', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t work with the notches a phone has (for camera)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t show notifications', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t let the phone vibrate', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t use the addressbook', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t use the Camera', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t set an app icon', false);

-- Poll 307: Flexbox wasn't there when I was in school, to center element...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Flexbox wasn''t there when I was in school, to center elements horizontally from this code example, what is the missing rule?', 172, '.container { \n   display: flex; \n   flex-direction: column; \n}', NULL, 'closed', 'single', '2023-05-05T08:19:15.605Z', '2023-05-05T08:19:15.605Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'align-items', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'justify-content', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'flex-basis ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'flex-wrap ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'flex-center', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'flex-muscle', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'flex-float', false);

-- Poll 308: This subject you may know something about, what fact can you...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('This subject you may know something about, what fact can you tell about setTimeout?', 234, NULL, NULL, 'closed', 'single', '2023-03-21T08:16:01.718Z', '2023-03-21T08:16:01.718Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'setTimeout is used to handle when your JavaScript code is timed out due to the users lost internet connection', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'setTimeout is exactly the same as setInterval', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'setTimeout was a technique not many other programming languages where able to achieve, the reason why JavaScript gained popularity', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'setTimeout is only executed once', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'setTimeout is built on setInterval', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'setTimeout is the same as promises/async await ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'setTimeout should be used sparingly as it rerenders the whole DOM after the given amount of settings ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'setTimeout is a React hook', false);

-- Poll 309: HTTP 500 codes can be seen, can you tell what they mean? ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('HTTP 500 codes can be seen, can you tell what they mean? ', 402, NULL, NULL, 'closed', 'single', '2024-01-15T10:17:15.018Z', '2024-01-15T10:17:15.018Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means there is a problem with your internet connection', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means there is a problem with your internet provider ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means there is a server-side problem ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means your browser takes up too much CPU ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means all your passwords are leaked ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means your computer contains over 500 viruses ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means there is a client-side problem', false);

-- Poll 310: This poll idea started with me wanted knowledge winning, how...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('This poll idea started with me wanted knowledge winning, how can we add array elements to the beginning?', 270, 'const numbers = [2, 3, 4, 5]; ', NULL, 'closed', 'single', '2023-10-31T08:13:30.506Z', '2023-10-31T08:13:30.506Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'numbers.push(1);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'numbers.controlShift(1)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'numbers.shift(1);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'numbers.unshift(1);', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'push.numbers(1)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'numbers.slice(1)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'numbers.prepend(1)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'numbers.indexOf(1);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'numbers.startsWith(1)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'numbers.head(1)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'for (const i = 0; i < numbers.lengt; i++) { \n   j = i; \n   numbers[i] = 1;\n   i = j; \n \n   break;\n\n}', false);

-- Poll 311: In JS, the following value is a string, casting it to a numb...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, the following value is a string, casting it to a number value how would you do this common thing?', 189, 'const number = “1004”;', NULL, 'closed', 'single', '2023-04-05T07:51:09.175Z', '2023-04-05T07:51:09.175Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'tel:number', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'numeric()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'int number = “1004”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '-number', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '+number', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '!Number(number)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '+String(Number(String(number)))', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'aN("1004")', false);

-- Poll 312: In Web, apps can be XSS (Cross Site Scripting) tormented, wh...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In Web, apps can be XSS (Cross Site Scripting) tormented, what are things to consider to have this prevented?', 51, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.857Z', '2025-11-09T18:57:41.857Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'If you allow user input, make sure it’s limited or sanitized: In this case never allow certain special characters to be put in the database directly and be in control of the output. ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'If you want to prevent XSS, you must make sure users can’t toggle developer tools when using your app ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'XSS was a problem up until awhile ago, but modern web frameworks resolved this issue automatically', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'XSS is not a problem, if you communicate to your users that they should use your app carefully you should always trust your users ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'XSS is nothing dangerous, it’s a tool that allow developers to use scripts on many sites at once. In short, this gives the possibility to work on multiple apps/sites simultaneously', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You prevent XSS by setting the Access-Control-Allow-Origin: property', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Beware for HTML attributes with special meanings like src from <script> tag or href from <a> because this can be misused if you allow user input there', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You prevent XSS by making sure to disable JavaScript for users in their browsers', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Host your app with https, XSS then won’t have a chance', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You often see developers creating a .xss file in their project root. In there you can define rules to prevent XSS attacks', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'XSS only happens in outdated browsers, so make sure your users only access your app in modern browsers ', false);

-- Poll 313: These polls are here to train your brain, from the following...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('These polls are here to train your brain, from the following code, what does this "response" variable contain? ', 328, 'async function getPolls() {\n  const response = await fetch("http://example.com/polls.json");\n}', NULL, 'closed', 'single', '2023-09-06T08:23:42.663Z', '2023-09-06T08:23:42.663Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A response object representing the fetched response body in JSON', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A response object representing the XML response body ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A response object representing the entire HTTP response', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A response object representing a HTML DOM tree structure ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A special "fetch" response object ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A response to this poll question', false);

-- Poll 314: See the following implementation of a utility type on your s...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following implementation of a utility type on your screen, which utility type can be seen?', 403, 'type ???<K extends keyof any, T> = {\n    [P in K]: T;\n};', NULL, 'closed', 'single', '2024-01-23T09:52:22.877Z', '2024-01-23T09:52:22.877Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Generic', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Required', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Omit', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Extract ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Record', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Exclude ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Partial', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Any', false);

-- Poll 315: In JS, today this poll allows you to have another shot, what...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, today this poll allows you to have another shot, what is a way to test if numbers are odd?', 144, NULL, NULL, 'closed', 'single', '2023-01-03T08:33:52.918Z', '2023-01-03T08:33:52.918Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'if (number === 1 || number === 3 || number === 5 || number === 7 || number === 9)\n// expand according to the numbers needed', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Math.odd(number)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Number.isOdd(number)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'number % 2 === 1', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'number === "odd" ? true : false', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'if (true) return 1\nelse return 0', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '1 = "odd"; \n2 = "even"; \n3 = "odd"; \n4 = "even"; \n5 = "odd"; ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'lowestNumberToTest * Math.tan(maxNumberToTest)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Boolean(number === "odd");', false);

-- Poll 316: In HTML, there is a tag that renders when turned off in the ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, there is a tag that renders when turned off in the browser scripts are not supported, what tag am I looking for and if you answer this correctly will get you awarded? ', 68, NULL, NULL, 'closed', 'single', '2022-09-09T07:54:42.474Z', '2022-09-09T07:54:42.474Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<nojavascript>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can do it by adding the classname “.no-js” ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CSS has a property for it called “script” which takes values “no-script” and “apply”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<script disabled>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<script no=”yes”> ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<script yes=”no”> ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<script type=”text”> ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<noscript>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With a condition: <script> if (window.user.javascript === false) </script> ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That’s not possible', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s possible with a special React component <NoScript />', false);

-- Poll 317: In JS, `some()` is a method provided, can you explain what i...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, `some()` is a method provided, can you explain what it does when applied?', 105, NULL, NULL, 'closed', 'single', '2022-10-28T07:53:52.569Z', '2022-10-28T07:53:52.569Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It picks “some” elements meeting the  condition you provide', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'As soon as the method returns true, it will stop checking elements that come after', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a method that sometimes (randomly) returns false, and sometimes true', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It executes a callback function sometimes: only when it meets the condition ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It tests all elements in the array and only returns true if all elements pass', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a higher order function based on Math.random() and gives you "some" result', false);

-- Poll 318: Going into super geek mode, what are benefits of a function ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Going into super geek mode, what are benefits of a function overload?', 183, NULL, NULL, 'closed', 'multiple', '2023-01-18T08:31:54.293Z', '2023-01-18T08:31:54.293Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can override a `const` function implementation that wouldn''t otherwise be possible', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can provide multiple function signatures for the same implementation improving documentation', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You will only have a single implementation of a function, but multiple types', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Overloading is like inheritance, you can extend on a base implementation', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Overloading makes sure your functions are loaded first when JS code is parsed', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Overloading is not a benefit, it''s a term used when the TypeScript compiler is out of memory due to overload', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Overload makes sure your code runs faster, above the manufacturer''s specifications. It''s a risk you should consider for your users visiting your app because it might blowup their hardware', false);

-- Poll 319: See the following JavaScript code on your screen, if ran in ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following JavaScript code on your screen, if ran in the browser, what should the output have been?', 15, 'const multiply = [1, 2, 3, 4, 5, 6, 7].forEach(item => item * 2); \nconsole.log(multiply);', NULL, 'closed', 'single', '2025-11-09T18:57:41.857Z', '2025-11-09T18:57:41.857Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[2, 4, 6, 8, 10, 12, 14]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Uncaught TypeError: Cannot read properties of undefined', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[1, 2, 3, 4, 5, 6, 7]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'null', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '["2", "4", "6", "8", "10", "12", "14"]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'undefined', false);

-- Poll 320: Placing your logic outside of React, what are the benefits o...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Placing your logic outside of React, what are the benefits of this act?', 343, NULL, NULL, 'closed', 'multiple', '2023-12-15T08:56:45.732Z', '2023-12-15T08:56:45.732Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It makes your React code smaller and therefor faster to load', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It allows reuse of logic in backends, or other UI''s (like a CLI)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It makes it easier to reason about business logic without UI complexities', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a bad practice, by placing it elsewhere you increase the distance between UI and logic, and that makes the application slow', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It makes unit testing easier since you omit the browser specific parts', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It allows grouping in folders of topics, making it easier to find your way around the codebase', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You will expose how your app works which you should prevent due to security concerns', false);

-- Poll 321: In JS, cross-origin communication is possible, to do this, w...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, cross-origin communication is possible, to do this, what method from the in the answers below is plausible?', 145, NULL, NULL, 'closed', 'single', '2023-02-28T08:38:39.915Z', '2023-02-28T08:38:39.915Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With Redux ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With React prop drilling', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By informing your users to download a Chrome CORS extension and enable it', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'window.postMessage()', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With a function jQuery got famous for: the $.CORS() function', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'addEventListener("onCrossOriginCommunication")', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using the <sandbox> html tag', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With iframe event listeners ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By running iOS code to call your iFrame', false);

-- Poll 322: In HTML, A11y is important under every circumstance, but whe...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, A11y is important under every circumstance, but when are ARIA rules a way to enhance?', 108, NULL, NULL, 'closed', 'single', '2023-08-30T08:45:26.140Z', '2023-08-30T08:45:26.140Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you use non-semantic elements but want to support a11y', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'They should be used on all elements, but ARIA is always an ondergeschoven kindje', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you have to support deprecated HTML tags in older browsers', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ARIA rules are only applied when you want to improve your UX for complex apps towards your users', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'If the HTML tag exists but a11y support is not implemented', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you want to have a valid HTML document', false);

-- Poll 323: Hyperlinks can be styled through their pseudo classes you ma...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Hyperlinks can be styled through their pseudo classes you may already know, what solutions can you use to select a:link and a:visited in one go? ', 225, NULL, NULL, 'closed', 'multiple', '2023-06-19T08:14:02.202Z', '2023-06-19T08:14:02.202Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a:all-links', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a:links', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a:any-link', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a:where(:link, :visited)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a:any-where', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':select(a):from(section):where(:link):and(:visited)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'a:all', false);

-- Poll 324: In Frontend, letting developers experiment in the browser wi...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In Frontend, letting developers experiment in the browser with help of vendor prefixes made the W3C hit a snag, do you know the reasoning of why experiments are now put behind a flag?', 126, NULL, NULL, 'closed', 'single', '2022-10-13T07:36:48.822Z', '2022-10-13T07:36:48.822Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because the W3C became tired of the browser inconsistencies', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because the JS ecosystem got flooded with nonsense packages that generated vendor prefixes in code for developers ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because more than 60% of the web apps existed of meaningless code because of the added prefixes for CSS properties which slowed the web down', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because developers included prefixes on production apps, which made it difficult to ensure compatibility', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because it didn''t fit the long-term solution; Next to -webkit-, -moz-, -ms- and -o- prefixes, they also had to come up with prefixes for browsers like Brave, Tor, Vivaldi, Edge etc. ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because nowadays polyfills, babel and PostCSS tools are used to use experimental tools and code', false);

-- Poll 325: See the following TS code on your screen, what should the ou...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following TS code on your screen, what should the output of "Item" have been?', 121, 'type Items = { shield: string; hookshot: string };\ntype Item = keyof Items;', NULL, 'closed', 'single', '2023-08-04T07:10:30.091Z', '2023-08-04T07:10:30.091Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The keys: "shield" and "hookshot"', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The types of the keys: string and string', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The object: { shield: string; hookshot: string }', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'An array of keys:  ["shield, "hookshot"]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '''Item'' only refers to a type, but is being used as a value here.', false);

-- Poll 326: In CSS, centering an element on both axis is a common thing ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, centering an element on both axis is a common thing to embed, now what is one way to do this which may stick in your head?', 52, NULL, NULL, 'closed', 'multiple', '2024-03-12T08:47:56.521Z', '2024-03-12T08:47:56.521Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.center { \n   position: middle; \n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.center {  \n  display: flex;  	\n  justify-content: center;   \n  align-items: center; \n}', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.center {  \n  align-x: center; \n  align-y: center; \n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.center {  	\n  center: true; \n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Just using a class named “.center” will do this automatically', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using the <center> tag in HTML', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By going to page layout > page setup > layout > select “center” from the “alignment” dropdown list', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using divs with a determined fixed width and transparent background which take up space and push content to the middle', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.center {  	\n   vertical-alignment: "horizontal"\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.center {\n  margin: auto;\n  width: 50%;\n}', false);

-- Poll 327: In CSS, invalid code is all around, what will the browser do...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, invalid code is all around, what will the browser do when invalid code is found?', 98, NULL, NULL, 'closed', 'multiple', '2022-11-24T09:14:29.503Z', '2022-11-24T09:14:29.503Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It does nothing and happily moves on to your next CSS code', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will crash and throw an error what and where the mistake has been made', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will revert back the page to the default browser styles', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Guess the nearest correct value and apply that ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CSS easter eggs will popup', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The element with the applied faulty styles will automatically be hidden with display none to prevent more damage of erronous styling', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'After too many errors, the W3C might contact you with the fact that your CSS certificate might be withdrawn', false);

-- Poll 328: Here is a Flutter poll in disguise, what options Flutter pro...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Here is a Flutter poll in disguise, what options Flutter provides for managing navigation between screens do arise? \n\n', 230, NULL, NULL, 'closed', 'single', '2023-02-01T08:44:25.091Z', '2023-02-01T08:44:25.091Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'flutter');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With the Screens and Animation classes', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s done with a react-native-screens package', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With the hashrouter class', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With UINavigationController class', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With the Navigator and Route class', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With the SwipeLeft and SwipeRight class', false);

-- Poll 329: See the code on your screen, what should the output of "arr"...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the code on your screen, what should the output of "arr" have been?', 367, 'const arr = [1, 2, 3, 4, 5];\n\narr.length = 2; \n\n', NULL, 'closed', 'single', '2024-01-18T09:53:20.652Z', '2024-01-18T09:53:20.652Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[1, 2, 3, 4, 5]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '2', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'TypeError: Cannot read property of undefined (reading "length") ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'undefined ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[1, 2]', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[[]]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[empty x 2]', false);

-- Poll 330: See the code on your screen, what is the effect of the code ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the code on your screen, what is the effect of the code that is seen? ', 49, 'import "./styles.css";\nimport React, { useState } from "react";\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n	const [count2, setCount2] = useState(10);\n  \n  React.useEffect(() => {\n    setCount(count + 1);\n  }, [count]);\n\n  return (\n    <div className="App">\n      <h1>{count}</h1>\n    </div>\n  );\n}', NULL, 'closed', 'single', '2025-11-09T18:57:41.857Z', '2025-11-09T18:57:41.857Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The effect is that the count variable is updated from 0 to 1, because the useEffect will run once on pageload', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The effect is that the count variable is not updated and stays 0, because it never runs useEffect on the first render, only when you update the “count” value in another place first', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The effect is a performance improvement, because React wants to know what state variable it should update so when you pass that as dependency it helps React identifying state (kinda like “keys”) ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The effect is that all useState’s in this component are updated', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The effect is an infinite loop, due to circularity ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The effect is that you will get an error, because the useEffect rule is that you can’t update state inside a useEffect hook', false);

-- Poll 331: Some properties are inherited, tell me what effect this has,...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Some properties are inherited, tell me what effect this has, as this knowlegde will be merited! ', 208, NULL, NULL, 'closed', 'single', '2023-01-17T09:02:46.129Z', '2023-01-17T09:02:46.129Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Some properties can be reused from other class selectors with the CSS extension syntax by simply doing ".class1 .class2" (.class2 now inherits from .class1 and .class1 is now a blueprint)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When a codebase is transferred to a new team, the team "inherits" all the code, even the CSS and it''s properties', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Some properties have an inherited relationship like background, which is the parent property of background-image, background-size etc, or take the font-family property which is the parent property of child properties like font-size, font-weight, font-style etc. ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Children selectors will take up the value of certain properties (like color or font-family) applied on their parent selector', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Inheritance is the effect of which developers sometimes speak that when "father figure" developers work together for a long time with junior developers that these junior developers "inherit" the best practices from whoever they''ve learned ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s the effect of when parents have a software developer job and their children are also into software development', false);

-- Poll 332: In HTML, some pages can be hidden from a search engine, what...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, some pages can be hidden from a search engine, what meta tag is used for that intention?', 158, NULL, NULL, 'closed', 'single', '2023-07-24T07:44:51.998Z', '2023-07-24T07:44:51.998Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<meta name=“robots” content=“noindex” />', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<meta name=“css” content=“display: none” />', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<meta name=“seo” content=“none” />', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<meta name=“robots” content=“restricted” />', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<meta name=“stalker” content=“stopfollowingme!” />', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'All pages on the internet are crawled by the search engines, there is no tag for this', false);

-- Poll 333: In JS, equality checks is a subject you should be in on, do ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, equality checks is a subject you should be in on, do you know why "==" is frowned upon?', 164, NULL, NULL, 'closed', 'single', '2022-11-17T08:46:40.017Z', '2022-11-17T08:46:40.017Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because "==" doesn''t check equality; It is assigning values to variables', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because the amount of "=" improves equality checks; That''s why the W3C is planning to release "====" and "====="', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because "===" is 10 times faster than "=="', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because "==" only checks on primitive types and doesn''t do a deep equal ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because "==" is deprecated', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because "==" compares for equality after implicitly doing type conversions, which might be risky and not what you expect', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because in a survey of "the State of JS", 65% of all the developers voted to use "===" over "=="', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because the ESLint company decided to not lint "===" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because the W3C wants to deprecate "===" in favour of "==", switch the functionality from "===" to "==", because "==" and "===" caused to much confusion for developers (leading with the thought, the best football players in the world won''t make a perfect team)', false);

-- Poll 334: In JS, there is a lot knowledge to grasp, what way a boolean...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, there is a lot knowledge to grasp, what way a boolean value is cast?', 104, NULL, NULL, 'closed', 'single', '2022-10-21T07:55:44.752Z', '2022-10-21T07:55:44.752Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'cast(value)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'as boolean', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '(value) ⇒ “boolean”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof === ”boolean”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With CSS booleans', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With CSS logical properties', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '!!value', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Object.prototype.hasOwnProperty()', false);

-- Poll 335: What's the code, can you guess, how do you create a negative...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('What''s the code, can you guess, how do you create a negative value in CSS? ', 392, '--size: 20px;\n--offset: calc(var(--size) / 2);', NULL, 'closed', 'single', '2024-05-22T08:06:07.470Z', '2024-05-22T08:06:07.470Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '--offset: calc(-1 * var(--size) / 2);', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '--offset: calc(-var(--size) / 2);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '--offset: negativeCalc(var(--size) / 2);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '--offset: ---size / 2;  ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Not possible in CSS yet ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '--offset: Math.negative(--size / 2)\n', false);

-- Poll 336: The new <search> element semantically identifies a meaning, ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('The new <search> element semantically identifies a meaning, towards what answer are you leaning?', 378, NULL, NULL, 'closed', 'single', '2023-11-02T08:52:40.430Z', '2023-11-02T08:52:40.430Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is for presenting search results ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is the replacement of <input type="search" />', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s to add search styling to the page ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s to integrate third party apps such as ElasticSearch or ss360, which makes the integration seamless with the <search> tag and it''s attributes', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s just a container that represents a semantic value for search sections on a page where the user submits a user-entered search query ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s simply an extension for devtools to encourage the usage of semantic tags more as developers can now have an smenatic audit and"search" and replace for semantic tags in their code ', false);

-- Poll 337: JavaScript has a function called reduce, what is a common ca...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('JavaScript has a function called reduce, what is a common case for it''s use?', 166, NULL, NULL, 'closed', 'single', '2023-01-24T08:22:34.922Z', '2023-01-24T08:22:34.922Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you want to query to the database', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you want to combine values of an array', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you want to reduce page load ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you want to render JSX tags ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you want to increase performance of your code ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you want your code to be more environmental aware', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When .map and .filter are not supported in the browser ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you enjoy your freemium JavaScript subscription with limited use of functions ', false);

-- Poll 338: In JS, higher order functions exist out of lower level code ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, higher order functions exist out of lower level code which is known, what internals of a familiar higher-order function is shown? ', 165, 'function ???(array, test) {\n  let passed = [];\n  for (let element of array) {\n    if (test(element)) {\n      passed.push(element);\n    }\n  }\n  return passed;\n}', NULL, 'closed', 'single', '2022-11-25T08:42:43.846Z', '2022-11-25T08:42:43.846Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'map', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'reduce ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'push', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'concat', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'reduceRight', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'test', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'some', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'even', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'filter', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pass', false);

-- Poll 339: In JS, the value of the “this” keyword depend, what are fact...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, the value of the “this” keyword depend, what are facts you know to about it to recommend to others who practise frontend?', 53, NULL, NULL, 'closed', 'multiple', '2022-10-17T07:44:23.657Z', '2022-10-17T07:44:23.657Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“this” is determined on how a function is called', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“this” can only be used in class based code, if you use it outside it’ll return undefined', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Methods like call(), apply()and bind() can refer this to any object', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“this” always refers to the window object', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The value of “this” depends on the preferences set by the user in the browser ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“this” is the same as “that” ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“this” reference is preserved with var ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'arrow functions doesn’t have a “this” context', true);

-- Poll 340: The initial phase of a poll is often just a scribble, what t...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('The initial phase of a poll is often just a scribble, what technology has a maximum of 5MB storage and persistence in the browser, do you know the answer to this poll riddle? ', 239, NULL, NULL, 'closed', 'single', '2024-02-19T09:19:11.863Z', '2024-02-19T09:19:11.863Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'sessionStorage', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'cookies', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'indexedDB', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Web assembly', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Web components', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Postgres Database', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Redux ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'HTML storage box', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'localStorage', true);

-- Poll 341: In TS, the following union type feature in the function argu...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In TS, the following union type feature in the function arguments can be seen, what does it mean?', 174, 'const bookHoursInOodoo = (hours: number | string) => {}', NULL, 'closed', 'single', '2022-11-28T08:31:52.292Z', '2022-11-28T08:31:52.292Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means that when you call the function, the given argument must atleast contain a number and string type so the function must always be called twice', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'This is the pipe operator: It means in this case that it takes the argument as a number, and returns a string value', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means that TypeScript get to decide with inference what type the arguments should be ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means the type can either be a string or a number', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means string and number will be combined into one type: a "strumber"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It means nothing and because it should be “||” i.s.o “|”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'These are tuple notations in TypeScript', false);

-- Poll 342: Creating cool apps is something for me that yearns, what is ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Creating cool apps is something for me that yearns, what is it "keyof" returns? ', 405, NULL, NULL, 'closed', 'single', '2024-02-02T08:50:40.616Z', '2024-02-02T08:50:40.616Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'number', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'all pokemon types ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'string', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'object ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'union ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'generic ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'interface', false);

-- Poll 343: Bugs could be hiding in a single commit, what command can we...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Bugs could be hiding in a single commit, what command can we use to find the a commit that is the culprit?', 245, NULL, NULL, 'closed', 'single', '2023-05-11T07:28:51.440Z', '2023-05-11T07:28:51.440Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'git');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git status', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git commit', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git reset', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git culprit', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git blame', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git bisect', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git insect', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git inspect', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git bad commit', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'git angry product owner', false);

-- Poll 344: Truthy, falsy, these conversions dazzle my head, from the an...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Truthy, falsy, these conversions dazzle my head, from the answers below truthy values is what I seek, how about you give me the correct ones instead?', 77, NULL, NULL, 'closed', 'multiple', '2023-01-13T08:29:17.811Z', '2023-01-13T08:29:17.811Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[]', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '""', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '!false', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"false"', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'new Date()', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '5', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'NaN', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '0', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'false', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'null', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"true" ', true);

-- Poll 345: In JS, a deep-dive of the language is never wrong, which of ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, a deep-dive of the language is never wrong, which of the following general statements is where truth belong? ', 190, NULL, NULL, 'closed', 'single', '2022-12-22T09:08:04.444Z', '2022-12-22T09:08:04.444Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Accessing properties of undefined returns undefined', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Comparing `const a = { a: 1 }` and `const b = { a: 1 };` will return true', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The output of "console.log("Freezeezy Peak"[0]);" is "F". ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When spreading values with "...", the amount of dots represent the amount of iterables: e.g `[......array]` will spread 6 elements of the array in a new array', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'for..in and for..of are exactly the same and can be used interchangibly', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Nullish coalescing nullifies each value', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'NaN++ is a JS certificate ranked higher than NaN+ and NaN, and is an acronym for "Not a Noob"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '`const` values are immutable', false);

-- Poll 346: All these polls and answers sometimes feel like a steeplecha...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('All these polls and answers sometimes feel like a steeplechase, what git action do you need when you join a development team and want to contribute to the codebase? ', 335, NULL, NULL, 'closed', 'single', '2023-10-19T09:11:13.223Z', '2023-10-19T09:11:13.223Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'git');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By copying the codebase from someone else''s computer by sending it via email or keybase', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using ''git fork'' ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By performing a ritual dance to summon the code sages who will hand you the codebase in a holy moment', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By calling the most senior person of the company and let him do some complex setup stuff on your computer', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By doing some sort of dangerous test to prove your worth', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using ''git rebase'' ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By cloning the repository', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using ''git pull'' to get the latest changes', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By sending friend request to the current codebase on GitHub', false);

-- Poll 347: In React, interacting with the DOM is something we do intens...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In React, interacting with the DOM is something we do intensively, now what hook can be used for this effectively?', 127, NULL, NULL, 'closed', 'multiple', '2022-11-07T10:02:45.787Z', '2022-11-07T10:02:45.787Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useEffect', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useComponentDidMount', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useDOMEffect', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useLayoutEffect', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The render function should be used for this', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useTimeBeforeInteractiveEffect', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useRef', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useFirstContentfulPaintEffect', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useDOMContentLoadedEffect', false);

-- Poll 348: In JS, arrow functions are a famous subject, now how do you ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, arrow functions are a famous subject, now how do you write an arrow function correct? ', 36, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.857Z', '2025-11-09T18:57:41.857Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '() => {} ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '() <= {}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '() ==> {}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '() ≤=> {}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '() -> {}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '() > {}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '() ^^ {}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '() <<<<>>>>> {}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'arrow function() {} ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'function() {} ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '() 👉 {}', false);

-- Poll 349: Inputs and labels have a connection, what attributes work to...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Inputs and labels have a connection, what attributes work together to improve a11y for input selection?', 324, NULL, NULL, 'closed', 'single', '2024-02-12T08:57:10.078Z', '2024-02-12T08:57:10.078Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The "id" attribute from <input> and "htmlFor" attribute from <label>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The "name" attribute from <input> and "for" attribute from <label>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The "id" attribute from <input> and "for" attribute from <label>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The "value" attribute from <input> and "for" attribute from <label>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The "id" attribute from <input> and "label" attribute from <label>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The "label" attribute from <input> and "for" attribute from <label>', false);

-- Poll 350: In CSS, voting on these polls is time well spent, what psued...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, voting on these polls is time well spent, what psuedo class is used to style elements based on a url fragment?', 113, NULL, NULL, 'closed', 'single', '2022-10-16T15:22:30.814Z', '2022-10-16T15:22:30.814Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':target', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':url', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':active', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':fragment', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using #id selectors', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':last-url-child', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':has(:url)', false);

-- Poll 351: This hook will immediately render a successful outcome but s...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('This hook will immediately render a successful outcome but switch back when errors are caught, what hook am I exactly talking about? ', 429, NULL, NULL, 'open', 'single', '2024-05-30T08:43:30.040Z', '2024-05-30T08:43:30.040Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useState ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'usePromise', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useEffect', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useOptimistic', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useOnComponentWillMount', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useForm', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'usePessimistic', false);

-- Poll 352: See the following code on the screen, what is this code you ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, what is this code you might have seen? ', 333, '<my-button></my-button>', NULL, 'closed', 'single', '2023-09-14T08:10:46.659Z', '2023-09-14T08:10:46.659Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JSX ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'TSX', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A React component', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A React element', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A valid representation of a HTML tag ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A web component representation ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Properties of a <button> component living in the shadow DOM', false);

-- Poll 353: In JS, event delegation is a technique, the benefits are cle...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, event delegation is a technique, the benefits are clear, what is the correct fact of it I seek?', 22, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.857Z', '2025-11-09T18:57:41.857Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Event delegation is a technique involving adding event listeners to a parent element instead of adding them to the descendant elements. The listener will fire whenever the event is triggered on the descendant elements due to event bubbling up the DOM', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Event delegation is a native JavaScript way of managing app state like React context or Redux. Events are used to delegate data to certain places in your app', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Event delegation is not out of the box in JavaScript because it is not supported, however event delegation will come to JavaScript, but it is still a proposal, so for now you can npm install event-delegation.js', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Event delegation is a term in Scrum and doesn’t have anything to do with JS', false);

-- Poll 354: In JS, a function calling itself has a name, do you know at ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, a function calling itself has a name, do you know at what term I aim?', 163, NULL, NULL, 'closed', 'single', '2022-12-05T10:29:45.663Z', '2022-12-05T10:29:45.663Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'reversion', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'redirecting', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'reducing', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'recursion', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'closure', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'currying', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'reimbursing', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'hoisting', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'reproducing', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'rendering', false);

-- Poll 355: This piece of code you can see, what would the name of this ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('This piece of code you can see, what would the name of this type of function be? ', 314, 'const sum = (a: number, b: number) => a + b;', NULL, 'closed', 'multiple', '2023-11-06T08:51:25.145Z', '2023-11-06T08:51:25.145Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Arrow function ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Additive function ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'lambda ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Sum function ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Static private function ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Regular function ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'First class function ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'new function', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ES6 function', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Millenial function', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Async function ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Anonymous function', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Thisless function', false);

-- Poll 356: On the web we have a lot of different kinds of terminology, ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('On the web we have a lot of different kinds of terminology, can you describe "Same Origin Policy"? ', 331, NULL, NULL, 'closed', 'single', '2023-08-18T07:23:05.802Z', '2023-08-18T07:23:05.802Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a secure web tool that is installed on many computers to ensure save web browsing for everyone', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a certificate that handles domain policies ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a policy the W3C uses for it''s own way of creating, sharing and providing high quality web standards', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a policy where origins can be make requests to all kinds of other origins', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a policy where domains are restricted from requesting data from one origin to another origin ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a way to fool the browser and inject MITM attacks between requests', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a policy spec created by the W3C instructing users on how to use the web', false);

-- Poll 357: HTML elements have a way to represent a number to slide, whi...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('HTML elements have a way to represent a number to slide, which tag from below would that provide? ', 323, NULL, NULL, 'closed', 'single', '2023-08-15T07:58:35.774Z', '2023-08-15T07:58:35.774Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="slider">', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="volume">', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="dragging">', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="range">', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="swiper">', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="touch-gestures">', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="controls">', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="range-controls">', false);

-- Poll 358: In TypeScript defining anything as an Object you can do with...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In TypeScript defining anything as an Object you can do without being adept, what arguments of the following function will TypeScript then accept? ', 389, 'const getUsers = (users: Object) => ...\n\ngetUsers( // what will this accept? )', NULL, 'closed', 'multiple', '2023-11-23T08:30:42.331Z', '2023-11-23T08:30:42.331Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Anything in JavaScript, because everything is an object ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Only variables that match the name "object" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[object Object]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'All primitive values ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '{ key: "value" }', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'new Date()', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[1, 2, 3]', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'new String(''string'')', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'NaN', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Number', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'new Error()', true);

-- Poll 359: A promise is used to check if async operations are completed...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('A promise is used to check if async operations are completed or not, which States and Results has it got?', 326, NULL, NULL, 'closed', 'multiple', '2023-11-29T09:14:58.431Z', '2023-11-29T09:14:58.431Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'State: Awaiting completion', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'State: Finished', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'State: Fullfilled', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'State: Denied', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'State: Rejected', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'State: Pending', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Result: Null', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Result: Undefined', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Result: A result value', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Result: A warning object', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Result: An error object', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Result: Another promise', false);

-- Poll 360: A programming interface in HTML you can work with, what is t...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('A programming interface in HTML you can work with, what is the name of it?', 250, NULL, NULL, 'closed', 'single', '2023-03-29T08:04:56.330Z', '2023-03-29T08:04:56.330Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The HTML Tree', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'AST', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Virtual DOM', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Objects', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CSSOM', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Tag API', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'HTML API', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Browser console', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The DOM', true);

-- Poll 361: In CSS, flexbox and grid techniques are each like a brother,...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, flexbox and grid techniques are each like a brother, though they are not the same, can you list differences one over another?', 101, NULL, NULL, 'closed', 'multiple', '2024-04-02T08:58:24.300Z', '2024-04-02T08:58:24.300Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Flexbox is aimed at smaller layouts, while grid is aimed at larger-scale layouts', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You should choose either grid or flexbox in your project, because using them interchangeably cancel each other out', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Grid is only needed to create table layouts; Flexbox should be used for the rest', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Grid can be used to control elements on both axis simultaneously; Flex is used when you need to control elements over a single axis only', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Flexbox is only used to flex your skills; Grid is used by default for everything', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Flexbox is used by Tailwind; Grid is used by Bootstrap/Foundation frameworks for cell-based layouts', false);

-- Poll 362: Most web apps exist out of forms waiting to be completed, wi...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Most web apps exist out of forms waiting to be completed, with a <button> nested inside a <form> and pressing ENTER, how will the <form> have the <button> treated?', 125, NULL, NULL, 'closed', 'single', '2023-01-20T08:41:05.873Z', '2023-01-20T08:41:05.873Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will do nothing', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The form values will be reset ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The form values will be automatically stringified ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The form will submit ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The app will assume you work with a keyboard ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The <button> element will disappear', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'On Mac OS, bluetooth connectivity will be lost for a few seconds due to a weird Mac OS bug', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The button will nag you by making sure it can''t be clicked and displaying “NEENER NEENER, no button mashing”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'In most browsers it will work fine, but Firefox has a long standing issue where form data is printed by the nearest connected printer in your area', false);

-- Poll 363: In JS, `Date` has been a long-standing pain point in ECMAScr...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, `Date` has been a long-standing pain point in ECMAScript, now what is the name of the new upcoming API that will make the `Date` object get skipped?', 43, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.857Z', '2025-11-09T18:57:41.857Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Nothing, the Date object will stay but will be improved ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Nothing, because there is nothing wrong with the Date object', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Temporal API', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Moment.js will be the replacement', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Date-fns will be the replacement', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Calendar API', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'DateTime API', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Timezone API', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ImprovedDate API', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Date v2.0 API', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The Date API will be deprecated eventually because most libraries handle it way better these days', false);

-- Poll 364: In HTML, the `tabindex` property may enhance a11y by control...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, the `tabindex` property may enhance a11y by controlling keyboard focus in development, what are concerns when using it on a non-interactive element? ', 103, NULL, NULL, 'closed', 'single', '2022-10-24T08:01:54.581Z', '2022-10-24T08:01:54.581Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The concerns are that it will cause unwanted side effects on semantic elements', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because the “tab” button was actually going to be replaced on future keyboards, because it had no real meaning (before popular shortcuts like cmd + tab came around)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The concern are performance issues, because when tabindexing, "indexing" is required which is a heavy computational task', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It prevents assistive technology from being able to navigate and manipulate to elements', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Nothing, on the contrary; adding tabindex enhances a11y', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Concerns are that it doesn''t work: non-interactive elements can''t be interacted with', false);

-- Poll 365: Dynamic imports is quite new and around but what’s the deal,...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Dynamic imports is quite new and around but what’s the deal, do you know what it is, if yes please reveal!', 203, NULL, NULL, 'closed', 'single', '2024-01-24T10:45:29.320Z', '2024-01-24T10:45:29.320Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a way to import any programming language within JavaScript', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Dynamic imports are just a name for having multiple imports (a dynamic amount of imports)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Dynamic imports are a way to have mulitple "default" imports and prevent the usage of import { module } ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Dynamic imports are a way to import apps into your app shells, mostly used in microfrontends', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Dynamic imports are imports that can be reassigned at runtime ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Dynamic imports allow loading a module conditionally or on demand', true);

-- Poll 367: Writing a selector that doesn't match elements is sometimes ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Writing a selector that doesn''t match elements is sometimes something what you need, how do you write such negation selector to succeed? ', 218, NULL, NULL, 'closed', 'single', '2023-04-12T07:58:35.507Z', '2023-04-12T07:58:35.507Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By writing ".class + class ~ .class"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With pseudo selector ":negate()"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With pseudo selector :out-of-range', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With ".class < .class"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With pseudo selector ":not()"', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By not selecting anything', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With pseudo selector ":match()"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With pseudo selector ":don''t()"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With some complex regex', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With CSS Houdini', false);

-- Poll 368: In JS, slice and splice are common terms, what facts from bo...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, slice and splice are common terms, what facts from both can you affirm?', 21, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.857Z', '2025-11-09T18:57:41.857Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Splice actually was an improved experiment of slice and not meant to be used yet, but devs used it anyway which made it impossible to remove from the web (as it would break alot of code) ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Slice and splice do the same', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Slice returns a new array while splice mutates the original array', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Splice can be used to copy the array with it''s contents', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Slice and splice methods can take 3 parameters: start, mid, end. ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Slice and splice without arguments is valid JS', true);

-- Poll 369: Some of these polls are hard to answer without guides, which...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Some of these polls are hard to answer without guides, which value should "x" contain to reach the "if block" insides?', 334, 'const x = ?; \n\nif (x !== x) { \n   console.log("Will this block ever be reached?")\n\n}', NULL, 'closed', 'single', '2023-10-18T09:01:42.480Z', '2023-10-18T09:01:42.480Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '5 ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '0', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '""', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'false ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Date.now() ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Infinity', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '-0', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'NaN', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '1237812389789899889', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It won''t be reached ever', false);

-- Poll 370: With "transform: skew" distorted elements you will create, h...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('With "transform: skew" distorted elements you will create, how can you prevent children elements from being in a skewed state? ', 204, 'https://stackoverflow.com/questions/17947565/how-to-skew-element-but-keep-text-normal-unskewed', NULL, 'closed', 'single', '2024-01-10T10:44:04.259Z', '2024-01-10T10:44:04.259Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Not possible, but you can to negate the skewing on the child with the same amount of skew in the opposite direction and "unskew" it ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With a second parameter of the skew function to assign on what element you want to apply the skew, like “translate: skew(25deg, “section”);”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With applying the property “propagate: stop”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'transform: none', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'div:outer-child {\n   transform: skew(25deg);\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By first rotating the element 25degrees, applying a translateX and a scaleX', false);

-- Poll 371: React is not spelled with the letter F, what is a use case f...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('React is not spelled with the letter F, what is a use case for useRef? ', 171, NULL, NULL, 'closed', 'multiple', '2023-10-12T09:19:37.294Z', '2023-10-12T09:19:37.294Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It can be used as reference storing facts in detail about a codebase. When you contribute to the codebase, you''ll refer to useRef', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'JS has types that are either value or reference; with useRef you can make each variable a "reference" and make it immutable', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When updated, it can store mutable values without requiring a re-render\n', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It can be applied to directly access a DOM element', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useRef is the name of a React learning resource initiative from Dan Abramov. Often documentation is referenced, so the name of the resource is hence called "useRef" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'useRef is the name of a yearly poll for people working with React, to have vote in political issues happening at React', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With useRef you can refer to your code with a "comment reference" which is handy to have a good overview of all code with comments', false);

-- Poll 372: In JS, when sorting the following string items by locale alp...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, when sorting the following string items by locale alphabetically, what techniques can be used collectively?', 141, 'const countries = ["Østrig", "Polen", "Ungarn", "Belgie", "Spanien"];', NULL, 'closed', 'single', '2022-11-11T08:41:48.562Z', '2022-11-11T08:41:48.562Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.sort() and .reverse()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Just .sort() ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Flexbox with flex-wrap: wrap-reverse', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.sort() and Intl.Collator', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.sort() and lodash ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.sort() and .reduceRight()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'This can be done with CSS logical properties', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By replacing every foreign character with something that looks like the character the most will do, e.g "Ø = O". ', false);

-- Poll 373: Checking if a key exists in an object without going up the p...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Checking if a key exists in an object without going up the prototype chain, what method is used can you explain? ', 262, NULL, NULL, 'closed', 'single', '2023-05-12T08:13:52.865Z', '2023-05-12T08:13:52.865Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Object.keys()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'hasOwnProperty ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'in', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Object.prototype', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Object.chain', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'if (obj.key) ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Object.isset', false);

-- Poll 374: In CSS, features can depend on browser support, what syntax ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, features can depend on browser support, what syntax can you use to detect this which you shouldn’t subvert?', 39, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.857Z', '2025-11-09T18:57:41.857Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '@enabled', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '@supports', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '@feature', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '@media', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '@experimental', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '@danger', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '@property', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '@under-construction', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You just implement the code and the browser will automatically recognise if it works or not', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '@browser("Chrome").supports()', false);

-- Poll 375: With CSS you can make your site more decorative, which of th...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('With CSS you can make your site more decorative, which of the following units are considered relative? ', 224, NULL, NULL, 'closed', 'multiple', '2023-08-01T07:14:19.740Z', '2023-08-01T07:14:19.740Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'px', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'em', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'rem', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'vw / vh', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'cm', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'dvw / dvh', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'lh ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'pt', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'in', false);

-- Poll 376: The 'new' keyword might not be used how it was intended, for...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('The ''new'' keyword might not be used how it was intended, for Number, String and boolean, why for example would it not be recommended?', 304, NULL, NULL, 'closed', 'single', '2023-06-28T08:06:15.477Z', '2023-06-28T08:06:15.477Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because they are not ''new'' types anymore and are there since the birth of JavaScript', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because ''new'' is only used for types that should be new', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is recommended if you want to create ''new'' types, because it offers you alot of built-in functions and properties', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s not recommended because you create an unnecessary wrapper around these primitive types', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is recommended as this will be the way how we use types in JavaScript without TypeScript', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is not recommended as the ''new'' keyword is deprecated and is now ''old'' ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is only recommended if you are ''new'' to JavaScript to indicate your proficiency level in projects, learning journeys etc. ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is not recommended as it was harder to work with the ''this'' context back in the classical inheritance days ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is recommended because you also use the ''new'' keyword for Date, Error, RegExp or Array for example', false);

-- Poll 377: In HTML, input types come with a lot of various values, what...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, input types come with a lot of various values, what are existing ones that you may already have used?', 58, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.857Z', '2025-11-09T18:57:41.857Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'color', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'text', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'country', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'message', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'hidden', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'radio', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'tv', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'blank', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'video', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'reset', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'code', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'switch', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'gender', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'url', true);

-- Poll 378: These TypeScript questions are hard and may get you annoyed,...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('These TypeScript questions are hard and may get you annoyed, or maybe these questions are the ones you enjoyed, tell me what it means when you return a function type as void? ', 210, NULL, NULL, 'closed', 'multiple', '2023-02-17T09:04:09.678Z', '2023-02-17T09:04:09.678Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That the function body should always be empty', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That you always should return undefined  in your function', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That you always should return null in your function', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That you can return any falsy value in your function', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That the return value should be ignored but it’s fine whenever you return something', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That you may not return something in your function', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'That your code will run in the vast nothingness', false);

-- Poll 379: In HTML, elements are either block or inline, what are facts...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, elements are either block or inline, what are facts to know that’ll make your skills shine?', 57, NULL, NULL, 'closed', 'multiple', '2022-10-10T07:43:19.196Z', '2022-10-10T07:43:19.196Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Block level elements take the width of the entire row', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Block level elements are the default for every element', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Setting flex or inline-flex on an element means the element is block or inline', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<button> is a block level element because it’s looking like a “block”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When a block element is followed by an inline, they are both positioned in the same row next to each other ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'An inline element does not start on a new line and it only takes up as much width as necessary', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A <span> with “width: 100%” will automatically become a block level element ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Setting “display:block” on an inline element will make the element block level', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'There is a specific CSS selector that selects only block level elements', false);

-- Poll 380: The frontend landscape changes are rapid, which of these JS ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('The frontend landscape changes are rapid, which of these JS snippets are not valid? ', 235, 'const number = 10;', NULL, 'closed', 'multiple', '2023-09-15T08:15:03.621Z', '2023-09-15T08:15:03.621Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '!!!number', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Number(number)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '// TODO: Make sure this code hits production before Saturday 0.00', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '`${if (bool) ? 42 : 0}`', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const mOcKDaTafRomStorE = {\n    gLObalVariAbles: [100, 200, 300]\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const Component = () => { \n   return <h1>Title of component</h1>\n}', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const o = {}; \no[NaN] = "A"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const o = {}; \no[Boolean(1)] = "A"; ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'o[() => { return "key" }] = "A"; ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const array = ]1, 2, 3, 4, 5[ ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'let hello = "world";\nconsole.log(hello[-1]);', false);

-- Poll 381: In JS, arrays start and end, what ways are allowed to get th...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, arrays start and end, what ways are allowed to get the last element?', 114, NULL, NULL, 'closed', 'multiple', '2022-09-30T07:54:03.752Z', '2022-09-30T07:54:03.752Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array[array.length - 1]', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array.at(-1)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array[array.length]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'while((element) ⇒ {  return array === “last” ? element : array })', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array.findLastElement(element ⇒ element)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array.slice(-1)[0]', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array.pop()', false);

-- Poll 382: In Web, when JS code is served from `http://oodoo.nl/marcian...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In Web, when JS code is served from `http://oodoo.nl/marcianosr/pull-requests` and does a fetch request to `http://oodoo.nl/oodoo-copilot` via HTTP, what problem will you run into for free? ', 82, NULL, NULL, 'closed', 'single', '2022-09-21T08:36:49.090Z', '2022-09-21T08:36:49.090Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CORS (ofCORS!): because cross-origin requests are not allowed', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Nothing: You can perfectly do this request', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Your website will crash because it will get stuck in a request loop', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You’ll run into auth errors ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'If your IP is exposed, it will let Oodoo administrators know a request is done to their server because making requests to an URL without the owner(s) knowing may get you in trouble', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will work, but throw a warning message in the console, because HTTP is used', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will not work, and throw an error message in the console, because HTTP is used and violates the security policy', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It depends on what is returned by HTTP: if the page exists and returns a 200, it’ll be fine, however if the code contains 400’s or 500’s, you’ll get the concerned HTTP status as return (which is seen in the network inspector)', false);

-- Poll 383: Various answers are listed and you have just one to pick, in...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Various answers are listed and you have just one to pick, in React, how can will you pass event arguments with an on click? ', 87, NULL, NULL, 'closed', 'multiple', '2023-08-24T07:38:53.071Z', '2023-08-24T07:38:53.071Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'onClick={handleClick}', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'onClick={handleClick(e)}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'click(function(e) {})', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'onclick={(e) ⇒ handleClick(e)}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'onClick={handleClick.bind(e)}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'onClick={(e) ⇒ handleClick(e)}', true);

-- Poll 384: CSS properties come in big collections, what are vendor pref...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('CSS properties come in big collections, what are vendor prefixes misconceptions?', 382, NULL, NULL, 'closed', 'multiple', '2024-03-14T10:22:11.778Z', '2024-03-14T10:22:11.778Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'They are needed for the W3C to check on which properties they experiment with are popular ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'If you use all available vendor prefixes for a property, it will work seamlessly across all browsers', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'If one browser implemented an feature as vendor with vendor prefix, you can guarantee it works in all browsers when using the right prefixes for each browser ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Vendor prefixes are a temporary solution for experimental features', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Not all new features or properties get prefixed versions. Some go directly to un-prefixed implementations if they''re stable and well-agreed upon', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Vendor-prefixed properties are browser-specific', false);

-- Poll 385: In CSS, I need your knowlegde give me a slice, what media qu...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, I need your knowlegde give me a slice, what media query combo is the most trustworthy to detect a desktop device? ', 123, NULL, NULL, 'closed', 'single', '2022-10-25T07:43:22.400Z', '2022-10-25T07:43:22.400Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '@media screen and (min-width: 1024px) and (orientation: portrait)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '@media only screen and (max-width: 1320px) and (min-width: 768px)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '@media only screen and (device: "desktop") and not (device: "mobile")', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'With CSS4 media queries', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '@media (resolution: 150dpi) and (resolution: 72dpi)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '@media (hover: hover) and (pointer: fine)', true);

-- Poll 386: console.log is probably one of the commands most used by beg...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('console.log is probably one of the commands most used by beginners and veterans, knowing the following question means you have frontend at heart, of what environment is this console API part?\n ', 200, NULL, NULL, 'closed', 'single', '2023-01-16T08:05:45.779Z', '2023-01-16T08:05:45.779Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is part of the EcmaScript Standard', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is part of the JavaScript runtime (e.g Chrome’s V8)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is part of the general internet', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is part of the Node environment', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is an API provided by the browser but has it’s own implementations in other environments', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a library developed by the W3C that is used in different  environments', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The console API is installed with npm install console -g', false);

-- Poll 387: The answer is for the power nerds: Which is the correct way ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('The answer is for the power nerds: Which is the correct way to split a sentence into words? ', 412, 'const dutchSentence = "Lientje leerde lotje lopen langs de lange lindelaan"', NULL, 'closed', 'single', '2024-03-13T09:35:01.583Z', '2024-03-13T09:35:01.583Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const words = dutchSentence.split(/\s+/)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const words = dutchSentence.split(" ");', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const segmenterDutch = new Intl.Segmenter("nl-NL", { \n  granularity: "word" \n});\nconst words = Array.from(segmenterDutch.segment(dutchSentence)).filter(segment => segment.isWordLike).map(segment => segment.segment)', true);

-- Poll 388: Use the proper syntax or your styles will falter and fail, w...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Use the proper syntax or your styles will falter and fail, what is the correct syntax for styling attributes, do you know this detail? ', 202, NULL, NULL, 'closed', 'single', '2023-09-01T07:36:40.437Z', '2023-09-01T07:36:40.437Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[data-attribute] {\n  /* style rules go here */\n}', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '{data-attribute} {\n  /* style rules go here */\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '(data-attribute) {\n  /* style rules go here */\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '$data-attribute$ {\n  /* style rules go here */\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '^data-attribute^ {\n  /* style rules go here */\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.data-attribute {\n  /* style rules go here */\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'data-attribute {\n  /* style rules go here */\n}', false);

-- Poll 389: In CSS, “adjacent sibling selector” is something known by ea...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, “adjacent sibling selector” is something known by each CSS freak, now how does it look like and what does it achieve as technique? ', 6, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.857Z', '2025-11-09T18:57:41.857Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '`div + div`, The “adjacent sibling selector” is used to select an element that is immediately followed by another specific element.', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '`div < div`, The “adjacent sibling selector” is used to select an element that is immediately before another specific element.', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '`div > div`, The “adjacent sibling selector” is used to select an element that is the direct child', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '`div div`, The “adjacent sibling selector” is used to select all elements within given the selector', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'The “adjacent sibling selector” allows the ability to nest in CSS', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'There is no such thing as an “adjacent sibling selector” in CSS yet, but it’s a proposal for CSS4 and not yet fully elaborated', false);

-- Poll 390: To reach this number of polls took me a full year, what stat...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('To reach this number of polls took me a full year, what statements you see below will have the primitive ''false'' appear?', 303, NULL, NULL, 'closed', 'multiple', '2023-05-16T07:17:19.983Z', '2023-05-16T07:17:19.983Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"twentyeight" - 20;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'NaN === NaN', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const amountOfPollsAsAString = "303"; \n\nNumber.isNaN(amountOfPollsAsAString);', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof NaN', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'typeof "number"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'null === undefined', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '''5'' === 5;', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ''''' == false', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '''hello'' && false; ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[] == {}', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'false === false', false);

-- Poll 391: In JS, some events may be ambiguous, what is the difference ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, some events may be ambiguous, what is the difference between blur and onFocusOut which is not very conspicious?', 106, NULL, NULL, 'closed', 'single', '2022-11-02T09:08:13.700Z', '2022-11-02T09:08:13.700Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'They are different kind of events: blur is used for example with images (“blurring”), while onFocusOut is used for input fields', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Blur is used in conjunction with input fields, onFocusOut is only for buttons', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'onFocusOut bubbles; blur doesn’t', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'There is no difference in functionality: onFocusOut was developed later as the W3C found this to be a more intuitive name', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'onFocusOut is a synthetic event from React (and the better name according to them); blur is the DOM implementation', false);

-- Poll 392: In JS, higher order functions exist out of lower level code ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, higher order functions exist out of lower level code which is known, what internals of a familiar higher-order function is shown?', 173, 'function ???(array, transform) {\n  let arr = [];\n  for (let element of array) {\n    arr.push(transform(element));\n  }\n  return arr;\n}', NULL, 'closed', 'single', '2023-12-14T09:18:53.494Z', '2023-12-14T09:18:53.494Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'some', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'every', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'isEqual', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'transform', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'transduce', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'map', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'foreach', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'filter', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'reduce', false);

-- Poll 393: Some words we want to prevent from breaking on the next line...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Some words we want to prevent from breaking on the next line, what code for this will work fine? ', 276, 'See example: the word "Customer Service" we want to keep on the same line, whatever happens\n\n"Please contact our Customer Service department for assistance."\n', NULL, 'closed', 'single', '2023-11-20T09:33:45.223Z', '2023-11-20T09:33:45.223Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '&amp;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '&gt;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<wbr>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Only possible by joining the two words as one word: "CustomerService" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using a -', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is only possible in CSS ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'For browsers it''s actually pretty hard to implement because of all the possible screen sizes; There have been many attempts from the W3C to implement such a thing, but op to today it is not really possible without performance losses', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '&nbsp;', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using text-overflow', false);

-- Poll 394: Controlling the horizontal alignment only of the last text l...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Controlling the horizontal alignment only of the last text line is something you may need, how would you make this succeed? ', 150, NULL, 'https://codesandbox.io/embed/mutable-field-ey5oeq?fontsize=14&hidenavigation=1&theme=dark', 'closed', 'single', '2023-04-04T07:08:48.834Z', '2023-04-04T07:08:48.834Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'float', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'text-align', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'p:last-child', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'p:last-word', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'p.slice(-1) ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'text-align-last', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'nth-last-child', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), ':last-sentence', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'columns: n ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'sentences: n', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'word-align', false);

-- Poll 395: See the following code on the screen, if we want numbers to ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, if we want numbers to be in descending order, what would your answer have been?', 140, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]', NULL, 'closed', 'multiple', '2023-01-27T08:27:34.350Z', '2023-01-27T08:27:34.350Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.orderBy("desc")', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.sort((a , b) => a + b)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.sort((a , b) => b - a)', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.sort((a , b) => b - a).reverse()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.reverse()', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '.sort(() => .5 - Math.random() );', false);

-- Poll 396: In HTML, links should be accessible, name some best practice...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, links should be accessible, name some best practices that are impeccable!', 160, NULL, NULL, 'closed', 'multiple', '2022-11-18T08:57:07.782Z', '2022-11-18T08:57:07.782Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Links should have sound effects when clicking on them (a11y for blind people)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Links should always have a blue color', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Links should have a distinguishable color contrast', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Links should be a <button> when they are internal; they should be <a> if they are external', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Links should be made identifiable by having it''s text atleast contain the word “link”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Links should not jump to sections because it confuses your users, it should contain a smooth scroll to let users better understand what’s happening', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Links should always be underlined', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Link text be provided in as many languages as possible ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Links should be styled on all states: :not-visited, :hover, :click, :visited:, :active:, :inactive: and :disabled ', false);

-- Poll 397: In React, the following code can be seen, why will it not re...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In React, the following code can be seen, why will it not render anything on the screen? ', 95, 'const Heading = () => {\n   <ul></ul>\n}', NULL, 'closed', 'single', '2025-11-09T18:57:41.858Z', '2025-11-09T18:57:41.858Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'react');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It doesn’t render, you need the `return`statement', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It does render, this is implicit return', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It doesn’t render because a render function is required', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It doesn’t render because the JSX element is empty', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It does’t render because it is not wrapped in a fragment', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It doesn’t render because custom components need to explicitly render “children“', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It does render because also empty JSX tags render', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It doesn’t render because it has no props', false);

-- Poll 398: In HTML, the built-in functionalities rocks, now which tags ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, the built-in functionalities rocks, now which tags can be used to have a collapse/expand out of the box?', 136, NULL, NULL, 'closed', 'single', '2022-11-03T08:37:01.395Z', '2022-11-03T08:37:01.395Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<collapsible> and <expand>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<ul> and <li> with special added attributes', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Anything wrapped in <dialog>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'There is no tag that does this, it can be done with custom JS only', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<section> and <article>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<details> and <summary>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '$(''div'').click(function(){\n    $(this).find(''.hider'').toggle();\n});', false);

-- Poll 399: <ol> properties is what we are getting into, what does the "...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('<ol> properties is what we are getting into, what does the "start" property do? ', 426, NULL, NULL, 'closed', 'single', '2024-04-18T08:15:02.095Z', '2024-04-18T08:15:02.095Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is a property to "start" rendering the element in the HTML tree, e.g start="onElementDidMount" or start="onElementWillMount" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It determines where in the HTML tree to mount or "start", e.g start="section"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It determines where to start in your layout, e.g start="right" or start="center" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It allows for different numeral types like "roman"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It allows to style the first text of the list, like start="bold" or start="em"', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It allows the list to start on a different number, like start="4"', true);

-- Poll 400: In HTML, <fieldset> elements usage is very rare, of which co...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, <fieldset> elements usage is very rare, of which cool facts are you aware?', 181, NULL, NULL, 'closed', 'single', '2022-12-14T08:59:49.481Z', '2022-12-14T08:59:49.481Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When <fieldset> contains a disabled attribute, all it’s form control descendants are disabled', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<fieldset>’s default display value is “flex”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<fieldset> is a graphical element rendering borders around elements within a <canvas>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<fieldset> is used to group any sort of content', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<fieldset> element are highly dependant on the system they’re running on, which means they’re hard to style', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<fieldset> semantics should be descended with <fieldsetitem> tags', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<fieldset> tags can render forms in different languages with the lang attribute', false);

-- Poll 401: See the following code on the screen, what should the output...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following code on the screen, what should the output have been? ', 341, 'JSON.stringify("production") === "production";', NULL, 'closed', 'single', '2023-10-10T08:22:17.184Z', '2023-10-10T08:22:17.184Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"production" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'false ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'true', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Uncaught SyntaxError: Invalid left-hand side in assignment', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '""', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"DEPLOY NOW!!!" ', false);

-- Poll 402: In HTML, alt tags provide descriptions of an image you know ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, alt tags provide descriptions of an image you know It well, what is a valid reason to leave it blank, can you tell?', 97, NULL, NULL, 'closed', 'single', '2022-10-15T18:59:33.589Z', '2022-10-15T18:59:33.589Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It should always be filled in ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When the backend is not done yet or didn’t provide an alt text', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When the content marketeer forgot or decided to leave the image alt text from within the CMS empty ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you don’t have to focus on accessibilty', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When the image is purely decorative', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When you lack an idea for an alt text (also applicable to variable naming)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'When there is a <p> describing the image', false);

-- Poll 403: A PWA can function as a Native desktop app. Some things are ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('A PWA can function as a Native desktop app. Some things are not possible (yet), what is the gap?', 351, NULL, NULL, 'closed', 'multiple', '2024-03-20T10:18:35.879Z', '2024-03-20T10:18:35.879Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t follow the light/darkmode settings of your OS', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t set the app main menu', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t use the OS''es file dialogs or Cmd+S to save in background', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t spawn new windows', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t manipulate the context menu of the dock', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t access ''recently used files''', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t access the Clipboard', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t access game controllers', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'PWA''s can''t use the printer', false);

-- Poll 404: See these code snippets I make, which of these answers below...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See these code snippets I make, which of these answers below are a fake?', 286, NULL, NULL, 'closed', 'multiple', '2023-04-11T07:30:42.599Z', '2023-04-11T07:30:42.599Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<img\n  src="placeholder.png"\n  alt="some random image"\n  loading="lazy"\n/>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<ul reversed>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<ul numbered>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="text" autofocus>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="text" required>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<a href="document.pdf" download>Download PDF</a>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<p title="I am a title!">', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<p seo-content=“a descriptive text for SEO purposes”>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<div contenteditable="true">\n  This text can be edited by the user.\n</div>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<div dangerouslySetInnerHtml>This HTML is not safe!</div>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<script src="script.js" defer></script>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<video \nsrc="https://poll-app-ivory.vercel.app/video.mp4"\nposter="image.png">\n</video>', false);

-- Poll 405: We can implement all kinds of nav, when using the "oncontext...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('We can implement all kinds of nav, when using the "oncontextmenu" event, what can we then have?  ', 269, NULL, NULL, 'closed', 'single', '2023-04-14T07:53:06.839Z', '2023-04-14T07:53:06.839Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Interaction when the user right clicks ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Interaction when the user opens any kind of menu ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Interaction when a click event is bound to a <nav> or <menu> element ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Interaction with a given menu implementation on run-time ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It''s a way to collect and listen to all kind of events on an app in debug mode (automatically disabled on production env)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Interaction with the mousewheel ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It listens to when you type the exact word "context"', false);

-- Poll 406: In TypeScript, when it expects a property the compiler may c...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In TypeScript, when it expects a property the compiler may complain, which syntax makes sure the compiler won’t go insane? ', 29, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.858Z', '2025-11-09T18:57:41.858Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Using “?” behind the property', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Setting the type of the property to at least “undefined” ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Setting the type of the property to at least “null” ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Setting the type of the property to “optional”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Using [] to wrap around a property like [optionalProperty]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Using ternary conditionals in object properties so it only applies on a certain condition', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'In ES2023, you can do it with using by wrapping your property with “^property^” syntax', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using the built-in generic utility <Optional> type', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Setting a default value of the property', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'TypeScript can’t have optional types, you need for example libraries to handle this', false);

-- Poll 407: Sometimes the runtime errors will interfere, what will be th...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Sometimes the runtime errors will interfere, what will be the status of the variable here? \n', 170, 'console.log(pizza);', NULL, 'closed', 'single', '2023-02-24T09:19:22.553Z', '2023-02-24T09:19:22.553Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'unexistant', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'undefined', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'null', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'undeclared', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'unreasonable', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'unsubmitted', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will automatically log the window, because if JS can’t find the variable, it will find the highest level of variable (like how “this” behaves in scope leaks)', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'unreferenced', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'unassigned', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'NaN', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ungrateful', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'uninitialized', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will log "pizza" as JS is smart enough to convert uninitialized variables as string for you', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will return the number: 1 ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It will return the boolean true', false);

-- Poll 408: In Frontend, your website floats in digital space all around...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In Frontend, your website floats in digital space all around, what are ways to make your SEO profound?', 116, NULL, NULL, 'closed', 'multiple', '2023-11-21T09:32:19.364Z', '2023-11-21T09:32:19.364Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Using alt tags on images', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Using semantic HTML tags wherever possible', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By creating a PWA and a native app next to your website', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By making sure to visit your own app a few times a day and interact with it. Google''s believe is that your website / app should be treated like a pet, and that you should "care" (just like for your pet) for your website to have it ranked high', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using canonical tags in HTML', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using “responsive site” meta tags if your site is responsive', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By integrating a CMS', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By integrating the SEO crawler API', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By redirecting all your non-existing pages to Google', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By integrating a search engine search bar on your website, so Google can easily gather data from your website and users', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By making sure to pay for search engines subscriptions: the highest tier makes sure you''re always highest ranked', false);

-- Poll 409: All this knowlegde, let it sink, in the following code, what...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('All this knowlegde, let it sink, in the following code, what is the output do you think? ', 339, '[1, 2, 3] + [4, 5, 6];', NULL, 'closed', 'single', '2023-11-24T09:12:38.240Z', '2023-11-24T09:12:38.240Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[1, 2, 3] + [4, 5, 6];', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[[[[[[[]]]]]]]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'true', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Uncaught SyntaxError: Unexpected array operation', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[2, 4, 6] + [8, 10, 12]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '21', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'NaN', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"1,2,34,5,6"', true);

-- Poll 410: See the following TS code on your screen, what is the name o...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('See the following TS code on your screen, what is the name of this piece you must have seen?', 17, '<Array<number>>', NULL, 'closed', 'single', '2025-11-09T18:57:41.858Z', '2025-11-09T18:57:41.858Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Generics', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Type guards', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Union types', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Tuple', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Type constraint', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Number of arrays', false);

-- Poll 411: For this question to score, how would you specify an array o...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('For this question to score, how would you specify an array of one or more?', 182, NULL, NULL, 'closed', 'single', '2023-03-09T08:33:06.781Z', '2023-03-09T08:33:06.781Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type OneOrMore<T> = Array<T> & Array.length > 0;', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'This is not possible in typescript (yet) but they will add it in TS 5.0', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type OneOrMore<T> = { 0: T } & Array<T>;', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'type OneOrMore<T> = { length: 1 } & Array<T>;', false);

-- Poll 412: In CSS, for readability it’s important to have vertical spac...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, for readability it’s important to have vertical spacing for text inbetween, what property do you use that make your text look neat and clean?', 56, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.858Z', '2025-11-09T18:57:41.858Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'height', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'padding', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'margin', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'flexbox', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'grid', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'gap', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'text-space', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'line-gap', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'You can''t control it, it depends on the font', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'justify-content: space-between', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'line-height', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'CSS is unable to do this, but in JS there is a way where you can calculate the height of each character and check line by line to determine the distance', false);

-- Poll 413: Polls including the W3C is what you sometimes see, what exac...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Polls including the W3C is what you sometimes see, what exactly is the purpose of the W3C?', 278, NULL, NULL, 'closed', 'single', '2023-04-07T07:13:51.578Z', '2023-04-07T07:13:51.578Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It is just a bingo club', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It maintains the whole web: all libraries/frameworks in existance', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It maintains a helpdesk as first line of contact for people who browse the web and may need help when they run into problems', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a dutch company that places toilets, founded by 3 brothers', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It maintains web standards and creates them', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a company that invented the world wide web', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s the company that specializes in web security', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It’s a hardware company that specializes in chips that power the web', false);

-- Poll 414: We have methods to have out data grouped, but what can we ma...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('We have methods to have out data grouped, but what can we make to have it deduped?', 299, 'const array = [1, 2, 2, 3, 3, 4, 5, 5];', NULL, 'closed', 'multiple', '2023-07-25T07:17:07.224Z', '2023-07-25T07:17:07.224Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[...new Set(array)];', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Array.dedupe(array);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'for (var i;) {\n\n   i++;\n   d = e;\n   break if e === d;\n}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array.reduceDuplicates(array);', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'array.filter((element, index, arr) => {\n  return arr.indexOf(element) === index;\n});', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A longstanding bug in JavaScript is that arrays can’t contain duplicate keys, JavaScript will automatically remove them by default. This is fixed with TypeScript tuples', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Object.duplicateKeys(array);', false);

-- Poll 415: In HTML, when you suggest a poll you'll get crediting, what ...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, when you suggest a poll you''ll get crediting, what element can be used to allow multiline text editing? ', 148, NULL, NULL, 'closed', 'single', '2022-11-10T08:30:37.703Z', '2022-11-10T08:30:37.703Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input multiline />', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<textarea multiline /> ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<textarea>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="text" />', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="multiline">', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type="text name="line1" />\n<input type="text name="line2" />\n<input type="text name="line3" />\n<input type="text name="line4" />\n// expand as needed ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<input type=“text”>\n    <p>line 1</p>\n    <p>line 2</p>\n    <p>line 3</p>\n</input>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<span>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'By using CSS grid on input fields so you can control the lines of text', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'npm install wyswyg-editor', false);

-- Poll 416: In JS, the `.sort()` function sorts values in arrays alphabe...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, the `.sort()` function sorts values in arrays alphabetically, what is the output of the following code unexpectedly? ', 5, ' [25, 10, 78, 100, 35].sort();', NULL, 'closed', 'single', '2025-11-09T18:57:41.858Z', '2025-11-09T18:57:41.858Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[10, 25, 35, 78, 100]', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[100, 78, 35, 25, 10]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '“10, 25, 35, 78, 100” ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '[NaN, NaN, NaN, NaN, NaN]', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '`.sort()` is not a function on internal array types', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'There is no one size-fits answer here, because every browser engine deals with this differently. In the newest ES the sort() function will be deprecated.', false);

-- Poll 417: These TypeScript statements might be a fight, answer this po...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('These TypeScript statements might be a fight, answer this poll and points will be awarded when you get this right!', 211, NULL, NULL, 'closed', 'single', '2023-07-05T13:02:47.541Z', '2023-07-05T13:02:47.541Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'ts');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"never" is exactly the same as “unknown”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Intersection types van be compared with "or" (either one or the other) and is defined with "|" ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '"type A = number extends 64 ? true : false" => "A" returns false ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Unknown is the most flexible type in TypeScript', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'TypeScript runs at runtime in the browser ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Type guards are a way to defend on what area of the code you and your colleagues can type ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'TypeScript also works in .js files ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Double float is an existing type in TypeScript', false);

-- Poll 418: In JS, closures are there, what do you know about it, can yo...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS, closures are there, what do you know about it, can you share? ', 35, NULL, NULL, 'closed', 'single', '2025-11-09T18:57:41.858Z', '2025-11-09T18:57:41.858Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Closures are a way to end a function', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Closures are syntactical sugar for prototype in JS', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Because closures was released as experiment, it should be used sparingly since they are heavy for performance up until now. The W3C is still looking for ways to improve this', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Closures provide the ability to store variables and use it after it’s execution', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Closures were introduced with ES6 because many developers proposed this feature ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A closure is the init function from a class', false);

-- Poll 419: With JSON we structure our data a lot, but what is JSON not?...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('With JSON we structure our data a lot, but what is JSON not?', 387, NULL, NULL, 'closed', 'multiple', '2023-11-27T08:49:59.714Z', '2023-11-27T08:49:59.714Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'general-frontend');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Language independent', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A programming language', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'An executable', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'An ORM ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Based on JavaScript object syntax', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A boys name ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A lightweight data format ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Only for web', true);

-- Poll 420: This poll app is turning into a game, how would you define a...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('This poll app is turning into a game, how would you define a function without a name?', 289, NULL, NULL, 'closed', 'multiple', '2023-05-03T07:51:22.118Z', '2023-05-03T07:51:22.118Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'anon () => {}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'const anonymous = () => {}', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '() => {}', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'function() {}', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'function anonymous() {}', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'private function addPolls() { }', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Not possible, all functions have a name ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'anonymous function() {}', false);

-- Poll 421: A single level up the DOM you sometimes want to traverse, wh...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('A single level up the DOM you sometimes want to traverse, what is the answer to this poll you read in verse? ', 365, NULL, NULL, 'closed', 'single', '2023-10-23T08:18:30.808Z', '2023-10-23T08:18:30.808Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'element.up()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'element.nextSibling()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'element.parent()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'element.traverse({ direction: "up", level: "1" }) ', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'element.parentNode()', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'element.levelUp()', false);

-- Poll 422: When styling your spreadsheet table cell, how to style the b...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('When styling your spreadsheet table cell, how to style the borders of cell with content well?', 410, NULL, NULL, 'closed', 'single', '2024-03-19T08:59:47.881Z', '2024-03-19T08:59:47.881Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'td:has-content { border: black 1px solid; }\ntd:no-content { border: grey 1px solid; }', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'td { border: black 1px solid; }\ntd:has(:content) { border: grey 1px solid; }', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'td { border: black 1px solid; }\ntd:empty { border: grey 1px solid; }', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'td { border: black 1px solid; }\ntd:no-children { border: grey 1px solid; }', false);

-- Poll 423: Landmark elements, can you chart? Name them all, show your s...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('Landmark elements, can you chart? Name them all, show your smart!', 366, NULL, NULL, 'closed', 'multiple', '2024-01-22T09:56:38.159Z', '2024-01-22T09:56:38.159Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<main> ', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<landmark>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<mark>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<p>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<section>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<div>\n', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<span>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<nav>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<header>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<footer>', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<a>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<aside>', true);

-- Poll 424: In CSS, which unit you use in development, is relative to th...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In CSS, which unit you use in development, is relative to the font-size of the parent element?', 9, NULL, NULL, 'closed', 'multiple', '2025-11-09T18:57:41.858Z', '2025-11-09T18:57:41.858Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'css');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'rems', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'px', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'vw / vh', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'vmin / vmax', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ems', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'cm', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '%', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'ch', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'fr', false);

-- Poll 425: In HTML, we often display numbers as price, what tag can you...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In HTML, we often display numbers as price, what tag can you use, would you advise?', 159, NULL, NULL, 'closed', 'single', '2022-11-23T09:06:19.467Z', '2022-11-23T09:06:19.467Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'html');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<currency>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<money>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<price>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<prize>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<monetary>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<coin>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<investment>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<doekoe>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'There is no semantic tag for this', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<gold>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<galleon>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<bitcoin>', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '<pricetag>', false);

-- Poll 426: In JS we have the Date.now() in our use, what does calling t...
INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES
  ('In JS we have the Date.now() in our use, what does calling this value produce?', 284, NULL, NULL, 'closed', 'single', '2023-05-01T07:31:26.547Z', '2023-05-01T07:31:26.547Z', '65ad226e-e3c1-4e7f-a96d-a84156589733', 'js');

-- Options for the above poll
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A set of random numbers', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'A string containing todays date', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'Todays date in milliseconds since january 1970', true);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns a date object containing the current day, week, month and year, like: const { day, week, month, year } = Date.now()', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns NaN', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns a realtime updating date updating each millisecond, hence Date ”now”', false);
INSERT INTO polls_options (poll_id, option, correct) VALUES
  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), 'It returns "[object Date]" as string representation from a date object  ', false);

COMMIT;

-- Migration complete!
-- Generated 426 polls with their options