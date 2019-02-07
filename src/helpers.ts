/**
 * @desc Removes punctuation from an array of strings
 * @param {string} string String to remove punctuation from 
 * @returns {string[]} punctuation-less string array
 */
export function removePunctuation(array: string[]): string[] {
  let newArray: string[] = []
  for(let i = 0; i < array.length; i++) {
    newArray[i] = array[i]      
      .replace(",", "")
      .replace("!", "")
      .replace("?", "")
      .replace(".", "")
      .replace("'", "")
      .replace("\"", "")
      .replace("-", "")
  }
  return newArray
}