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

  if (next.views) {
    for (let i = 0; i < next.views.length; i++) {
      result += stringify({variables: next.variables, ...next.views[i]});
    }

    return result;
  }

  const {tag, attributes, children, variables} = next;

  result += `<${tag}`;
  const isSelfClosing = selfClosing.includes(tag);

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

    if (attr.type === 'variable') {
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

      if (child?.type === 'variable') {
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
        if (child.views) {
          if (child.views) {
            for (let i = 0; i < child.views.length; i++) {
              result += stringify({
                variables: child.variables,
                ...child.views[i],
              });
            }
          }
        } else if (child.type) {
          switch (child.type) {
            case 'text':
              result += tag !== 'style' ? escape(child.value) : child.value;
              break;

            case 'node':
              result += stringify({
                variables: child.view ? child.variables : variables,
                ...child,
              });
              break;
          }
        } else {
          result += tag !== 'style' ? escape(child) : child;
        }
      }

      i++;
    }

    result += `</${tag}>`;
  }

  return result;
};
