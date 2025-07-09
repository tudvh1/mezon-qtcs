export const extractMessageContent = (messageContent: string): [string | false, string[]] => {
  const args = messageContent.replace(/\n/g, ' ').slice('*'.length).trim().split(/ +/)
  if (args.length > 0) {
    return [args.shift()?.toLowerCase() || false, args]
  } else {
    return [false, []]
  }
}

export const extractButtonId = (buttonId: string): [string | false, string[]] => {
  const args = buttonId.split('_')
  if (args.length > 0) {
    return [args.shift()?.toLowerCase() || false, args]
  } else {
    return [false, []]
  }
}

export const randomArrayItem = <T>(arr: T[], except?: T[]): T => {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('Array is empty')
  }

  const filteredArr = except ? arr.filter(item => !except.includes(item)) : arr

  if (filteredArr.length === 0) {
    throw new Error('No items available after excluding specified items')
  }

  const randomIndex = Math.floor(Math.random() * filteredArr.length)
  return filteredArr[randomIndex]
}

export const randomMultipleTimes = <T>(arr: T[], times: number = 100, except?: T[]): T => {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('Array is empty')
  }

  const filteredArr = except ? arr.filter(item => !except.includes(item)) : arr

  if (filteredArr.length === 0) {
    throw new Error('No items available after excluding specified items')
  }

  const countMap = new Map<T, number>()

  filteredArr.forEach(item => countMap.set(item, 0))

  for (let i = 0; i < times; i++) {
    const randomItem = randomArrayItem(filteredArr)
    countMap.set(randomItem, (countMap.get(randomItem) || 0) + 1)
  }

  let maxCount = 0
  let mostFrequentItem: T = filteredArr[0]

  countMap.forEach((count, item) => {
    if (count > maxCount) {
      maxCount = count
      mostFrequentItem = item
    }
  })

  return mostFrequentItem
}

export const randomInt = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const makeStrikethroughString = (text: string) => {
  return text
    .split('')
    .map(c => c + '\u0336')
    .join('')
}

export const formatPrice = (price: number | string) => {
  let numericPrice: number

  if (typeof price === 'string') {
    const extractedNumber = price.replace(/[^\d.,]/g, '').replace(',', '.')
    numericPrice = parseFloat(extractedNumber) || 0
  } else {
    numericPrice = price
  }

  return numericPrice.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
}
