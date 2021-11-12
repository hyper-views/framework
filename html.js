const weakMap = new WeakMap();

const throwAssertionError = (actual, expected) => {
  throw Error(`Expected ${expected}. Found ${actual}.`);
};

export const tokenTypes = {
  variable: 'variable',
  tag: 'tag',
  endtag: 'endtag',
  key: 'key',
  value: 'value',
  node: 'node',
  text: 'text',
  constant: 'constant',
  end: 'end',
};

const TRUE = {
  type: tokenTypes.value,
  value: true,
};

const END = {
  type: tokenTypes.end,
};

const createIsChar = (regex) => (char) => char && regex.test(char);

const isSpaceChar = createIsChar(/\s/);
const isNameChar = createIsChar(/[:@a-zA-Z0-9-]/);
const isQuoteChar = createIsChar(/["']/);

const tokenizer = {
  *tokenize(acc, strs, vlength) {
    let str, i, char;

    const nextChar = () => {
      char = str.charAt(i++);
    };

    for (let index = 0, length = strs.length; index < length; index++) {
      str = strs[index];
      i = 0;

      nextChar();

      let tag = acc.tag;

      while (char) {
        if (!tag) {
          let value = '';

          if (char === '<') {
            let end = false;

            nextChar();

            if (char === '/') {
              end = true;

              nextChar();
            }

            while (isNameChar(char)) {
              value += char;

              nextChar();
            }

            yield {
              type: !end ? tokenTypes.tag : tokenTypes.endtag,
              value,
            };

            tag = value;
          } else {
            while (char && char !== '<') {
              value += char;

              nextChar();
            }

            if (value.trim()) {
              yield {
                type: tokenTypes.text,
                value,
              };
            }
          }
        } else if (isSpaceChar(char)) {
          nextChar();
        } else if (char === '/') {
          nextChar();

          if (char === '>') {
            yield* [
              END,
              {
                type: tokenTypes.endtag,
                value: tag,
              },
            ];

            tag = false;

            nextChar();
          }
        } else if (char === '>') {
          yield END;

          tag = false;

          nextChar();
        } else if (isNameChar(char)) {
          let value = '';

          do {
            value += char;

            nextChar();
          } while (isNameChar(char));

          yield {
            type: tokenTypes.key,
            value,
          };

          if (char === '=') {
            nextChar();

            let quote = '';
            let value = '';

            if (isQuoteChar(char)) {
              quote = char;

              nextChar();

              while (char !== quote) {
                if (char) {
                  value += char;

                  nextChar();
                } else {
                  throwAssertionError('', quote);
                }
              }

              nextChar();

              yield {
                type: tokenTypes.value,
                value,
              };
            } else if (char) {
              throwAssertionError(char, '"');
            }
          } else {
            yield TRUE;
          }
        }
      }

      acc.tag = tag;

      if (index < vlength) {
        yield {
          type: tokenTypes.variable,
          value: index,
        };
      }
    }
  },
};

const parse = (read, parent, tag, variables) => {
  const child = {
    tag,
    dynamic: false,
    type: tokenTypes.node,
    attributes: [],
    children: [],
    offset: null,
  };

  let token;

  while ((token = read())) {
    if (token === END) break;

    if (token.type === tokenTypes.key) {
      const key = token.value;

      token = read();

      const firstChar = key.charAt(0);
      const special = ':' === firstChar || '@' === firstChar;

      let value = token.value;
      let constant = false;

      if (token.type === tokenTypes.value) {
        constant = true;
      } else if (token.type === tokenTypes.variable && !special && !html.dev) {
        value = variables[value];

        constant = true;
      }

      if (constant) {
        child.attributes.push({
          type: tokenTypes.constant,
          key,
          value,
        });
      } else {
        child.dynamic = true;

        child.attributes.unshift({
          type: tokenTypes.variable,
          key,
          value,
        });
      }
    } else {
      throwAssertionError(token.type, tokenTypes.end);
    }
  }

  while ((token = read())) {
    if (token.type === tokenTypes.endtag && token.value === child.tag) {
      break;
    } else if (token.type === tokenTypes.tag) {
      const dynamic = parse(read, child, token.value, variables);

      child.dynamic ||= dynamic;
    } else if (token.type === tokenTypes.text) {
      child.children.push({
        type: tokenTypes.text,
        value: token.value,
      });
    } else if (token.type === tokenTypes.variable) {
      child.dynamic = true;

      child.offset ??= child.children.length;

      child.children.push({
        type: tokenTypes.variable,
        value: token.value,
      });
    }
  }

  if (child.dynamic) {
    parent.offset ??= parent.children.length;
  }

  parent.children.push(child);

  child.offset ??= child.children.length;

  return child.dynamic;
};

let id = 1;

export const html = (strs, ...variables) => {
  let template = weakMap.get(strs);

  if (!template) {
    const acc = {
      tag: false,
    };

    const tokens = tokenizer.tokenize(acc, strs, variables.length);
    const read = () => tokens.next().value;

    const children = [];
    const offset = null;
    let token;

    while ((token = read())) {
      if (token.type === tokenTypes.tag) {
        parse(read, {children, offset}, token.value, variables);
      } else if (token.type === tokenTypes.text && token.value.trim()) {
        throwAssertionError(token.type, tokenTypes.node);
      }
    }

    if (children.length !== 1) {
      throwAssertionError(children.length, 1);
    }

    template = children[0];

    template.view = id++;

    weakMap.set(strs, template);
  }

  return {
    ...template,
    variables,
  };
};

html.dev = false;

export const cache = (result) => {
  if (html.dev) return result;

  result.dynamic = false;

  return result;
};
