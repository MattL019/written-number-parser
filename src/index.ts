const numberBank = require('./numberBank')
const { removePunctuation } = require('./helpers')

interface Config {
  dev?: boolean, // show debug messages,
  numberBank?: Object | any, // array of written numbers
  conjunctionWord?: string // word used for connecting numbers e.g 'one hundred AND five' - 'and' by default
}

class NumberParser {
  public config: Config

  constructor(config: Config = {}) {
    // Defualt config
    this.config = {
      dev: false,
      numberBank: numberBank.default,
      conjunctionWord: "and",
      ...config
    }
  }

  /**
   * @desc Parses string for any numbers, written or numerical
   * @param string The string to parse numbers from
   */
  parse(string: string) {
    let subjects = this.extractSubjects(string.toLowerCase())
    return this.parseSubjects(subjects)
  }

  /**
   * @desc Parses an array of strings and transforms them into an array of numbers.
   * @param string[] Array of strings
   * @returns { number[] } Array of numbers
   */
  parseSubjects(subjects: string[]): number[] {
    let numberArray: number[] = []
    
    for (let subjectIndex = 0; subjectIndex < subjects.length; subjectIndex++) {
      let number: number = 0
      let formatted = this.formatSubject(subjects[subjectIndex])

      for (let segmentIndex = 0; segmentIndex < formatted.length; segmentIndex++) {
        let numberSegment: number = 0
        let stringArray = formatted[segmentIndex].split(" ")

        for (let wordIndex = 0; wordIndex < stringArray.length; wordIndex++) {
          let numericalNumber = parseInt(stringArray[wordIndex])
          if (numericalNumber) {
            numberSegment += numericalNumber
            continue
          }

          let singleIndex = this.config.numberBank.single.indexOf(stringArray[wordIndex])
          let doubleIndex = this.config.numberBank.double.indexOf(stringArray[wordIndex])
          let tenIndex = this.config.numberBank.tens.indexOf(stringArray[wordIndex])
          let unitIndex = this.config.numberBank.units.indexOf(stringArray[wordIndex])

          if (singleIndex >= 0) {
            numberSegment += singleIndex
            continue;
          }
    
          if (doubleIndex >= 0) {
            numberSegment += (doubleIndex+11)
            continue
          }
    
          if (tenIndex >= 0) {
            numberSegment += (tenIndex*10)+20
            continue
          }

          if (unitIndex >= 0) {
            let pow: number = unitIndex > 0 ? (unitIndex * 3) : 2
            numberSegment *= Math.pow(10, pow)
            continue
          }
        }

        number += numberSegment
      }
      numberArray.push(number)
    }
    return numberArray
  }

  /**
   * @desc Formats a string into an array ready to be parsed
   * @param string The string to format
   */
  formatSubject(string: string) {
    if(parseInt(string)) return [string]
    let formattedSubject: string[] = []
    let stringArray = string.split(" ").filter(x => x !== this.config.conjunctionWord)
    let unitBank = stringArray.filter(x => this.config.numberBank.units.indexOf(x) >= 0)

    for (let i = 0; i < stringArray.length; i++) {
      formattedSubject.push(stringArray[i])
      let unitIndex = this.config.numberBank.units.indexOf(stringArray[i])
      if (unitIndex >= 0) {
        if (unitBank[1]) {
          let nextUnitIndex = this.config.numberBank.units.indexOf(unitBank[1])
          if (nextUnitIndex > unitIndex) continue
        }
        formattedSubject.push("|")
        unitBank.shift()
      }
    }

    return formattedSubject
      .join(" ")
      .split("|")
      .map(x => x.trim())
      .filter(x => x !== "")
  }

  /**
   * @desc Extracts the number portions of the string
   * @param string String to extract number portions from
   * @return { string[] } Returns an array of strings
   */
  extractSubjects(string: string): string[] {
    return removePunctuation(string.split(" "))
      .map((x: string) => this.isWrittenNumber(x) ? x : "|")
      .join(" ").split("|")
      .map((x: string) => x.trim()
        .split(` ${this.config.conjunctionWord} `)
        .map(x => x.trim())
        .join(" ")
      )
      .filter((x: string) =>
        (x !== " " && x.length > 0 && x !== this.config.conjunctionWord)
      ).map((x: string) => x.trim())
  }

  /**
   * @desc Checks if a string is a written number
   * @param string String to check against
   */
  isWrittenNumber(string: string, notConjunctionWord = false): boolean {
    return (
      this.config.numberBank.single.indexOf(string) >= 0 ||
      this.config.numberBank.double.indexOf(string) >= 0 ||
      this.config.numberBank.tens.indexOf(string) >= 0 ||
      this.config.numberBank.units.indexOf(string) >= 0 ||
      (notConjunctionWord ? false : (string === this.config.conjunctionWord)) ||
      !!parseInt(string)
    )
  }
}

module.exports = NumberParser