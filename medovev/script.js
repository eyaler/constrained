// Based on https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/

function process(text) {
  let normalized = ''
  const positions = {}
  for (let i = 0; i < text.length; i++) {
    let char = text[i]
    if (char.match(/[\p{L}\p{N}]/u)) {
      normalized += char.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/כ/, 'ך').replace(/מ/, 'ם').replace(/נ/, 'ן').replace(/פ/, 'ף').replace(/צ/, 'ץ')
      positions[normalized.length - 1] = i
    }
  }
  return [normalized, positions]
}

function check_inner(str) {
  const n = str.length
  const right = n / 2 | 0
  const left = (n-1) / 2 | 0
  for (let i = 0; right + i < n; i++)
    if (str[left - i] !== str[right + i])
      return [right + i, left - i]
}    

function check_outer(str) {
  const n = str.length
  for (let i = 0; i < n / 2 | 0; i++) {
    if (str[i] != str[n - 1 - i])
      return [n - 1 - i, i]
  }
}

function update(text) {
  const decoder = document.createElement('textarea')
  decoder.innerHTML = text
  text = decoder.value
  
  if (text[text.length-1] == '\n')
    text += ' '

  const [normalized, positions] = process(text)
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const chars = normalized.length
  
  let is_palindrome = 'פלינדרום'
  let errors = check_outer(normalized)
  if (errors) {
    is_palindrome = 'לא ' + is_palindrome
    const inner = check_inner(normalized)
    if (inner[0] != errors[0])
        errors.splice(1, 0, ...inner)
    for (const i of errors)
        text = text.slice(0, positions[i]) + `<span>${text[positions[i]]}</span>` + text.slice(positions[i] + 1)
  }
  highlighting_content.innerHTML = text  
  counts.textContent = `מילים: ${words}\t\tאותיות: ${chars}`
  palindrome_status.textContent = is_palindrome
  palindrome_status.classList.toggle('error', !!errors)
}

function sync_scroll(element) {
  highlighting.scrollTop = element.scrollTop
  highlighting.scrollLeft = element.scrollLeft
}