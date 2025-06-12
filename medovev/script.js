// Based on:
// https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/
// https://phuoc.ng/collection/mirror-a-text-area/

function process(text, perfect) {
    let normalized = ''
    const positions = {}
    if (perfect)
        text = text.replace(/[\s-\u05be\u2013\u2014]/g, ' ')
    for (let i = 0; i < text.length; i++) {
        const char = text[i]
        while (perfect && char == ' ' && text[i + 1] == ' ')
            i++
        if (char.match(/[\p{L}\p{N}]/u) || perfect && char == ' ') {
            normalized += char.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/ך/, 'כ').replace(/ם/, 'מ').replace(/ן/, 'נ').replace(/ף/, 'פ').replace(/ץ/, 'צ')
            positions[normalized.length - 1] = i
        }
    }
    return [normalized.trim(), positions]
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

const abc = 'abcdefghijklm' + 'אבגדהוזחטיכ  למנסעפצקרשת' + 'nopqrstuvwxyz'
const comp = Object.fromEntries([...abc].map((c, i) => [c, abc[abc.length - 1 - i]]))

function check_bio(text) {
    const n = text.length
    for (let i = 0; i < n / 2 | 0; i++)
        if (text[i] != comp[text[n - 1 - i]])
            return false
    return true
}

function update(text) {
    text = new DOMParser().parseFromString(text.replaceAll('<', '\uff1c'), 'text/html').documentElement.textContent.replaceAll('<', '\uff1c')
    editing.value = text.replaceAll('\uff1c', '<')

    if (text[text.length-1] == '\n')
        text += ' '

    const words = text.trim().split(/[\s\u2013\u2014]+|(?<=\p{L}{2,})[-\u05be]/u).filter(w => w.match(/[\p{L}\p{N}]/u)).length

    const [normalized, positions] = process(text)
    const n = normalized.length
    const mid = n / 2 | 0
    let marks = []
    let is_palindrome = ''
    let bio = false
    if (n) {
        marks = [[(n-1) / 2 | 0, 'middle']]
        if (mid != marks[0][0])
            marks.unshift([mid, 'middle'])
        is_palindrome = 'פלינדרום'
        bio = check_bio(normalized)
        if (bio)
            is_palindrome = 'ביו־' + is_palindrome
        else {
            const inner = check_inner(normalized)
            if (inner) {
                if (inner[0] == mid)
                    marks = marks.map(([pos, cls]) => [pos, cls + ' inner'])
                else
                    marks = [[inner[0], 'inner'], ...marks, [inner[1], 'inner']]
                const outer = check_outer(normalized)
                if (outer[0] != inner[0])
                    marks = [[outer[0], 'outer'], ...marks, [outer[1], 'outer']]
                is_palindrome = ''
            }
        }
        if (is_palindrome) {
            const [normalized, positions] = process(text, true)
            if (!check_inner(normalized) || check_bio(normalized))
                is_palindrome += ' מושלם'
        }
    }
    marks.forEach(([pos, cls]) => text = text.slice(0, positions[pos]) + `<mark class="${cls}">${text[positions[pos]]}</mark>` + text.slice(positions[pos] + 1))
    highlighting.innerHTML = text.replaceAll('\uff1c', '&lt;')
    counts.innerHTML = `מילים:&nbsp;<span>${words.toLocaleString()}</span>\t\tאותיות:&nbsp;<span>${normalized.length.toLocaleString()}</span>`
    palindrome.textContent = is_palindrome
    palindrome.classList.toggle('bio', bio)
    pangram.textContent = normalized.length == 22 && new Set(normalized).size == 22 && normalized.match('[א-ת]') ? 'פנגרמה מושלמת (עברית)' : ''
}

function sync_scroll(elem) {
    highlighting.scrollTop = elem.scrollTop
    highlighting.scrollLeft = elem.scrollLeft
}