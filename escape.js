const obj = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
};
const valuesArr = Object.values(obj);
const keysStr = Object.keys(obj).join('');
const regex = new RegExp(keysStr, 'g');

export const escape = (str) => {
  try {
    return str.replace(regex, (match) => valuesArr[keysStr.indexOf(match)]);
  } catch {
    return str;
  }
};
