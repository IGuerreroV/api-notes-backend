const palindrome = (String) => {
  return String
    .split('') // divide una cadena en un array de subcadenas
    .reverse() // invierte el orden de los elementos de un array
    .join('') // Une los elementos de un array e una cadena
}

const average = (array) => {
  const reducer = (sum, item) => {
    return sum + item
  }

  return array.length === 0
    ? 0
    : array.reduce(reducer, 0) / array.length
}

module.exports = {
  palindrome,
  average
}
