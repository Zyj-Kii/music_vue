export default function (target) {
  const navigator = window.navigator
  return navigator.userAgent.indexOf(target) !== -1
}
