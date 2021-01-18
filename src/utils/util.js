export function isDef (v){
  return v !== undefined && v !== null
}


export function remove (arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

export function isRegExp (v) {
  return _toString.call(v) === '[object RegExp]'
}


export function checkNumber(val, obj) {
  obj[val] = obj[val].replace(/^\D*([0-9]\d*\.?\d{0,3})?.*$/, "$1");
}

export function checkNumberAgain(val, obj) {
  if (obj[val]) {
    if (Number(obj[val]) === 0) {
      this.$message.warning("非法数值");
      obj[val] = null;
      return;
    }
    obj[val] = obj[val].replace(/^\D*([0-9]\d*\.?\d{0,3})?.*$/, "$1");
  }
}

const _toString = Object.prototype.toString
