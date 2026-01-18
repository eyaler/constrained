const add_prefix_article = true
const add_prefix_prep = true
const rarest_count = 1000
const rare_count = 2000
const error_color = 'red'
const single_color = 'white'
const rarest_color = '#ff9999'
const rare_color = '#ffcccc'
const limit = 0
const special = ',.*'  // Overrides Morse
const split_regex = RegExp(`\\s|(?=[${special}])|(?<=[${special}])`, 'g')
const bad = '\u05b1\u05b3\u05b5\u05b6\u05b9\u05ba\u05bb\u05c7'
const code_regex = RegExp(`[${bad}·-]+`, 'g')
const noncode_regex = RegExp(`[^\\s${special}${bad}·-]+`, 'g')
const nontext_regex = RegExp(`[^\\s${special}\u05b0-\u05ea'"]+|(?<![\u05b0-\u05ea])"|"(?![א-ת])`, 'g')
const punct = special.replace('*', '')
const punct_regex = RegExp(` (?=[${punct}])`, 'g')
const nonpunct_regex = RegExp(`(?<![${punct}]) (?![${punct}])`, 'g')

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
    return [...main.querySelectorAll('.line')].map(line => [...line.querySelectorAll(elem)].map(e => e.value).join(' ').replace(punct_regex, '')).filter(Boolean).join('\n')
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

function fix_whitespace(text) {
    return text.trim().replace(/[ \t\xa0]+/g, ' ').replace(/\s*\n\s*/g, '\n')
}

function paste_output(output_text) {
    output_text = fix_whitespace(output_text)
    paste_input(output_text.replace(/[\u05b0-\u05ea'"]+/g, m => m.match(/[\u05b4\u05b2\u05b7\u05b8]/) ? m : '*').replace(/\u05b4/g, '·').replace(/[\u05b2\u05b7\u05b8]/g, '-').replace(noncode_regex, '').replace(code_regex, m => reverse_morse[m] || '*').replace(nonpunct_regex, ''))
    output_words = output_text.replace(nontext_regex, '').split(split_regex)
    main.querySelectorAll('select').forEach((select, i) => {
        if (![...select.options].some(option => option.value == output_words[i])) {
            select.prepend(document.createElement('option'))
            select.options[0].textContent = output_words[i]
        }
        select.value = output_words[i]
    })

    output.textContent = output_text
    focus_first_word()
}

function paste_input(text, word=main, allow_single=true) {
    if (word == output || !main.querySelector('.word'))
        return
    text = fix_whitespace(text)
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
    if (paste_input(event.clipboardData.getData('text/plain'), document.activeElement, false))
        event.preventDefault()
})

function add_dagesh(word) {
    if ('אהחערפ'.includes(word[0]))
        return word
    return word.replace(/^([א-ת])\u05bc?/, '$1\u05bc')
}

function remove_word(event_or_input) {
    const input = event_or_input.currentTarget || event_or_input
    if (!input.value && main.querySelectorAll('.word').length > 1) {
        input.removeEventListener('blur', remove_word)
        const word = input.parentElement
        const line = word.parentElement
        word.remove()
        if (!line.childElementCount)
            line.remove()
        return true
    }
}

function add_word(line, current) {
    const word = line.insertBefore(document.createElement('div'), current?.nextElementSibling)
    word.className = 'word'
    const input = word.appendChild(document.createElement('input'))
    const selectors = word.appendChild(document.createElement('div'))

    input.addEventListener('keydown', event => {
        let line = word.parentElement
        if (input.value && event.key == 'Tab' && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && !event.getModifierState?.('AltGraph') && !input.nextElementSibling.firstChild) {
            input.dispatchEvent(new Event('change'))
            input.dataset.skip_change = 1
        } else if (['End', 'Home'].includes(event.key) || ['ArrowDown', 'ArrowUp'].includes(event.key) && (event.ctrlKey || event.metaKey))
            if (['End', 'ArrowDown'].includes(event.key)) {
                if (event.key == 'End' && (event.ctrlKey || event.metaKey))
                    line = main.lastChild
                const elem = line.lastChild.firstChild
                elem.focus()
                elem.selectionStart = elem.value.length
            } else {
                if (event.key == 'Home' && (event.ctrlKey || event.metaKey))
                    line = main.firstChild
                const elem = line.firstChild.firstChild
                elem.focus()
                elem.selectionEnd = 0
            }
        else if (event.key == 'Enter'
            || ['ArrowDown', 'ArrowUp'].includes(event.key) && !event.ctrlKey && !event.metaKey
            || ['ArrowLeft', ' '].includes(event.key) && input.selectionStart == input.value.length
            || (event.key == 'ArrowRight' || event.key == 'Backspace' && (word.previousElementSibling || line.previousElementSibling)) && !input.selectionEnd
            || event.key == 'Delete' && input.selectionStart == input.value.length && (word.nextElementSibling || line.nextElementSibling)) {
            event.preventDefault()
            let elem
            const line_had_text = input.value || line.childElementCount > 1
            if (event.key == 'Delete') {
                const next_word = word.nextElementSibling
                elem = next_word || line.nextElementSibling.firstChild
                const removed = remove_word(input)
                if (!removed)
                    elem = null
                if (!next_word && line_had_text) {
                    line.append(...line.nextElementSibling.children)
                    line.nextElementSibling.remove()
                    if (removed)
                        main.dispatchEvent(new Event('change'))
                    else
                        input.dispatchEvent(new Event('change', {bubbles: true}))
                }
            } else if (event.key == 'Backspace' && input.value && !word.previousElementSibling) {
                line.previousElementSibling.append(...line.children)
                line.remove()
                input.focus()
                input.dispatchEvent(new Event('change', {bubbles: true}))
            } else if (['ArrowUp', 'ArrowRight', 'Backspace'].includes(event.key))
                if (event.key == 'ArrowUp' || !word.previousElementSibling) {
                    elem = line.previousElementSibling || main.lastChild
                    if (event.key == 'ArrowUp')
                        elem = elem.firstChild
                    else
                        elem = elem.lastChild
                } else
                    elem = word.previousElementSibling
            else if (['Enter', 'ArrowDown'].includes(event.key) || event.key == 'ArrowLeft' && !word.nextElementSibling) {
                let cr
                if (event.key == 'Enter')
                    if (line_had_text && !event.ctrlKey && !event.metaKey) {
                        const new_line = add_line(line)
                        if (!event.shiftKey) {
                            cr = input.selectionEnd || word.previousElementSibling
                            let line_words = [...line.children]
                            line_words = line_words.slice(line_words.indexOf(word) + (input.selectionEnd > 0 || !input.value && !word.previousElementSibling))
                            if (line_words.length) {
                                input.removeEventListener('blur', remove_word)
                                new_line.replaceChildren(...line_words)
                                input.addEventListener('blur', remove_word)
                                if (!line.childElementCount)
                                    add_word(line).firstChild.focus()
                                input.dispatchEvent(new Event('change', {bubbles: true}))
                            }
                        }
                    } else
                        input.dispatchEvent(new Event('change', {bubbles: true}))
                if (event.key != 'Enter' || cr)
                   elem = (line.nextElementSibling || main.firstChild).firstChild
            } else {
                if (event.key == ' ' && input.value)
                    add_word(line, word)
                if (event.key != ' ' || input.value)
                    elem = word.nextElementSibling || main.firstChild.firstChild
            }

            if (elem) {
                elem.firstChild.focus()
                if (['ArrowLeft', 'Enter', 'Delete'].includes(event.key))
                    document.activeElement.selectionEnd = 0
                else if (['ArrowRight', 'Backspace'].includes(event.key))
                    document.activeElement.selectionStart = document.activeElement.value.length
            }
        }
    })

    input.addEventListener('change', () => {
        if (input.dataset.skip_change) {
            delete input.dataset.skip_change
            return
        }
        const chars = input.value.toLowerCase().replace(/ך/g, 'כ').replace(/ם/g, 'מ').replace(/ן/g, 'נ').replace(/ף/g, 'פ').replace(/ץ/g, 'צ').split('').map(char => reverse_morse[morse[char]] || char).filter(char => char in selects)
        chars.forEach((char, i) => {
            const current = selectors.children[i]
            if (current?.name == char)
                return
            const select = selects[char].cloneNode(true)
            select.name = char
            if (char == '*')
                select.style.backgroundColor = error_color
            else if (selects[char].length == 1)
                select.style.backgroundColor = single_color
            else if (selects[char].length <= rarest_count && max_count > rarest_count)
                select.style.backgroundColor = rarest_color
            else if (selects[char].length <= rare_count && min_count <= rarest_count && max_count > rare_count)
                select.style.backgroundColor = rare_color

            select.addEventListener('keydown', event => {
                const line = word.parentElement
                if (event.key == 'Tab' && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && !event.getModifierState?.('AltGraph') && !select.nextElementSibling && !word.nextElementSibling && !line.nextElementSibling)
                    add_word(line)
                else if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
                    event.preventDefault()
                    const all_selectors = main.querySelectorAll('select')
                    all_selectors[([...all_selectors].indexOf(select) + (event.key == 'ArrowLeft' ? 1 : -1) + all_selectors.length) % all_selectors.length].focus()
                } else if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                    event.preventDefault()
                    select.selectedIndex = (select.selectedIndex + (event.key == 'ArrowDown' ? 1 : -1) + select.length) % select.length
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

    input.addEventListener('blur', remove_word)

    return word
}

function add_line(current) {
    const line = main.insertBefore(document.createElement('div'), current?.nextElementSibling)
    line.className = 'line'
    add_word(line)
    return line
}

function focus_first_word() {
    main.querySelector('input').focus()
}

function add_first_word() {
    add_line()
    focus_first_word()
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

    special.split('').forEach(char => {
        selects[char] = document.createElement('select')
        selects[char].appendChild(document.createElement('option')).textContent = char
    })

    add_first_word()
})