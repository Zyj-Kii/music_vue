function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle (array) {
  let length = array.length
  let _array = array.slice()
  for (let i = 0; i < length; i++) {
    let j = getRandomInt(0, i)
    let t = _array[i]
    _array[i] = _array[j]
    _array[j] = t
  }
  return _array
}
