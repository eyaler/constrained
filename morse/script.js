const add_prefix_article = true
const add_prefix_prep = true
const rarest_count = 1000
const rare_count = 2000
const single_color = 'white'
const rarest_color = '#ff9999'
const rare_color = '#ffcccc'
const limit = 0
const punct = ',.?!'
const punct_regex = new RegExp(` (?=[${punct}])`, 'g')

const morse = {
    'a': '·-',
    'b': '-···',
    'c': '-·-·',
    'd': '-··',
    'e': '·',
    'f': '··-·',
    'g': '--·',
    'h': '····',
    'i': '··',
    'j': '·---',
    'k': '-·-',
    'l': '·-··',
    'm': '--',
    'n': '-·',
    'o': '---',
    'p': '·--·',
    'q': '--·-',
    'r': '·-·',
    's': '···',
    't': '-',
    'u': '··-',
    'v': '···-',
    'w': '·--',
    'x': '-··-',
    'y': '-·--',
    'z': '--··',
    'ä': '·-·-',
    'ö': '---·',
    'š': '----',
    'ü': '··--',
    'א': '·-',
    'ב': '-···',
    'ג': '--·',
    'ד': '-··',
    'ה': '---',
    'ו': '·',
    'ז': '--··',
    'ח': '····',
    'ט': '··-',
    'י': '··',
    'כ': '-·-',
    'ל': '·-··',
    'מ': '--',
    'נ': '-·',
    'ס': '-·-·',
    'ע': '·---',
    'פ': '·--·',
    'צ': '·--',
    'ק': '--·-',
    'ר': '·-·',
    'ש': '···',
    'ת': '-',
    '1': '·----',
    '2': '··---',
    '3': '···--',
    '4': '····-',
    '5': '·····',
    '6': '-····',
    '7': '--···',
    '8': '---··',
    '9': '----·',
    '0': '-----',
    '?': '··--·',
}

Object.entries(morse).filter(([k, v]) => v.match(/[^·-]/)).forEach(([k, v]) => alert(`Bad ${k}: ${v}`))
const reverse_morse = Object.fromEntries(Object.entries(morse).map(([k, v]) => [v, k]))
const selects = {}
punct.split('').forEach(char => {
    selects[char] = document.createElement('select')
    selects[char].appendChild(document.createElement('option')).textContent = char
})
let min_count = Infinity
let max_count = 0

function before_unload_handler(event) {
    event.preventDefault()
}

output.addEventListener('change', () => {
    if (output.textContent)
        addEventListener('beforeunload', before_unload_handler)
    else
        removeEventListener('beforeunload', before_unload_handler)
})

function join(elem) {
    return [...main.querySelectorAll('.line')].map(line => [...line.querySelectorAll(elem)].map(e => e.value).join(' ').replace(punct_regex, '')).join('\n')
}

main.addEventListener('change', () => {
    output.textContent = join('select')
    output.dispatchEvent(new Event('change'))
})

output.addEventListener('copy', event => {  // With no selection - Copy all
    if (getSelection().isCollapsed) {
        event.preventDefault()
        event.clipboardData.setData('text/plain', output.textContent)
    }
})

main.addEventListener('copy', event => {  // With no selection - Copy all
    if (event.target.selectionStart == event.target.selectionEnd) {
        event.preventDefault()
        event.clipboardData.setData('text/plain', join('input'))
    }
})

function paste_input(text, word, allow_single) {
    if (word == output || !main.querySelector('.word'))
        return
    text = text.trim().replace(/[ \t\xa0]+/g, ' ').replace(/\s*[\n\r]+\s*/g, '\n')
    if (!text.match(/\S\s\S/) && !allow_single)
        return
    while (!word.classList.contains('word'))
        word = word.querySelector('.word') || word.parentElement
    let line = word.parentElement
    while (word.nextElementSibling)
        word.nextElementSibling.remove()
    while (line.nextElementSibling)
        line.nextElementSibling.remove()
    text.split('\n').forEach((text_line, i) => {
        if (i) {
            line = add_line()
            word = line.firstChild
        }
        text_line.split(' ').forEach((text_word, j) => {
            if (j)
                word = add_word(line)
            word.firstChild.value = text_word
            word.firstChild.dispatchEvent(new Event('change', {bubbles: true}))
        })
    })
    return true
}

document.addEventListener('paste', event => {
    if (paste_input(event.clipboardData.getData('text/plain'), document.activeElement))
        event.preventDefault()
})

function add_dagesh(word) {
    if ('אהחערפ'.includes(word[0]))
        return word
    return word.replace(/^([א-ת])\u05bc?/, '$1\u05bc')
}

function add_word(line, current) {
    const word = line.insertBefore(document.createElement('div'), current?.nextElementSibling)
    word.className = 'word'
    const input = word.appendChild(document.createElement('input'))
    const selectors = word.appendChild(document.createElement('div'))

    input.addEventListener('keydown', event => {
        if (input.value && event.key == 'Tab' && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && !event.getModifierState?.('AltGraph') && !input.nextElementSibling.firstChild) {
            input.dispatchEvent(new Event('change'))
            input.dataset.skip_change = 1
        } else if (event.key == 'Enter'
            || ['ArrowDown', 'ArrowUp'].includes(event.key) && !event.ctrlKey && !event.metaKey
            || ['ArrowLeft', ' '].includes(event.key) && input.selectionStart == input.value.length
            || (event.key == 'ArrowRight' || event.key == 'Backspace' && (word.previousElementSibling || line.previousElementSibling)) && !input.selectionEnd) {
            event.preventDefault()
            let elem
            if (['ArrowUp', 'ArrowRight', 'Backspace'].includes(event.key))
                if (event.key == 'ArrowUp' || !word.previousElementSibling) {
                    elem = line.previousElementSibling || main.lastChild
                    if (event.key == 'ArrowUp')
                        elem = elem.firstChild
                    else
                        elem = elem.lastChild
                } else
                    elem = word.previousElementSibling
            else if (['Enter', 'ArrowDown'].includes(event.key) || event.key == 'ArrowLeft' && !word.nextElementSibling) {
                const line_has_word = line.firstChild.firstChild.value
                if (event.key == 'Enter' && line_has_word)
                    add_line(line)
                if (event.key != 'Enter' || line_has_word)
                   elem = (line.nextElementSibling || main.firstChild).firstChild
            } else {
                if (event.key == ' ' && input.value)
                    add_word(line, word)
                if (event.key != ' ' || input.value)
                    elem = word.nextElementSibling || main.firstChild.firstChild
            }

            elem?.firstChild.focus()
            if (['ArrowLeft', ' '].includes(event.key))
                document.activeElement.selectionEnd = 0
            else if (['ArrowRight', 'Backspace'].includes(event.key))
                document.activeElement.selectionStart = document.activeElement.value.length
        }
    })

    input.addEventListener('change', () => {
        if (input.dataset.skip_change) {
            delete input.dataset.skip_change
            return
        }
        const chars = input.value.replace(/ך/g, 'כ').replace(/ם/g, 'מ').replace(/ן/g, 'נ').replace(/ף/g, 'פ').replace(/ץ/g, 'צ').split('').map(char => reverse_morse[morse[char]] || char).filter(char => char in selects)
        chars.forEach((char, i) => {
            const current = selectors.children[i]
            if (current?.name == char)
                return
            const select = selects[char].cloneNode(true)
            select.name = char
            if (selects[char].options.length == 1)
                select.style.backgroundColor = single_color
            else if (selects[char].options.length <= rarest_count && max_count > rarest_count)
                select.style.backgroundColor = rarest_color
            else if (selects[char].options.length <= rare_count && min_count <= rarest_count && max_count > rare_count)
                select.style.backgroundColor = rare_color
            select.addEventListener('keydown', event => {
                if (event.key == 'Tab' && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && !event.getModifierState?.('AltGraph') && !select.nextElementSibling && !word.nextElementSibling && !line.nextElementSibling)
                    add_word(line)
                else if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
                    event.preventDefault()
                    const all_selectors = main.querySelectorAll('select')
                    all_selectors[([...all_selectors].indexOf(select) + (event.key == 'ArrowLeft' ? 1 : -1) + all_selectors.length) % all_selectors.length].focus()
                } else if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                    event.preventDefault()
                    select.selectedIndex = (select.selectedIndex + (event.key == 'ArrowDown' ? 1 : -1) + select.options.length) % select.options.length
                    select.dispatchEvent(new Event('change', {bubbles: true}))
                }
            })
            if (current)
                current.replaceWith(select)
            else
                selectors.appendChild(select)
        })
        while (selectors.childElementCount > chars.length)
            selectors.lastChild.remove()
    })

    input.addEventListener('blur', () => {
        if (main.querySelectorAll('.word').length > 1 && !input.value) {
            word.remove()
            if (!line.childElementCount)
                line.remove()
        }
    })

    return word
}

function add_line(current) {
    const line = main.insertBefore(document.createElement('div'), current?.nextElementSibling)
    line.className = 'line'
    add_word(line)
    return line
}

function add_first_word() {
    add_line().firstChild.firstChild.focus()
}

fetch('morse.json').then(response => response.json()).then(morse_words_types => {
    const morse_words = Object.fromEntries(Object.entries(morse_words_types).map(([k, v]) => [k, Object.keys(v)]))

    function extend_dict(char, new_words) {
         morse_words[char] = morse_words[char].concat(new_words.filter(word => !morse_words[char].includes(word)))
    }

    Object.entries(reverse_morse).forEach(([code, char]) => {
        if (!morse_words[char])
            morse_words[char] = []
        if ((add_prefix_article || add_prefix_prep) && code.length > 1) {
            const tail_char = reverse_morse[code.slice(1)]
            let words
            if (tail_char in morse_words_types)
                words = Object.entries(morse_words_types[tail_char]).filter(([word, type]) => type && !word.match(/[ \u05be]/)).map(([word]) => word)
            if (words) {
                morse_words[char].push('')  // For <hr>
                if (code[0] == '-') {
                    if (add_prefix_article)
                        extend_dict(char, words.filter(word => morse_words_types[tail_char][word] == 2 && !word.match(/^[החע]\u05b8/)).map(word => 'ה' + ('ארע'.includes(word[0]) ? '\u05b8' : '\u05b7') + add_dagesh(word)))
                    if (add_prefix_prep)
                        extend_dict(char, words.filter(word => word.match(/^[אהחע]\u05b2/)).map(word => 'לַ' + word))
                } else if (add_prefix_prep) {
                    extend_dict(char, words.filter(word => !'אהחער'.includes(word[0])).map(word => 'מִ' + add_dagesh(word)))
                    extend_dict(char, words.filter(word => word.match(/^[א-טכ-ת]\u05bc?\u05b0/)).map(word => 'לִ' + word))
                    extend_dict(char, words.filter(word => word.startsWith('יְ')).map(word => 'לִי' + word.slice(1)))
                }
            }
        }
        if (limit)
            morse_words[char] = morse_words[char].slice(0, limit)
        const len = morse_words[char].length
        min_count = Math.min(min_count, len)
        max_count = Math.max(max_count, len)
        console.log(char, len)
        selects[char] = document.createElement('select')
        morse_words[char].forEach(word => selects[char].appendChild(document.createElement(word ? 'option' : 'hr')).textContent = word.replace(/ /g, '\u05be'))
    })
    add_first_word()
})