// Based on:
// https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/
// https://phuoc.ng/collection/mirror-a-text-area/


function process(text) {
  let normalized = ''
  const positions = {}
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char.match(/[\p{L}\p{N}]/u)) {
      normalized += char.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/כ/, 'ך').replace(/מ/, 'ם').replace(/נ/, 'ן').replace(/פ/, 'ף').replace(/צ/, 'ץ')
      positions[normalized.length - 1] = i
    }
  }
  return [normalized, positions]
}

function check_inner(text) {
  const n = text.length
  const right = n / 2 | 0
  const left = (n-1) / 2 | 0
  for (let i = 0; right + i < n; i++)
    if (text[left - i] != text[right + i])
      return [right + i, left - i]
}    

function check_outer(text) {
  const n = text.length
  for (let i = 0; i < n / 2 | 0; i++)
    if (text[i] != text[n - 1 - i])
      return [n - 1 - i, i]
}

function update(text) {
  text = new DOMParser().parseFromString(text.replaceAll('<', '\uff1c'), 'text/html').documentElement.textContent.replaceAll('<', '\uff1c')
  editing.value = text.replaceAll('\uff1c', '<')
  
  if (text[text.length-1] == '\n')
    text += ' '

  const [normalized, positions] = process(text)
  const n = normalized.length
  const mid = n / 2 | 0
  let marks = []
  if (n) {
      marks = [[(n-1) / 2 | 0, 'middle']]
      if (mid != marks[0][0])
        marks.unshift([mid, 'middle'])
  }
  let is_palindrome = 'פלינדרום'
  const inner = check_inner(normalized)
  if (inner) {
    is_palindrome = 'לא ' + is_palindrome
    if (inner[0] == mid)
        marks = marks.map(([pos, cls]) => [pos, cls + ' inner'])
    else
        marks = [[inner[0], 'inner'], ...marks, [inner[1], 'inner']]
    const outer = check_outer(normalized)
    if (outer[0] != inner[0])
      marks = [[outer[0], 'outer'], ...marks, [outer[1], 'outer']]
  }
  marks.forEach(([pos, cls]) => text = text.slice(0, positions[pos]) + `<mark class="${cls}">${text[positions[pos]]}</mark>` + text.slice(positions[pos] + 1))
  highlighting.innerHTML = text.replaceAll('\uff1c', '&lt;')
  const words = text.trim().split(/[\s\u2013\u2014]+|(?<=\p{L}{2,})[-\u05be]/u).filter(w => w.match(/[\p{L}\p{N}]/u)).length
  counts.innerHTML = `מילים:&nbsp;${words}\t\tאותיות:&nbsp;${normalized.length}`
  palindrome_status.textContent = is_palindrome
  palindrome_status.classList.toggle('error', !!inner)
}

function sync_scroll(elem) {
  highlighting.scrollTop = elem.scrollTop
  highlighting.scrollLeft = elem.scrollLeft
}