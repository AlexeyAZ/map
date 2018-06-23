const getSign = (number) => number >= 0 ? 1 : -1;
const clone = (obj) => {return Array.isArray(obj) ? obj.slice(0) : Object.assign({}, obj)};

const helpers = {
  getSign,
  clone
}

export { clone };
export default helpers;