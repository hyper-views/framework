import {escape} from './escape.js';

const selfClosing = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

export const stringify = (next) => {
  let result = '';

  if (next.type === 8) {
    for (let i = 0; i < next.children.length; i++) {
      result += stringify({variables: next.variables, ...next.children[i]});
    }

    return result;
  }

  const {name, attributes, children, variables} = next;

  result += `<${name}`;
  const isSelfClosing = selfClosing.includes(name);

  const reducedAttributes = [];

  for (let i = 0, length = attributes.length; i < length; i++) {
    const attribute = attributes[i];

    if (attribute.key.startsWith('@') || attribute.key.startsWith(':')) {
      continue;
    }

    reducedAttributes.push(attribute);
  }

  for (const attr of reducedAttributes) {
    let value = attr.value;

    if (attr.type === 1) {
      value = variables[value];
    }

    if (value === true) {
      result += ` ${attr.key}`;
    } else if (value !== false && value != null) {
      result += ` ${attr.key}="${escape(value)}"`;
    }
  }

  result += '>';

  if (!isSelfClosing) {
    let i = 0;

    const descendants = [];

    for (let i = 0, length = children.length; i < length; i++) {
      let child = children[i];

      if (child?.type === 1) {
        child = variables[child.value];
      }

      if (!Array.isArray(child)) {
        child = [child];
      }

      for (let c of child) {
        c ??= '';

        descendants.push(c);
      }
    }

    while (i < descendants.length) {
      const child = descendants[i];

      if (child) {
        if (child.type === 8) {
          for (let i = 0; i < child.children.length; i++) {
            result += stringify({
              variables: child.variables,
              ...child.children[i],
            });
          }
        } else if (child.type) {
          switch (child.type) {
            case 7:
              result += name !== 'style' ? escape(child.value) : child.value;
              break;

            case 6:
              result += stringify({
                variables: child.view ? child.variables : variables,
                ...child,
              });
              break;
          }
        } else {
          result += name !== 'style' ? escape(child) : child;
        }
      }

      i++;
    }

    result += `</${name}>`;
  }

  return result;
};
