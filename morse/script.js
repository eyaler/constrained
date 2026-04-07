const error_color = 'red'
const single_color = 'white'
const rare_color = '#ff9999'
const medium_color = '#ffcccc'
const rare_count = 700
const medium_count = 2000
const limit = 0
const declension_suffixes = ['הּ', 'יִךְ', 'ךָ', 'תָם', 'תָן', 'תָּם', 'תָּן']
const prep_declensions1 = ['אַחֲרַיִךְ', 'אִתָּהּ', 'אִתְּךָ', 'אִתָּם', 'אִתָּן', 'בְּגִינָהּ', 'בִּגְלָלָהּ', 'בִּגְלָלְךָ', 'בָּהּ', 'בְּךָ', 'בִּשְׁבִילָהּ', 'בִּשְׁבִילְךָ', 'הִנָּהּ', 'הִנְּךָ', 'כְּלַפַּיִךְ', 'לְגַבַּיִךְ', 'לָהּ', 'לְךָ', 'לְמַעֲנָהּ', 'לְמַעַנְךָ', 'לִקְרָאתָהּ', 'לִקְרָאתְךָ', 'לִקְרָאתָם', 'לִקְרָאתָן', 'מִמְּךָ', 'עָלַיִךְ', 'עִמָּדְךָ', 'עִמָּהּ', 'עִמָּדָהּ', 'עִמְּךָ']
const prep_declensions2 = ['בִּלְעָדַיִךְ', 'בַּעֲדָהּ', 'בַּעַדְךָ', 'דַּעְתָּהּ', 'דַּעְתְּךָ', 'יָדָהּ', 'יָדַיִךְ', 'יָדְךָ', 'לְבַדָּהּ', 'לְבַדְּךָ', 'סְבִיבָהּ', 'סְבִיבְךָ', 'עַצְמָהּ', 'עַצְמְךָ', 'פִּיךָ', 'פָּנַיִךְ', 'צִדָּהּ', 'צִדְּךָ', 'שְׁמָהּ', 'שִׁמְךָ', 'תַּחְתַּיִךְ', 'תַּחְתָּם' ,'תַּחְתָּן']
let special = ',.*'  // Overrides Morse
const default_sep = '.'  // Overrides Morse
const joker = '*'  // Overrides Morse
const dit = '·'
const dah = '-'

const dit_dah = dit + dah
const makaf = '\u05be'
const space_makaf_class = `[ ${makaf}]`
const dagesh = '\u05bc'
const dots = dagesh + '\u05c1\u05c2'
const shva = '\u05b0'
const hirik = '\u05b4'
const hataf_patah = '\u05b2'
const patah = '\u05b7'
const kamats = '\u05b8'
const a_vowel = hataf_patah + patah + kamats
const good_nikud = hirik + a_vowel
const bad_nikud = '\u05b1\u05b3\u05b5\u05b6\u05b9\u05ba\u05bb\u05c7'
const hebrew_block = '\u05b0-\u05ea'
const hebrew_block_quotes = hebrew_block + '\'"'
const alefbet_class = '[א-ת]'
const bet = 'ב'
const he = 'ה'
const vav = 'ו'
const yod = 'י'
const kaf = 'כ'
const lamed = 'ל'
const mem = 'מ'
const bhvkl = [bet, he, vav, kaf, lamed]

if (!special.includes(default_sep))
    special += default_sep
if (!special.includes(joker))
    special += joker

const final_punct_regex = RegExp('\\p{P}(?=\\p{P}*$)', 'gu')
const whitespace_regex = RegExp('[ \t\xa0]+', 'g')
const newline_regex = RegExp('\\s*\n\\s*', 'g')

const space_hyphen_regex = RegExp('[ -]', 'g')
const middle_makaf_regex = RegExp(`.${makaf}.`)
const final_makaf_regex = RegExp(`(?<=[${hebrew_block}])${makaf}$`)
const word_parts_regex = RegExp(`\\p{L}[\\p{M}${makaf}'"]*`, 'gu')
const alefbet_regex = RegExp(alefbet_class)

const punct = special.replaceAll(joker, '')
const non_punct_regex = RegExp(`(?<![${punct}]) (?![${punct}])`, 'g')
const fix_space_regex = RegExp(`\t? (?=[${punct}])|(?<=[${punct}])\t`, 'g')

const hirik_regex = RegExp(hirik, 'g')
const a_vowel_regex = RegExp(`[${a_vowel}]`, 'g')
const nikud_regex = RegExp(`[${good_nikud}]`)
const bad_nikud_regex = RegExp(`[${bad_nikud}]|([${good_nikud}][${dots}]*){2}`)

const conj_mwe_regex = RegExp(`^${vav}${shva}(\\p{L}\\p{M}*){2} \\p{L}`, 'u')
const skip_article_regex = RegExp(`${space_makaf_class}|^[החע]` + kamats)
const hataf_patah_regex = RegExp('^[אהחע]' + hataf_patah)
const initial_shva_regex = RegExp(`^.[${dots}]?${shva}`)
const shva_na_regex = RegExp(`(?:^|${space_makaf_class})(?:[ילמנר]${shva}|ת${dagesh}?${shva}[דטצ])|([א-יל-עצ-רת])${dagesh}?${shva}\\1|([כפ]${dagesh})${shva}\\2|([כפ])${shva}\\3(?!${dagesh})|ש${dagesh}?\u05c1${dagesh}?${shva}ש${dagesh}?\u05c1|ש${dagesh}?\u05c2${dagesh}?${shva}ש${dagesh}?\u05c2|${shva}${alefbet_class}[${dots}]*${shva}ךָ| ${vav}${shva}(\\p{L}\\p{M}*){2}`, 'u')
console.log(shva_na_regex)

const morse_regex = RegExp(`[${dit_dah}]+`, 'g')
const non_morse_regex = RegExp(`[^${dit_dah}]`)
const non_code_regex = RegExp(`[^\\s${special}${dit_dah}]+`, 'g')

const sep_string = `(?<=[^\\s${punct}])[${default_sep}] (?= *[^\\s${punct}])`
const sep_regex = RegExp(sep_string, 'g')
const split_regex = RegExp(`${sep_string}|\\s+|(?=[${special}])|(?<=[${special}])`, 'g')

const final_regex = RegExp(`(?<=[${hebrew_block_quotes}])[כמנפצ](?![א-ת${joker}])`, 'g')
const non_text_regex = RegExp(`[^\\s${special}${hebrew_block_quotes}-]+|(?<![${hebrew_block}])["-]|"(?!${alefbet_class})`, 'g')
const hebrew_block_quotes_regex = RegExp(`[${hebrew_block_quotes}]+`, 'g')

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

const dont_show = 'äöšü'

const is_mac = navigator.platform.startsWith('Mac') || navigator.platform == 'iPhone'
Object.entries(morse).filter(([k, v]) => v.match(non_morse_regex)).forEach(([k, v]) => alert(`Bad ${k}: ${v}`))
const reverse_morse = Object.fromEntries(Object.entries(Object.fromEntries(Object.entries(morse).map(([k, v]) => [v, k]))).sort(([,a], [,b]) => a.localeCompare(b)))
const selects = {}
let morse_words_types
let min_count = Infinity
let max_count = 0
let total_count = 0
let last_hash, legacy_select, ready, rebuild, recent_input

function join_lines(join_words, sep='') {
    return [...main.querySelectorAll('.line')].map(line => [...line.children].map(join_words).filter(Boolean).join(sep + ' ')).filter(Boolean).join('\n')
}

function join_inputs() {
    return join_lines(word => word.firstChild.value)
}

function make_hash() {
    return encodeURIComponent('\t' + output.value).replace(final_punct_regex, c => '%' + c.charCodeAt().toString(16).toUpperCase())
}

function update_output(text, push=true) {
    try {
        if (typeof text == 'string')
            output.value = text
        else if (!push)
            history.replaceState(history.state, '', '#' + make_hash())
        if (push) {
            const hash = make_hash()
            if (hash != last_hash) {
                last_hash = hash
                history.pushState(history.state, '', '#' + hash)
            }
        }
    } catch {}
}

addEventListener('pagehide', () => update_output(null, false))
main.addEventListener('change', e => update_output(join_lines(word => [...word.lastChild.children].map(select => remove_final_makaf(select.value)).join(' '), '\t').replace(fix_space_regex, '').replaceAll('\t', default_sep), !e.detail?.skip_push))
checkboxes.addEventListener('change', () => {if (ready) {rebuild = true; build_selects(); rebuild = false}})

addEventListener('copy', event => {
    /* Augment regular copy with:
       1. On select element - Copy selected value (doesn't work for open legacy select elements in Chrome)
       2. On output when no selection - Copy all output
       3. Otherwise when no selection - Copy all input
    */
    const ae = document.activeElement
    if ((event.target.selectionStart == event.target.selectionEnd || ae.closest('select')) && (ae == output || main.contains(ae))) {
        event.preventDefault()
        event.clipboardData.setData('text/plain', ae == output || ae.closest('select') ? ae.value : join_inputs())
    }
})

function norm(text) {
    return text.trim().replace(whitespace_regex, ' ').replace(newline_regex, '\n').replaceAll('\u05f3', "'").replaceAll('\u05f4', '"').replaceAll('\u2011', '-')
}

function norm_hyphen(text) {
    return text.replace(space_hyphen_regex, makaf)
}

function remove_final_makaf(text='') {
    return text.replace(final_makaf_regex, '')
}

function get_word_parts(word) {
    return word.match(word_parts_regex) || []
}

function partial_match(dict_word, word_parts) {
    const dict_word_parts = get_word_parts(dict_word)
    if (word_parts.length > dict_word_parts.length)
        return false
    return word_parts.every((cluster, i) => [...cluster].every(char => dict_word_parts[i].includes(char)))
}

function select_option(option) {
    const select = option.closest('select')
    if (legacy_select || !select.matches(':open')) {
        option.selected = true
        select.dispatchEvent(new CustomEvent('change', {bubbles: true, detail: {skip_push: true}}))
    } else
        option.focus()
}

function paste_input(text='', focus=true, push=true, word=main) {
    if (!main.querySelector('.word'))
        return
    text = norm(text)
    const select = word.closest('select')
    if (select) {
        if (!text.match(alefbet_regex))
            return
        text = remove_final_makaf(norm_hyphen(text))
        const len = select.options.length
        const index = legacy_select ? select.selectedIndex : select.querySelector('option:focus-visible')?.index ?? select.selectedIndex ?? 0
        for (let i = 1; i <= len; i++) {
            const option = select.options[(index + i) % len]
            if (option.value.startsWith(text)) {
                select_option(option)
                return true
            }
        }

        if (text.length == 1)
            return
        const word_parts = get_word_parts(text)
        for (let i = 1; i <= len; i++) {
            const option = select.options[(index + i) % len]
            if (partial_match(option.value, word_parts)) {
                select_option(option)
                return true
            }
        }
        return
    }

    if (word.tagName == 'INPUT' && !text.match(/\s/))
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
            word.firstChild.dispatchEvent(new CustomEvent('change', {bubbles: true, detail: {skip_push: true}}))
        })
    })
    if (push)
        update_output()
    if (focus)
        main.querySelector('input').focus()
    return true
}

addEventListener('paste', event => {
    /* Augment regular paste with:
       1. On select element - Search for value with partial diacritics matching fallback (doesn't work for open legacy select elements in Chrome)
       2. On input element when multiple words in clipboard - Replace element and everything afterwards with pasted words
       3. Otherwise when not on output and input is empty - Paste as input
    */
    const ae = document.activeElement
    try {
        if (ae != output && (ae != document.body && !controls.contains(ae) || !join_inputs()) && paste_input(event.clipboardData.getData('text/plain'), ae == document.body, true, ae))
            event.preventDefault()
    } catch {}
})

function paste_output(text='', focus=true, push=true) {
    const {selectionStart, selectionEnd, selectionDirection} = output
    const prev_words = [...main.querySelectorAll('.word > div')].filter(selectors => [...selectors.children].some(select => select.length > 1)).map(selectors => [...selectors.children].map(select => ({name: select.name, value: select.value, default: select.classList.contains('default')})))
    const norm_text = norm(text)
    paste_input(norm_text.replace(hebrew_block_quotes_regex, m => m.match(nikud_regex) && !m.match(bad_nikud_regex) ? m : joker).replace(morse_regex, '').replace(hirik_regex, dit).replace(a_vowel_regex, dah).replace(non_code_regex, '').replace(morse_regex, m => reverse_morse[m] && !dont_show.includes(reverse_morse[m]) ? reverse_morse[m] : joker).replace(non_punct_regex, '').replace(sep_regex, ' ').replace(final_regex, m => String.fromCharCode(m.charCodeAt() - 1)), false, false)
    const output_words = norm_text.replace(non_text_regex, '').split(split_regex).map(norm_hyphen)
    main.querySelectorAll('select').forEach((select, i) => {
        const makafless = remove_final_makaf(output_words[i])
        let option = [...select.options].find(opt => remove_final_makaf(opt.value) == makafless)
        if (!option) {
            option = document.createElement('option')
            option.textContent = output_words[i]
            select.prepend(option)
            if (select.dataset.old_index)
                select.dataset.old_index = +select.dataset.old_index + 1
            if (select.dataset.last_index)
                select.dataset.last_index = +select.dataset.last_index + 1
            if (select.name != joker && ![...selects[select.name].options].some(opt => remove_final_makaf(opt.value) == makafless))
                selects[select.name].prepend(option.cloneNode(true))
        }
        option.selected = true
        select.dispatchEvent(new Event('change'))
        const prev_select = prev_words[[...main.querySelectorAll('.word > div')].indexOf(select.parentElement)]?.[[...select.parentElement.children].indexOf(select)]
        if (prev_select?.default && prev_select.name == select.name && prev_select.value == select.value)
            select.classList.add('default')
    })
    update_output(text, push)
    output.setSelectionRange(selectionStart, selectionEnd, selectionDirection)
    if (focus) {
        const first_word = main.querySelector('.word')
        ;(first_word.firstChild.value ? add_word() : first_word).firstChild.focus()
    }
}

output.addEventListener('change', () => paste_output(output.value, false))

output.addEventListener('keydown', event => {
    if (event.key == 'Enter' && (event.ctrlKey && !is_mac || event.metaKey && is_mac))
        paste_output(output.value, false)
})

function share() {
    navigator.share?.({url: location, text: output.value, title: document.title}).catch(() => {}) || navigator.clipboard.writeText(location)
}

if (!navigator.share) {
    share_button.textContent = 'העתק קישור לשיתוף'
    share_button.title = share_button.title.replace('Share', 'Copy shareable link')
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

addEventListener('focus', () => {
    const input = recent_input?.deref()
    if (input?.isConnected)
        input.dispatchEvent(new FocusEvent('blur'))
})

function to_middle(text) {
    return text.replace(/ך/g, 'כ').replace(/ם/g, 'מ').replace(/ן/g, 'נ').replace(/ף/g, 'פ').replace(/ץ/g, 'צ')
}

function add_word(line=main.lastChild, current, before) {
    const word = line.insertBefore(document.createElement('div'), before ? current : current?.nextElementSibling)
    word.className = 'word'
    const input = word.appendChild(document.createElement('input'))
    const selectors = word.appendChild(document.createElement('div'))

    input.addEventListener('keydown', event => {
        const is_meta = event.ctrlKey || event.metaKey
        const is_ctrl = event.ctrlKey && !is_mac && !event.metaKey || event.metaKey && is_mac && !event.ctrlKey
        const is_alt = event.altKey || event.getModifierState?.('AltGraph')
        let line = word.parentElement
        if (event.key == 'Tab' && !event.shiftKey && !is_meta && !is_alt && input.value.trim() && !input.nextElementSibling.firstChild) {
            input.dispatchEvent(new Event('change'))
            input.dataset.skip_change = 1
        } else if ((event.key == 'End' || event.key == 'Home' && !is_alt || ['ArrowDown', 'ArrowUp'].includes(event.key) && is_ctrl) && !event.shiftKey)
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
            || ['ArrowDown', 'ArrowUp'].includes(event.key) && !event.shiftKey && !is_meta
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
                    if (line_had_text && !is_meta) {
                        const new_line = add_line(line)
                        if (!event.shiftKey) {
                            cr = input.value.trim() && input.selectionStart || word.previousElementSibling
                            let line_words = [...line.children]
                            line_words = line_words.slice(line_words.indexOf(word) + (input.value.trim() && !!input.selectionStart || !input.value.trim() && !word.previousElementSibling))
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
            else if (input.value.trim())  // ' '
                elem = add_word(line, word, !input.selectionStart)

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
        const chars = [...to_middle(input.value.toLowerCase())].map(char => reverse_morse[morse[char]] || char).filter(char => char in selects)
        chars.forEach((char, i) => {
            const current = selectors.children[i]
            if (current?.name == char && !rebuild)
                return
            const select = selects[char].cloneNode(true)
            select.classList.add('default')
            select.name = char
            if (char == joker)
                select.style.backgroundColor = error_color
            else if (selects[char].length == 1)
                select.style.backgroundColor = single_color
            else if (selects[char].length <= rare_count && max_count > rare_count)
                select.style.backgroundColor = rare_color
            else if (selects[char].length <= medium_count && min_count <= rare_count && max_count > medium_count)
                select.style.backgroundColor = medium_color

            select.addEventListener('change', () => {
                select.classList.remove('default')
                if (select.dataset.last_index != select.selectedIndex) {
                    select.dataset.old_index = select.dataset.last_index || ''
                    select.dataset.last_index = select.selectedIndex
                }
                if (select.name != joker) {
                    const options = [...selects[select.name].options]
                    const option = options[select.selectedIndex]
                    options.forEach(opt => opt.defaultSelected = false)
                    option.defaultSelected = true
                }
            })

            select.addEventListener('click', () => select.classList.remove('default'))

            select.addEventListener('keydown', event => {
                const is_meta = event.ctrlKey || event.metaKey
                const is_alt = event.altKey || event.getModifierState?.('AltGraph')
                const line = word.parentElement
                if (['Enter', ' '].includes(event.key) || ['ArrowUp', 'ArrowDown'].includes(event.key) && is_alt) {
                    select.classList.remove('default')
                    if (event.key == 'Enter' && !is_meta && !is_alt)  // For Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1912527
                        select.showPicker?.()
                } else if (event.key == '-' || event.code == 'Minus' && event.shiftKey) {
                    event.preventDefault()
                    const len = select.options.length
                    const index = legacy_select ? select.selectedIndex : select.querySelector('option:focus-visible')?.index ?? select.selectedIndex ?? 0
                    for (let i = 1; i <= len; i++) {
                        const option = select.options[(index + (event.key == '-' ? i : -i) + len) % len]
                        if (option.value.match(middle_makaf_regex)) {
                            select_option(option)
                            break
                        }
                    }
                } else if (event.key == 'Backspace' && select.dataset.old_index) {
                    event.preventDefault()
                    select_option(select.options[select.dataset.old_index])
                } else if (!is_alt)
                    if (event.key == 'Tab' && !event.shiftKey && !is_meta && !select.nextElementSibling && !word.nextElementSibling && !line.nextElementSibling)
                        add_word(line)
                    else if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
                        event.preventDefault()
                        const all_selectors = main.querySelectorAll('select')
                        all_selectors[([...all_selectors].indexOf(select) + (event.key == 'ArrowLeft' ? 1 : -1) + all_selectors.length) % all_selectors.length].focus()
                    } else if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                        event.preventDefault()
                        select_option(select.options[((legacy_select ? select.selectedIndex : select.querySelector('option:focus-visible')?.index ?? select.selectedIndex ?? 0) + (event.key == 'ArrowDown' ? 1 : -1)) % select.length])
                    }
            })
            if (current)
                current.replaceWith(select)
            else
                selectors.appendChild(select)
            legacy_select = getComputedStyle(select).appearance != 'base-select'
        })
        while (selectors.childElementCount > chars.length)
            selectors.lastChild.remove()
    })

    input.addEventListener('blur', blur)
    recent_input = new WeakRef(word.firstChild)
    return word
}

function add_line(current) {
    const line = main.insertBefore(document.createElement('div'), current?.nextElementSibling)
    line.className = 'line'
    add_word(line)
    return line
}

function save_words(morse_words) {
    const save = document.createElement('a')
    save.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(Object.values(morse_words).map(words => words.filter(Boolean).join('\n')).filter(Boolean).join('\n'))
    save.download = 'morse.txt'
    save.style.display = 'none'
    document.body.appendChild(save).click()
    save.remove()
}

addEventListener('keydown', event => {
    if (event.key == 'Escape' && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey && !event.getModifierState?.('AltGraph')
        && event.target.selectionStart != event.target.selectionEnd) {  // Remove selection
        const caret = event.target.selectionDirection == 'forward' ? event.target.selectionEnd : event.target.selectionStart
        event.target.setSelectionRange(caret, caret)
    }
})

function paste_hash(pop, focus=false) {
    last_hash = decodeURIComponent(location.hash.slice(1))
    if (ready)
        if (last_hash.match(/^\t./))
            paste_output(last_hash.slice(1), focus, false)
        else if (pop)
            paste_input('', focus, false)
}

function add_dagesh(word) {
    if ('אהחערכפ'.includes(word[0]) || word[1] == dagesh)
        return word
    return word[0] + dagesh + word.slice(1)
}

function build_selects(focus=false) {
    ready = false
    const counts = []

    const word_types = Object.assign({}, ...Object.values(morse_words_types))
    prep_declensions2.forEach(word => {
        if (word_types[word] == 0)
            word_types[word] = 1
    })

    const morse_words = Object.fromEntries(Object.entries(morse_words_types).map(([k, v]) => [k, Object.keys(v)]))

    function extend_words(char, new_words) {
        morse_words[char] = [...new Set(morse_words[char].concat(new_words))]
    }

    function filter_declensions(words) {
        return words.filter(word => word_types[word] != 1 || word.match(`${space_makaf_class}.`) || prep_declensions1.includes(word) || prep_declensions2.includes(word) || !declension_suffixes.some(suffix => word.endsWith(suffix)))
    }

    Object.entries(reverse_morse).forEach(([code, char]) => {
        if (!morse_words[char])
            morse_words[char] = []
        if (!allow_declensions.checked)
            morse_words[char] = filter_declensions(morse_words[char])

        const add_bvkl = [...bet.slice(0, add_prep_b.checked) + vav.slice(0, add_prep_v.checked) + kaf.slice(0, add_prep_k.checked) + lamed.slice(0, add_prep_l.checked)]
        const add_bhkl = [...bet.slice(0, add_article_b.checked) + he.slice(0, add_article_h.checked) + kaf.slice(0, add_article_k.checked) + lamed.slice(0, add_article_l.checked)]
        if (code.length > 1 && (add_bvkl.length
           || code[0] == dah && add_bhkl.length
           || code[0] == dit && add_prep_m.checked)) {
            const tail_char = reverse_morse[code.slice(1)]
            let words = Object.keys(morse_words_types[tail_char]).filter(word => !word.match(conj_mwe_regex))
            if (!allow_declensions.checked)
                words = filter_declensions(words)
            if (words.length) {
                morse_words[char].push('')  // For <hr>
                if (code[0] == dah)
                    bhvkl.forEach(prefix => extend_words(char, words.flatMap(word => {
                        const result = []
                        if (add_bvkl.includes(prefix) && (prefix == vav || word_types[word]) && word.match(hataf_patah_regex))
                            result.push(prefix + patah + word)
                        if (add_bhkl.includes(prefix) && word_types[word] == 2 && !word.match(skip_article_regex))
                            result.push(prefix + (['הַר', 'עַם', 'פַּר'].includes(word) ? (word == 'פַּר' ? patah : kamats) + word.replace(patah, kamats) : ('ארע'.includes(word[0]) ? kamats : patah) + add_dagesh(word)))
                        return result
                    })))
                else {
                    add_bvkl.forEach(prefix => extend_words(char, words.filter(word => (prefix == vav && word[0] == yod || word_types[word]) && word.match(initial_shva_regex)).map(word => prefix + hirik + (word[0] == yod ? word.replace(shva, '') : word.replace('(?<=^.)' + dagesh, '')))))
                    if (add_prep_m)
                        extend_words(char, words.filter(word => word_types[word] && !'אהחער'.includes(word[0])).map(word => mem + hirik + add_dagesh(word)))
                }
            }
        }

        if (!allow_shva_na.checked)
            morse_words[char] = morse_words[char].filter(word => !word.match(shva_na_regex) && !word.match(conj_mwe_regex))
        if (!morse_words[char][0])
            morse_words[char].shift()
        if (!morse_words[char].slice(-1)[0])
            morse_words[char].pop()
        if (limit)
            morse_words[char] = morse_words[char].slice(0, limit)  // May be off by one due to <hr>
        selects[char] = document.createElement('select')
        morse_words[char].filter(word => !word.match(` |${makaf}$`) || !morse_words[char].includes(remove_final_makaf(word.replaceAll(' ', makaf)))).forEach(word => selects[char].appendChild(document.createElement(word ? 'option' : 'hr')).textContent = word.replaceAll(' ', makaf))
        const len = selects[char].length
        min_count = Math.min(min_count, len)
        max_count = Math.max(max_count, len)
        total_count += len
        if (char.match(alefbet_regex))
            counts.push(len)
        console.log(char, len)
    })
    console.log({total_count})

    for (const char of special) {
        selects[char] = document.createElement('select')
        selects[char].appendChild(document.createElement('option')).textContent = char
    }

    if (!main.querySelector('.line'))
        add_line().firstChild.firstChild.focus()

    ready = true
    paste_hash(false, focus)
    //save_words(morse_words)
}

fetch('morse.json').then(response => response.json()).then(json => {
    morse_words_types = json
    build_selects(true)
})