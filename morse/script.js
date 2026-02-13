const add_prefix_article = true
const add_prefix_prep = true
const remove_shva_na = true
const rarest_count = 1000
const rare_count = 2000
const error_color = 'red'
const single_color = 'white'
const rarest_color = '#ff9999'
const rare_color = '#ffcccc'
const limit = 0
let special = ',.*'  // Overrides Morse
const default_sep = '.'  // Overrides Morse
const joker = '*'  // Overrides Morse
const dit = '·'
const dah = '-'
const hirik = '\u05b4'
const patah_kamats = '\u05b2\u05b7\u05b8'
const bad = '\u05b1\u05b3\u05b5\u05b6\u05b9\u05ba\u05bb\u05c7'

if (!special.includes(default_sep))
    special += default_sep
if (!special.includes(joker))
    special += joker
const punct = special.replaceAll(joker, '')

const hirik_regex = RegExp(hirik, 'g')
const patah_kamats_regex = RegExp(`[${patah_kamats}]`, 'g')
const nikud_regex = RegExp(`[${hirik}${patah_kamats}]`, 'g')
const sep_string = `(?<=[^$\\s{punct}])[${default_sep}] (?= *[^\\s${punct}])`
const sep_regex = RegExp(sep_string, 'g')
const split_regex = RegExp(`${sep_string}|\\s+|(?=[${special}])|(?<=[${special}])`, 'g')
const code_regex = RegExp(`[${bad}${dit}${dah}]+`, 'g')
const non_code_regex = RegExp(`[^\\s${special}${bad}${dit}${dah}]+`, 'g')
const non_text_regex = RegExp(`[^\\s${special}\u05b0-\u05ea\u05f3\u05f4'"]+|(?<![\u05b0-\u05ea])[\u05f4"]|[\u05f4"](?![א-ת])`, 'g')
const fix_punct_regex = RegExp(`\t? (?=[${punct}])|(?<=[${punct}])\t`, 'g')
const non_punct_regex = RegExp(`(?<![${punct}]) (?![${punct}])`, 'g')
const non_morse_regex = RegExp(`[^${dit}${dah}]`)

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

Object.entries(morse).filter(([k, v]) => v.match(non_morse_regex)).forEach(([k, v]) => alert(`Bad ${k}: ${v}`))
const reverse_morse = Object.fromEntries(Object.entries(morse).map(([k, v]) => [v, k]))
const selects = {}
let min_count = Infinity
let max_count = 0
let total = 0

function join_lines(join_words, sep='') {
    return [...main.querySelectorAll('.line')].map(line => [...line.children].map(join_words).filter(Boolean).join(sep + ' ')).filter(Boolean).join('\n')
}

function join_inputs() {
    return join_lines(word => word.firstChild.value)
}

function update_output(text) {
    if (typeof text == 'string')
        output.value = text
    history.replaceState(history.state, '', '#' + encodeURIComponent('\t' + output.value))
}

main.addEventListener('change', () => update_output(join_lines(word => [...word.lastChild.children].map(select => select.value.replace(/\u05be$/, '')).join(' '), '\t').replace(fix_punct_regex, '').replaceAll('\t', default_sep)))

addEventListener('copy', event => {  // With no selection - Copy all; Allow copying selector value
    const ae = document.activeElement
    if ((event.target.selectionStart == event.target.selectionEnd || ae.tagName == 'SELECT') && (ae == output || main.contains(ae))) {
        event.preventDefault()
        event.clipboardData.setData('text/plain', ae == output || ae.tagName == 'SELECT' ? ae.value : join_inputs())
    }
})

function fix_whitespace(text) {
    return text.trim().replace(/[ \t\xa0]+/g, ' ').replace(/\s*\n\s*/g, '\n')
}

function paste_input(text, focus=true, word=main, allow_single=true) {
    const words = main.querySelectorAll('.word')
    if (word == output || !words.length)
        return
    text = fix_whitespace(text)
    if (text && word.tagName == 'SELECT') {
        for (const option of word.options)
            if (option.value.startsWith(text)) {
                option.selected = true
                word.dispatchEvent(new Event('change', {bubbles: true}))
                return true
            }
        return
    }
    if (!allow_single && words.length > 1 && !text.match(/\s/))
        return
    while (!word.classList.contains('word'))
        word = word.querySelector('.word') || word.parentElement
    word.firstChild.selectionStart = word.firstChild.value.length
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
    if (focus)
        focus_first_word()
    return true
}

addEventListener('paste', event => {
    const ae = document.activeElement
    if (paste_input(event.clipboardData.getData('text/plain'), ae == document.body, ae, ae.tagName != 'INPUT'))
        event.preventDefault()
})

function paste_output(text, focus=true) {
    const prev_words = [...main.querySelectorAll('.word > div')].filter(selectors => [...selectors.children].some(select => select.length > 1)).map(selectors => [...selectors.children].map(select => ({name: select.name, value: select.value, default: select.classList.contains('default')})))
    fixed_text = fix_whitespace(text)
    const {selectionStart, selectionEnd, selectionDirection} = output
    paste_input(fixed_text.replace(/(?<=[\u05b0-\u05ea])[\u05f4"](?=[א-ת])/g, '').replace(/[\u05b0-\u05ea']+/g, m => m.match(nikud_regex) ? m : joker).replace(hirik_regex, dit).replace(patah_kamats_regex, dah).replace(non_code_regex, '').replace(code_regex, m => reverse_morse[m] || joker).replace(non_punct_regex, '').replace(sep_regex, ' ').replace(/[כמנפצ](?![א-ת])/g, m => String.fromCharCode(m.charCodeAt() - 1)), false)
    output_words = fixed_text.replace(non_text_regex, '').split(split_regex)
    main.querySelectorAll('select').forEach((select, i) => {
        if (![...select.options].some(opt => opt.value == output_words[i])) {
            select.prepend(document.createElement('option'))
            select.options[0].textContent = output_words[i]
            if (select.name != joker && ![...selects[select.name].options].some(opt => opt.value == output_words[i])) {
                selects[select.name].prepend(document.createElement('option'))
                selects[select.name].options[0].textContent = output_words[i]
            }
        }
        select.value = output_words[i]
        select.dispatchEvent(new Event('change'))
        const prev_select = prev_words[[...main.querySelectorAll('.word > div')].indexOf(select.parentElement)]?.[[...select.parentElement.children].indexOf(select)]
        if (prev_select?.default && prev_select.name == select.name && prev_select.value == select.value)
            select.classList.add('default')
    })
    update_output(text)
    output.setSelectionRange(selectionStart, selectionEnd, selectionDirection)
    if (focus)
        add_word().firstChild.focus()
}

output.addEventListener('input', update_output)

output.addEventListener('change', () => {
    paste_output(output.value, false)
})

output.addEventListener('keydown', event => {
    if (event.key == 'Enter' && (event.ctrlKey || event.metaKey))
        paste_output(output.value, false)
})

function share() {
    navigator.share?.({url: location, text: output.value, title: document.title}).catch(() => {}) || navigator.clipboard.writeText(location)
}

if (!navigator.share) {
    share_button.textContent = 'העתק קישור לשיתוף'
    share_button.title = share_button.title.replace('Share', 'Copy shareable link')
}

function add_dagesh(word) {
    if ('אהחערכפ'.includes(word[0]) || word.split(/(?=[א-ת])/, 1)[0].includes('\u05bc'))
        return word
    return word[0] + '\u05bc' + word.slice(1)
}

function remove_word(input) {
    if (!input.value.trim() && main.querySelectorAll('.word').length > 1) {
        input.removeEventListener('blur', blur)
        const word = input.parentElement
        const line = word.parentElement
        word.remove()
        if (!line.childElementCount)
            line.remove()
        return true
    }
}

function blur(event) {
    const input = event.currentTarget
    if (!remove_word(input) && input.value.match(/\s/))
        input.value = input.value.replace(/\s+/g, '')
}

function norm(s) {
    return s.replace(/ך/g, 'כ').replace(/ם/g, 'מ').replace(/ן/g, 'נ').replace(/ף/g, 'פ').replace(/ץ/g, 'צ')
}

function add_word(line=main.lastChild, current, before) {
    const word = line.insertBefore(document.createElement('div'), before ? current : current?.nextElementSibling)
    word.className = 'word'
    const input = word.appendChild(document.createElement('input'))
    const selectors = word.appendChild(document.createElement('div'))

    input.addEventListener('keydown', event => {
        const is_ctrl = event.ctrlKey || event.metaKey
        const is_alt = event.altKey || event.getModifierState?.('AltGraph')
        let line = word.parentElement
        if (event.key == 'Tab' && !event.shiftKey && !is_ctrl && !is_alt && input.value.trim() && !input.nextElementSibling.firstChild) {
            input.dispatchEvent(new Event('change'))
            input.dataset.skip_change = 1
        } else if (event.key == 'End' || event.key == 'Home' && !is_alt || ['ArrowDown', 'ArrowUp'].includes(event.key) && is_ctrl)
            if (['End', 'ArrowDown'].includes(event.key)) {
                if (event.key == 'End' && is_ctrl)
                    line = main.lastChild
                const elem = line.lastChild.firstChild
                elem.focus()
                elem.selectionStart = elem.value.length
            } else {
                if (event.key == 'Home' && is_ctrl)
                    line = main.firstChild
                const elem = line.firstChild.firstChild
                elem.focus()
                elem.selectionEnd = 0
            }
        else if (['Enter', ' '].includes(event.key)
            || ['ArrowDown', 'ArrowUp'].includes(event.key) && !is_ctrl
            || event.key == 'ArrowLeft' && !is_alt && input.selectionStart == input.value.length
            || (event.key == 'ArrowRight' && !is_alt || event.key == 'Backspace' && (word.previousElementSibling || line.previousElementSibling)) && !input.selectionEnd
            || event.key == 'Delete' && input.selectionStart == input.value.length && (word.nextElementSibling || line.nextElementSibling)) {
            event.preventDefault()
            let elem
            const line_had_text = input.value.trim() || line.childElementCount > 1
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
            } else if (event.key == 'Backspace' && input.value.trim() && !word.previousElementSibling) {
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
                    if (line_had_text && !is_ctrl) {
                        const new_line = add_line(line)
                        if (!event.shiftKey) {
                            cr = input.value.trim() && input.selectionEnd || word.previousElementSibling
                            let line_words = [...line.children]
                            line_words = line_words.slice(line_words.indexOf(word) + (input.value.trim() && input.selectionEnd || !input.value.trim() && !word.previousElementSibling))
                            if (line_words.length) {
                                input.removeEventListener('blur', blur)
                                new_line.replaceChildren(...line_words)
                                input.addEventListener('blur', blur)
                                if (!line.childElementCount)
                                    add_word(line).firstChild.focus()
                                input.dispatchEvent(new Event('change', {bubbles: true}))
                            }
                        }
                    } else
                        input.dispatchEvent(new Event('change', {bubbles: true}))
                if (event.key != 'Enter' || cr)
                   elem = (line.nextElementSibling || main.firstChild).firstChild
            } else if (event.key != ' ')
                elem = word.nextElementSibling || main.firstChild.firstChild
            else if (input.value.trim())
                elem = add_word(line, word, !input.selectionEnd)

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
        const chars = norm(input.value.toLowerCase()).split('').map(char => reverse_morse[morse[char]] || char).filter(char => char in selects)
        chars.forEach((char, i) => {
            const current = selectors.children[i]
            if (current?.name == char)
                return
            const select = selects[char].cloneNode(true)
            select.classList.add('default')
            select.name = char
            if (char == joker)
                select.style.backgroundColor = error_color
            else if (selects[char].length == 1)
                select.style.backgroundColor = single_color
            else if (selects[char].length <= rarest_count && max_count > rarest_count)
                select.style.backgroundColor = rarest_color
            else if (selects[char].length <= rare_count && min_count <= rarest_count && max_count > rare_count)
                select.style.backgroundColor = rare_color

            select.addEventListener('change', () => {
                if (select.name != joker) {
                    const options = [...selects[select.name].options]
                    const option = options.find(opt => opt.value == select.value)
                    options.forEach(opt => opt.defaultSelected = false)
                    option.defaultSelected = true
                }
                select.classList.remove('default')
            })

            select.addEventListener('click', () => select.classList.remove('default'))

            select.addEventListener('keydown', event => {
                const is_ctrl = event.ctrlKey || event.metaKey
                const is_alt = event.altKey || event.getModifierState?.('AltGraph')
                const line = word.parentElement
                if (['Enter', ' '].includes(event.key) || ['ArrowUp', 'ArrowDown'].includes(event.key) && is_alt) {
                    select.classList.remove('default')
                    if (event.key == 'Enter' && !is_ctrl && !is_alt)  // For Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1912527
                        select.showPicker?.()
                } else if (!is_alt)
                    if (event.key == 'Tab' && !event.shiftKey && !is_ctrl && !select.nextElementSibling && !word.nextElementSibling && !line.nextElementSibling)
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

    input.addEventListener('blur', blur)
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

function save_words(morse_words) {
    const save = document.createElement('a')
    save.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(Object.values(morse_words).map(words => words.filter(Boolean).join('\n')).filter(Boolean).join('\n'))
    save.download = 'morse.txt'
    save.style.display = 'none'
    document.body.appendChild(save).click()
    save.remove()
}

fetch('morse.json').then(response => response.json()).then(morse_words_types => {
    const morse_words = Object.fromEntries(Object.entries(morse_words_types).map(([k, v]) => [k, Object.keys(v)]))

    function extend_dict(char, new_words) {
        morse_words[char] = [...new Set(morse_words[char].concat(new_words))]
    }

    Object.entries(reverse_morse).forEach(([code, char]) => {
        if (!morse_words[char])
            morse_words[char] = []
        if ((add_prefix_article || add_prefix_prep) && code.length > 1) {
            const tail_char = reverse_morse[code.slice(1)]
            let words
            if (tail_char in morse_words_types)
                words = Object.entries(morse_words_types[tail_char]).filter(([word, type]) => type).map(([word]) => word)
            if (words) {
                morse_words[char].push('')  // For <hr>
                if (code[0] == dah) {
                    if (add_prefix_article)
                        extend_dict(char, words.filter(word => morse_words_types[tail_char][word] == 2 && !word.match(/[ \u05be]|^[החע]\u05b8/)).map(word => 'ה' + ('ארע'.includes(word[0]) ? '\u05b8' : '\u05b7') + add_dagesh(word)))
                    if (add_prefix_prep)
                        extend_dict(char, words.filter(word => word.match(/^[אהחע]\u05b2/)).map(word => 'לַ' + word))
                } else if (add_prefix_prep) {
                    extend_dict(char, words.filter(word => word.match(/^.[\u05bc\u05c1\u05c2]?\u05b0/)).map(word => 'לִ' + (word[0] == 'י' ? word.replace('\u05b0', '') : word)))
                    extend_dict(char, words.filter(word => !'אהחער'.includes(word[0])).map(word => 'מִ' + add_dagesh(word)))
                }
            }
        }
        if (remove_shva_na)
            morse_words[char] = morse_words[char].filter(word => !norm(word).match(/(?:^|[ \u05be])[ילמנר]\u05b0|([א-יל-עצ-רת])\u05bc?\u05b0\1|([כפ])\u05bc\u05b0\2\u05bc|([כפ])\u05b0\3(?!\u05bc)|ש\u05bc?\u05c1\u05bc?\u05b0ש\u05bc?\u05c1|ש\u05bc?\u05c2\u05bc?\u05b0ש\u05bc?\u05c2/))
        if (morse_words[char][0] == '')
            morse_words[char].shift()
        if (morse_words[char].slice(-1)[0] == '')
            morse_words[char].pop()
        if (limit)
            morse_words[char] = morse_words[char].slice(0, limit)  // May be off by one due to <hr>
        selects[char] = document.createElement('select')
        morse_words[char].filter(word => !word.match(/ |\u05be$/) || !morse_words[char].includes(word.replaceAll(' ', '\u05be').replace(/\u05be$/, ''))).forEach(word => selects[char].appendChild(document.createElement(word ? 'option' : 'hr')).textContent = word.replaceAll(' ', '\u05be'))
        const len = selects[char].length
        min_count = Math.min(min_count, len)
        max_count = Math.max(max_count, len)
        total += len
        console.log(char, len)
    })
    console.log('total', total)

    for (const char of special) {
        selects[char] = document.createElement('select')
        selects[char].appendChild(document.createElement('option')).textContent = char
    }

    add_first_word()
    const hash = decodeURIComponent(location.hash.slice(1))
    if (hash[0] == '\t' && hash.slice(1))
        paste_output(hash.slice(1))

    //save_words(morse_words)
})