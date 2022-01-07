import {tokenTypes} from './html.js';

const svgNamespace = 'http://www.w3.org/2000/svg';

const weakMap = new WeakMap();

const readMeta = (target) => {
  let result = weakMap.get(target);

  if (!result) {
    result = {};

    weakMap.set(target, result);
  }

  return result;
};

const addListener = (rootNode, type) => {
  rootNode.addEventListener(
    type,
    (e) => {
      const map = weakMap.get(e.target);

      map?.[type]?.(e);
    },
    {capture: true}
  );
};

const attrToPropMap = {
  class: 'className',
  for: 'htmlFor',
};

export const morph = (
  target,
  next,
  {
    variables,
    existing = true,
    same = true,
    rootNode = target.ownerDocument,
  } = {}
) => {
  const ownerDocument = target.ownerDocument;

  const isSvg = next.tag === 'svg' || target.namespaceURI === svgNamespace;

  if (next.view) {
    const meta = readMeta(target);

    same = next.view === meta.view;

    if (next.dynamic || !existing || !same) {
      meta.view = next.view;

      variables = next.variables;
    } else {
      return;
    }
  }

  for (
    let attributeIndex = 0, length = next.attributes.length;
    attributeIndex < length;
    attributeIndex++
  ) {
    const attribute = next.attributes[attributeIndex];

    if (existing && same && attribute.type !== tokenTypes.variable) {
      break;
    }

    let value = attribute.value;

    if (attribute.type === tokenTypes.variable) {
      value = variables[value];
    }

    let key = attribute.key;

    const firstChar = key.charAt(0);
    const hasDash = ~key.indexOf('-');

    if (firstChar === ':' || firstChar === '@') {
      key = key.substring(1);
    }

    if (firstChar === ':' && !hasDash && !isSvg) {
      key = attrToPropMap[key] ?? key;

      if (value != null && target[key] !== value) {
        target[key] = value;
      }
    } else if (firstChar === '@') {
      const meta = readMeta(target);

      meta[key] = value;

      if (value != null) {
        const listeners = readMeta(rootNode);

        if (!listeners[key]) {
          listeners[key] = true;

          addListener(rootNode, key);
        }
      }
    } else if (value == null) {
      target.removeAttribute(key);
    } else if (value != null && target.getAttribute(key) !== value) {
      target.setAttribute(key, value);
    }
  }

  let childNode;

  let childIndex = 0;

  if (existing && same) {
    childIndex = next.offset;

    childNode = target.childNodes[childIndex];
  } else {
    childNode = target.firstChild;
  }

  for (const length = next.children.length; childIndex < length; childIndex++) {
    let child = next.children[childIndex];

    if (child.type === tokenTypes.variable) {
      child = variables[child.value];
    }

    let nextChild;
    let i;

    if (!Array.isArray(child)) {
      nextChild = child;
    } else {
      i = 0;

      nextChild = child[i];
    }

    while (nextChild != null) {
      let mode = !existing || childNode == null ? 2 : !same ? 1 : 0;

      let currentChild = childNode;

      if (!nextChild?.type || nextChild.type === tokenTypes.text) {
        if (!mode && childNode.nodeType !== 3) {
          mode = 1;
        }

        const value = nextChild?.value ?? nextChild ?? '';

        if (mode) {
          currentChild = ownerDocument.createTextNode(value);
        } else if (childNode.data !== value) {
          childNode.data = value;
        }
      } else {
        if (
          !mode &&
          (childNode.nodeType !== 1 ||
            childNode.nodeName.toLowerCase() !== nextChild.tag)
        ) {
          mode = 1;
        }

        if (mode) {
          currentChild =
            isSvg || nextChild.tag === 'svg'
              ? ownerDocument.createElementNS(svgNamespace, nextChild.tag)
              : ownerDocument.createElement(nextChild.tag);
        }

        if (nextChild.view || mode || nextChild.dynamic) {
          const existing = !mode;

          morph(currentChild, nextChild, {variables, existing, same, rootNode});
        }
      }

      if (mode === 2) {
        target.appendChild(currentChild);
      } else if (mode === 1) {
        target.replaceChild(currentChild, childNode);
      }

      childNode = currentChild?.nextSibling;

      nextChild = i != null ? child[++i] : null;
    }
  }

  let nextChild;

  while (childNode) {
    nextChild = childNode?.nextSibling;

    target.removeChild(childNode);

    childNode = nextChild;
  }
};
