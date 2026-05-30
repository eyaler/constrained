const error_color = 'red'
const single_color = 'white'
const rare_color = '#ff9999'
const medium_color = '#ffcccc'
const rare_count = 700
const medium_count = 2000
const limit = 0

const possessive_suffixes = ['הּ', 'הָ', 'יִךְ', 'ךָ', 'תָם', 'תָן', 'תָּם', 'תָּן']
const prepositions1 = new Set(['אַחֲרַיִךְ', 'אִתָּהּ', 'אִתְּךָ', 'אִתָּם', 'אִתָּן', 'בְּגִינָהּ', 'בִּגְלָלָהּ', 'בִּגְלָלְךָ', 'בָּהּ', 'בְּךָ', 'בִּשְׁבִילָהּ', 'בִּשְׁבִילְךָ', 'הִנָּהּ', 'הִנְּךָ', 'כְּלַפַּיִךְ', 'לְגַבַּיִךְ', 'לָהּ', 'לְךָ', 'לְמַעֲנָהּ', 'לְמַעַנְךָ', 'לִקְרָאתָהּ', 'לִקְרָאתְךָ', 'לִקְרָאתָם', 'לִקְרָאתָן', 'מִמְּךָ', 'עָלַיִךְ', 'עִמָּדָהּ', 'עִמָּדְךָ', 'עִמָּהּ', 'עִמְּךָ'])
const prepositions2 = new Set(['בִּלְעָדַיִךְ', 'בַּעֲדָהּ', 'בַּעַדְךָ', 'דַּעְתָּהּ', 'דַּעְתְּךָ', 'יָדָהּ', 'יָדַיִךְ', 'יָדְךָ', 'לְבַדָּהּ', 'לְבַדְּךָ', 'סְבִיבָהּ', 'סְבִיבְךָ', 'עַצְמָהּ', 'עַצְמְךָ', 'פִּיהָ', 'פִּיךָ', 'פָּנַיִךְ', 'צִדָּהּ', 'צִדְּךָ', 'שְׁמָהּ', 'שִׁמְךָ', 'תַּחְתַּיִךְ', 'תַּחְתָּם' ,'תַּחְתָּן'])

const model_id = 'eyaler/HalleluBERT_large-ONNX'
const model_max_length = 512
const mask_lstrip = false
const masks_for_missing_word = 2

// These override Morse:
let special = ',.*'
const default_sep = '.'
const joker = '*'

const dit = '·'
const dah = '-'
const dit_dah = dit + dah
const makaf = '\u05be'
const space_makaf_class = `[ ${makaf}]`
const dagesh = '\u05bc'
const shindots = '\u05c1\u05c2'
const dots = dagesh + shindots
const shva = '\u05b0'
const hirik = '\u05b4'
const hataf_patah = '\u05b2'
const patah = '\u05b7'
const kamats = '\u05b8'
const a_vowel = hataf_patah + patah + kamats
const good_nikud = hirik + a_vowel
const allowed_nikud = good_nikud + shva + dots
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
const ylmnr_shva = '[ילמנר]' + shva

if (!special.includes(default_sep))
    special += default_sep
if (!special.includes(joker))
    special += joker

const final_punct_regex = RegExp('\\p{P}(?=\\p{P}*$)', 'gu')
const whitespace_regex = RegExp('[ \t\xa0]+', 'g')
const newline_regex = RegExp('\\s*\n\\s*', 'g')

const space_hyphen_regex = RegExp('[ -]', 'g')
const nonfinal_space_makaf_regex = RegExp(`${space_makaf_class}.`)
const space_final_makaf_regex = RegExp(` |${makaf}$`)
const middle_makaf_regex = RegExp(`.${makaf}.`)
const trailing_makaf_regex = RegExp(`(?<=[${hebrew_block}])${makaf}$`)
const word_parts_regex = RegExp(`\\p{L}[\\p{M}${makaf}'"]*`, 'gu')
const alefbet_regex = RegExp(alefbet_class)

const punct = special.replaceAll(joker, '')
const non_punct_regex = RegExp(`(?<![${punct}]) (?![${punct}])`, 'g')
const fix_space_regex = RegExp(`\t? (?=[${punct}])|(?<=[${punct}])\t`, 'g')

const hirik_regex = RegExp(hirik, 'g')
const a_vowel_regex = RegExp(`[${a_vowel}]`, 'g')
const nikud_regex = RegExp(`[${good_nikud}]`)
const allowed_nikud_regex = RegExp(`[${allowed_nikud}]`, 'g')
const bad_nikud_regex = RegExp(`[${bad_nikud}]|([${good_nikud}${shva}][${dots}]*){2}`)
const wrong_order_nikud_regex = RegExp(`([${good_nikud}])([${dots}]*)`, 'g')
const wrong_order_dots_regex = RegExp(`([${shindots}])(${dagesh})`, 'g')

const conj_mwe_regex = RegExp(`^${vav}${shva}(\\p{L}\\p{M}*){2} \\p{L}`, 'u')
const skip_article_regex = RegExp(`${space_makaf_class}|^[החע]` + kamats)
const hataf_patah_regex = RegExp('^[אהחע]' + hataf_patah)
const initial_shva_regex = RegExp(`^.[${dots}]?${shva}`)
const shva_na_regex = RegExp(`(?:^|${space_makaf_class})(?:${ylmnr_shva}|ת${dagesh}?${shva}[דטצ])|([א-יל-עצ-רת])${dagesh}?${shva}\\1|([כפ]${dagesh})${shva}\\2|([כפ])${shva}\\3(?!${dagesh})|ש${dagesh}?\u05c1${dagesh}?${shva}ש${dagesh}?\u05c1|ש${dagesh}?\u05c2${dagesh}?${shva}ש${dagesh}?\u05c2|${shva}${alefbet_class}[${dots}]?${shva}ךָ|${shva}${ylmnr_shva}${alefbet_class}(?!$[{dots}]*(${shva}|${space_makaf_class}|$))| ${vav}${shva}(\\p{L}\\p{M}*){2}`, 'u')

const morse_regex = RegExp(`[${dit_dah}]+`, 'g')
const non_morse_regex = RegExp(`[^${dit_dah}]`)
const non_code_regex = RegExp(`[^\\s${special}${dit_dah}]+`, 'g')

const sep_string = `(?<=[^\\s${punct}])[${default_sep}] (?= *[^\\s${punct}])`
const sep_regex = RegExp(sep_string, 'g')
const split_string = `${sep_string}\\s*|\\s+|(?=[${special}])|(?<=[${special}])`
const split_regex = RegExp(`${split_string}`)
const partition_regex = RegExp(`(${split_string})`)

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

const is_ios = navigator.platform.startsWith('iP')
const is_mac = navigator.platform.startsWith('Mac') || is_ios
const is_firefox_android = navigator.userAgent.includes('Firefox') && navigator.userAgent.includes('Android')
const is_mobile = navigator.userAgent.includes('Android') || is_ios

if (is_ios)
    document.querySelector('meta[name=viewport]').content += ', maximum-scale=1'

const model_device = navigator.gpu && !is_mobile ? 'webgpu' : 'wasm'
const model_quant = model_device == 'wasm' ? 'int8' : 'fp16'

Object.entries(morse).filter(([k, v]) => non_morse_regex.test(v)).forEach(([k, v]) => alert(`Bad ${k}: ${v}`))
const reverse_morse = Object.fromEntries(Object.entries(morse).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([k, v]) => [v, k]))
const proto_selects = {}
let morse_words_types
let last_hash, legacy_select, ready, rebuild, recent_input
let model, tokenizer

function join_lines(words, sep='') {
    return [...main.querySelectorAll('.line')].map(line => [...line.children].map(words).filter(Boolean).join(sep + ' ')).filter(Boolean).join('\n')
}

function join_inputs() {
    return join_lines(word => word.firstChild.value.trim())
}

function make_hash() {
    return encodeURIComponent('\t' + output.value).replace(final_punct_regex, c => '%' + c.charCodeAt().toString(16).toUpperCase())
}

function update_output(text, push=true) {
    try {
        if (typeof text == 'string')
            output.dataset.prev_value = output.value = text
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

main.addEventListener('change', e => update_output(join_lines(word => [...word.lastChild.children].map(select => select.value).join(' '), '\t').replace(fix_space_regex, '').replaceAll('\t', default_sep), !event.detail?.skip_push))

function change_output_with_selection() {
    const dir = output.selectionDirection
    const prev_text = output.value
    main.dispatchEvent(new Event('change'))
    const text = output.value
    if (main.querySelector('.selected') && text != prev_text) {
        const [head, tail] = diff(text, prev_text)
        output.setSelectionRange(head, tail, dir)
    }
}

checkboxes.addEventListener('change', event => {
    if (event.target == remember)
        if (remember.checked)
            checkboxes.querySelectorAll('input').forEach(input => localStorage['morse_' + input.id] = input.checked)
        else
            localStorage.removeItem('morse_remember')
    else {
        if (remember.checked)
            localStorage['morse_' + event.target.id] = event.target.checked
        build_selects()
    }
})

addEventListener('copy', event => {
    /* Augment regular copy with:
       1. On select element - Copy selected value (doesn't work for open legacy select elements in Chrome)
       2. On output when no selection - Copy all output
       3. Otherwise when no selection - Copy all input
    */
    const ae = document.activeElement
    if ((event.target.selectionStart == event.target.selectionEnd || ae.closest('select')) && ([output, document.body].includes(ae) || main.contains(ae))) {
        event.preventDefault()
        event.clipboardData.setData('text/plain', ae == output || ae.closest('select') ? ae.value : join_inputs())
    }
})

function measure(name, start_time) {
    console.log(`${name} took ${((performance.now()-start_time) / 1000).toLocaleString(undefined, {maximumFractionDigits: 1})}s.`)
}

function norm(text) {
    text = text.replace(wrong_order_nikud_regex, '$2$1').replace(wrong_order_dots_regex, '$2$1')
    return text.trim().replace(whitespace_regex, ' ').replace(newline_regex, '\n').replaceAll('\u05f3', "'").replaceAll('\u05f4', '"').replaceAll('\u2011', '-')
}

function to_makaf(text) {
    return text.replace(space_hyphen_regex, makaf)
}

function remove_trailing_makaf(text='') {
    return text.replace(trailing_makaf_regex, '')
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

function select_option(select, option) {
    if (legacy_select || !select.matches(':open')) {
        option.selected = true
        select.dispatchEvent(new CustomEvent('change', {bubbles: true, detail: {skip_push: true}}))
    } else
        option.focus()
}

function paste_input(text='', focus=true, push=true, word=main) {
    const start_time = performance.now()
    if (!main.querySelector('.word'))
        return
    text = norm(text)
    const select = word.closest('select')
    if (select) {
        if (!alefbet_regex.test(text))
            return
        text = remove_trailing_makaf(to_makaf(text))
        const len = select.length
        const index = legacy_select ? select.selectedIndex : select.querySelector('option:focus-visible')?.index ?? select.selectedIndex ?? 0
        for (let i = 1; i <= len; i++) {
            const option = select[(index + i) % len]
            if (option.value.startsWith(text)) {
                select_option(select, option)
                return true
            }
        }

        if (text.length == 1)
            return
        const word_parts = get_word_parts(text)
        for (let i = 1; i <= len; i++) {
            const option = select[(index + i) % len]
            if (partial_match(option.value, word_parts)) {
                select_option(select, option)
                return true
            }
        }
        return
    }

    if (word.tagName == 'INPUT' && !/\s/.test(text))
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
    measure('paste_input', start_time)
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
        if (ae != output && (main.contains(ae) || !join_inputs()) && paste_input(event.clipboardData.getData('text/plain'), ae == document.body, true, ae))
            event.preventDefault()
    } catch {}
})

function find_option(select, value) {
    return [...select].find(opt => opt.value == value)
}

function make_option(text, value) {
    return new Option(text, value != text ? value : undefined)
}

function find_add_select_option(select, word, prev_option) {
    const trailless = remove_trailing_makaf(word)
    let option = find_option(select, trailless)
    if (!option) {
        option = prev_option?.cloneNode(true) || make_option(word, trailless)
        select.add(option, 0)
        if (select.dataset.old_index)
            select.dataset.old_index = +select.dataset.old_index + 1
        if (select.dataset.last_index)
            select.dataset.last_index = +select.dataset.last_index + 1
        if (select.name != joker && !find_option(proto_selects[select.name], option.value))
            proto_selects[select.name].add(option.cloneNode(true), 0)
    }
    option.selected = true
}

function paste_output(text='', focus=true, push=true) {
    const start_time = performance.now()
    const {selectionStart, selectionEnd, selectionDirection} = output
    const prev_words = [...main.querySelectorAll('.word > div')].filter(div => [...div.children].some(select => select.length > 1))
                                                                .map(div => [...div.children].map(select => ({name: select.name, value: select.value, untouched: select.classList.contains('untouched')})))
    const norm_text = norm(text)
    const ae1 = document.activeElement
    paste_input(norm_text.replace(hebrew_block_quotes_regex, m => nikud_regex.test(m) && !bad_nikud_regex.test(m) ? m : joker)
                         .replace(morse_regex, '').replace(hirik_regex, dit).replace(a_vowel_regex, dah).replace(non_code_regex, '')
                         .replace(morse_regex, m => reverse_morse[m] && !dont_show.includes(reverse_morse[m]) ? reverse_morse[m] : joker)
                         .replace(non_punct_regex, '').replace(sep_regex, ' ')
                         .replace(final_regex, m => String.fromCharCode(m.charCodeAt() - 1)), false, false)
    const output_words = norm_text.replace(non_text_regex, '').split(split_regex).map(to_makaf)
    main.querySelectorAll('select').forEach((select, i) => {
        find_add_select_option(select, output_words[i])
        select.dispatchEvent(new Event('change'))
        const prev_select = prev_words[[...main.querySelectorAll('.word > div')].indexOf(select.parentElement)]?.[[...select.parentElement.children].indexOf(select)]
        if (prev_select?.untouched && prev_select.name == select.name && prev_select.value == select.value)
            select.classList.add('untouched')
    })
    update_output(text, push)
    const ae2 = document.activeElement
    output.setSelectionRange(selectionStart, selectionEnd, selectionDirection)
    const ae3 = document.activeElement
    if (focus || ae2 != ae1) {
        const first_word = main.querySelector('.word')
        ;(first_word.firstChild.value.trim() ? add_word() : first_word).firstChild.focus()
    } else if (ae3 != ae2)  // In Safari and iOS selection steals the focus
        ae2.focus()
    measure('paste_output+paste_input', start_time)
}

output.addEventListener('change', () => {
    if (output.value != (output.dataset.prev_value ?? '')) {
        output.dataset.prev_value = output.value
        paste_output(output.value, false)
    }
})

output.addEventListener('keydown', event => {
    if ((event.key == 'Enter' && (event.ctrlKey && !is_mac || event.metaKey && is_mac)
        || event.key == 'Tab' && event.shiftKey && !event.ctrlKey && !event.metaKey)
        && !event.altKey && !event.getModifierState?.('AltGraph'))
        output.dispatchEvent(new Event('change'))
})

output.addEventListener('selectionchange', () => {
    let text = output.value
    let start = output.selectionStart
    let end = output.selectionEnd
    let start_word, end_word
    if (end > start && text == output.dataset.prev_value) {
        text = text.slice(0, start) + '\x01' + text.slice(start, end) + '\x02' + text.slice(end)
        let norm_text = norm(text).replace(non_text_regex, m => m.replace(/[^\x01\x02]/g, ''))
        start = norm_text.indexOf('\x01')
        norm_text = norm_text.slice(0, start) + norm_text.slice(start + 1)
        end = norm_text.indexOf('\x02')
        norm_text = norm_text.slice(0, end) + norm_text.slice(end + 1)
        const parts = norm_text.split(partition_regex)
        let pos = 0
        for (let i = 0; i < parts.length; i++) {
            const pos_end = pos + parts[i].length
            if (start >= pos && start < pos_end)
                start_word = (i+1) / 2 | 0
            if (end > pos && end <= pos_end) {
                end_word = i / 2 | 0
                break
            }
            pos = pos_end
        }
    }
    main.querySelectorAll('select').forEach((select, i) => select.classList.toggle('selected', i >= start_word && i <= end_word))
})

function update_index(select) {
    if (select.dataset.last_index != select.selectedIndex) {
        select.dataset.old_index = select.dataset.last_index || ''
        select.dataset.last_index = select.selectedIndex
    }
}

function get_selected(ae) {
    const indices = []
    let start, end, all
    let divs = ae == output ? main.querySelectorAll('.word > div:has(.selected)') : []
    if (!divs.length) {
        divs = main.querySelectorAll('.word > div')
        all = true
        if (main.contains(ae))
            if (ae.tagName == 'INPUT' && ae.selectionEnd > ae.selectionStart) {
                divs = [ae.nextElementSibling]
                start = ae.selectionStart
                end = ae.selectionEnd
                all = false
            } else {
                const select = ae.closest('select')
                if (select) {
                    divs = [select.parentElement]
                    indices.push([...divs[0].children].indexOf(select))
                    all = false
                }
            }
    }
    return [start, end, divs, indices, all]
}

function diff(text, prev_text) {
    const prev_len = prev_text.length
    const len = text.length
    const min_len = Math.min(len, prev_len)
    let fwd = 0
    let rev = 0
    while (fwd < min_len && text[fwd] == prev_text[fwd])
        fwd++
    while (rev < min_len - fwd && text[len - 1 - rev] == prev_text[prev_len - 1 - rev])
        rev++
    return [fwd, len - rev, prev_len - len]
}

function randomize() {
    const start_time = performance.now()
    const ae = document.activeElement
    if (ae == output || ae.tagName == 'INPUT' && main.contains(ae))
        ae.dispatchEvent(new Event('change'))
    const [start, end, divs, indices, all] = get_selected(ae)
    for (const div of divs)
        for (let i = 0; i < div.childElementCount; i++) {
            const select = div.children[i]
            if (select.name in morse && select.length > 1 && (all || i >= start && i < end || ae == output && select.matches('.selected') || indices.includes(i))) {
                select.selectedIndex = Math.random() * select.length | 0
                update_index(select)
                select.classList.add('untouched')
            }
        }
    change_output_with_selection()
    measure('randomize', start_time)
}

async function yield() {
    globalThis.scheduler?.yield?.() || new Promise(setTimeout)  // Force CSS update. See: https://web.dev/articles/optimize-long-tasks
}

async function load_model(model_id, model_quant, model_device) {
    try {
        const start_time = performance.now()
        const {AutoTokenizer, AutoModel} = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers')
        if (!tokenizer) {
            tokenizer = await AutoTokenizer.from_pretrained(model_id)
            tokenizer._tokenizer.added_tokens.find(t => t.content == tokenizer.mask_token).lstrip = mask_lstrip
        }
        if (!model)
            model = await AutoModel.from_pretrained(model_id, {device: model_device, dtype: model_quant})
        measure('load_model', start_time)
        console.log({model_id, model_device, model_quant, mask_lstrip, masks_for_missing_word})
    } catch (error) {
        console.error(error)
    }
}

function make_phrase_part(words, num_masks=masks_for_missing_word) {
    const mask = tokenizer.mask_token.repeat(num_masks)
    const part = words.map(w => w ?? mask).join(' ').replaceAll(makaf, ' ')
    if (part)
        return ' ' + part
    return ''
}

async function optimize_word(phrase_words, index, candidates) {
    /* Based on: PET with Multi Masks (max-first decoding),
       in Schick and Schütze (2021), https://arxiv.org/abs/2009.07118
       Code: https://github.com/timoschick/pet/blob/master/pet/task_helpers.py
    */
    let prefix = make_phrase_part(phrase_words.slice(0, index))
    const suffix = make_phrase_part(phrase_words.slice(index + 1))
    if (!mask_lstrip && prefix.startsWith(' ' + tokenizer.mask_token))
        prefix = prefix.slice(1)
    const mask_start = tokenizer.encode(prefix).length - 1

    let lengths = Object.keys(candidates).map(Number).sort((a, b) => a - b)
    const sequences = lengths.map(len => `${prefix}${tokenizer.mask_token.repeat(len)}${suffix}`)
    const tokens = tokenizer(sequences, {model_max_length: model_max_length || tokenizer.model_max_length, padding: true, truncation: true})
    const Tensor = tokens.input_ids.constructor

    let left_masks = [...lengths]
    let batch_available_masks = lengths.map(len => [...Array(len).keys()])
    let batch_size = lengths.length
    let active_rows = batch_size
    const initial_batch_size = batch_size

    const log_sum_exp = new Float32Array(lengths[batch_size - 1])
    let joint_log_probs = new Float32Array(batch_size)
    let best_words = Array(batch_size)

    const active_candidates = structuredClone(candidates)

    let best_completed_prob = -Infinity
    let best_completed_word, logits

    try {
        while (true) {
            await yield()
            ;({logits} = await model(tokens))
            const data = logits.data
            const seq_length = logits.dims[1]
            const vocab_size = logits.dims[2]

            for (let b = 0; b < batch_size; b++) {
                const len = lengths[b]
                if (!left_masks[b])
                    continue

                const seq_offset = b*seq_length + mask_start
                const available_masks = batch_available_masks[b]

                if (initial_batch_size > 1 || left_masks[b] > 1)
                    for (let m_idx = 0; m_idx < available_masks.length; m_idx++) {
                        const i = available_masks[m_idx]
                        const flat_offset = (seq_offset+i) * vocab_size
                        const logits_slice = data.subarray(flat_offset, flat_offset + vocab_size)

                        let max = -Infinity
                        for (let j = 0; j < vocab_size; j++)
                            if (logits_slice[j] > max)
                                max = logits_slice[j]

                        let sum_exp = 0
                        for (let j = 0; j < vocab_size; j++)
                            sum_exp += Math.exp(logits_slice[j] - max)

                        log_sum_exp[i] = max + Math.log(sum_exp)
                    }
                else
                    log_sum_exp[available_masks[0]] = 0

                let best_prob = -Infinity
                let best_word_idx, best_rel_pos, best_mask_idx

                for (let m_idx = 0; m_idx < available_masks.length; m_idx++) {
                    const rel_pos = available_masks[m_idx]
                    const active_list = active_candidates[len]

                    for (let w_idx = 0; w_idx < active_list.length; w_idx++) {
                        const target_token_id = active_list[w_idx][1][rel_pos]
                        const prob = data[(seq_offset+rel_pos)*vocab_size + target_token_id] - log_sum_exp[rel_pos]

                        if (prob > best_prob) {
                            best_prob = prob
                            best_word_idx = w_idx
                            best_rel_pos = rel_pos
                            best_mask_idx = m_idx
                        }
                    }
                }

                joint_log_probs[b] += best_prob

                if (joint_log_probs[b] <= best_completed_prob) {
                    left_masks[b] = 0
                    active_rows--
                    continue
                }

                best_words[b] = active_candidates[len][best_word_idx]
                const best_token_id = best_words[b][1][best_rel_pos]

                tokens.input_ids.data[seq_offset + available_masks[best_mask_idx]] = BigInt(best_token_id)
                available_masks.splice(best_mask_idx, 1)
                left_masks[b]--

                if (!left_masks[b]) {
                    active_rows--
                    if (joint_log_probs[b] > best_completed_prob) {
                        best_completed_prob = joint_log_probs[b]
                        best_completed_word = best_words[b][0]
                    }
                }

                active_candidates[len] = active_candidates[len].filter(c => c[1][best_rel_pos] == best_token_id)

                if (initial_batch_size == 1 && active_candidates[len].length == 1)
                    return best_words[b][0]
            }

            if (!active_rows)
                return best_completed_word

            if (active_rows < batch_size) {
                const new_input_data = new BigInt64Array(active_rows * seq_length)
                const new_attention_data = new BigInt64Array(active_rows * seq_length)

                let dest_b = 0
                for (let b = 0; b < batch_size; b++)
                    if (left_masks[b]) {
                        new_input_data.set(tokens.input_ids.data.subarray(b * seq_length, (b + 1) * seq_length), dest_b * seq_length)
                        new_attention_data.set(tokens.attention_mask.data.subarray(b * seq_length, (b + 1) * seq_length), dest_b * seq_length)
                        joint_log_probs[dest_b++] = joint_log_probs[b]
                    }

                tokens.input_ids.dispose()
                tokens.attention_mask.dispose()
                tokens.input_ids = new Tensor('int64', new_input_data, [active_rows, seq_length])
                tokens.attention_mask = new Tensor('int64', new_attention_data, [active_rows, seq_length])

                lengths = lengths.filter((_, b) => left_masks[b])
                batch_available_masks = batch_available_masks.filter((_, b) => left_masks[b])
                best_words = best_words.filter((_, b) => left_masks[b])
                left_masks = left_masks.filter(m => m)
                joint_log_probs = joint_log_probs.subarray(0, active_rows)
                batch_size = active_rows
            }

            logits.dispose()
        }
    } catch (error) {
        console.error(error)
    } finally {
        tokens.input_ids.dispose()
        tokens.attention_mask.dispose()
        logits?.dispose()
    }
}

async function optimize_phrase(words) {
    const out_words = words.map(x => x[1])
    const opt_words = words.filter(x => x[0])
    const all_tokens = {}

    for (const char of new Set(opt_words.map(x => x[0]))) {
        all_tokens[char] = {}
        const char_words = [...proto_selects[char]].map(select => select.value)
        const all_ids = tokenizer(char_words.map(word => ' ' + word.replaceAll(makaf, ' ')), {add_special_tokens: false, return_attention_mask: false, return_tensor: false}).input_ids
        for (let i = 0; i < char_words.length; i++) {
            const len = all_ids[i].length
            if (!all_tokens[char][len])
                all_tokens[char][len] = []
            all_tokens[char][len].push([char_words[i], all_ids[i]])
        }
    }

    for (const [char, w, i] of opt_words)
        if (Object.keys(all_tokens[char]).length)
            out_words[i] = await optimize_word(out_words, i, all_tokens[char])
    return out_words
}

async function suggest_phrase(selects, indices, rewrite) {
    const adjustable = selects.map((select, i) => proto_selects[select.name].length > 1 && (!indices.length || indices.includes(i)))
    for (let i = 0; i <= adjustable.length; i++)
        if (adjustable[i])
            selects[i].classList.add('thinking')
    ;(await optimize_phrase(selects.map((select, i) => [adjustable[i] ? select.name : null, rewrite || !adjustable[i] ? select.value : null, i]))).forEach((word, i) => {
        if (adjustable[i] && word) {
            find_add_select_option(selects[i], word)
            selects[i].dispatchEvent(new Event('change'))
            selects[i].classList.replace('thinking', 'untouched')
        }
    })
    selects.length = 0
    indices.length = 0
}

async function suggest(rewrite) {
    const robot = buttons.querySelectorAll('.robot')[rewrite | 0]
    if (robot.classList.contains('thinking'))
        return
    robot.classList.add('thinking')
    const ae = document.activeElement
    overlay.showModal()
    await yield()

    if (output.value.trim()) {
        if (!tokenizer || !model)
            await load_model(model_id, model_quant, model_device)
        if (tokenizer && model) {
            const start_time = performance.now()
            const [start, end, divs, indices] = get_selected(ae)
            const selects = []
            for (const div of divs) {
                for (let i = 0; i < div.childElementCount; i++) {
                    const select = div.children[i]
                    if (select.name in morse && select.length) {
                        if (i >= start && i < end || ae == output && select.matches('.selected'))
                            indices.push(selects.length)
                        selects.push(select)
                    } else
                        await suggest_phrase(selects, indices, rewrite)
                }
                await suggest_phrase(selects, indices, rewrite)
            }
            change_output_with_selection()
            measure(rewrite ? 'rewrite' : 'suggest', start_time)
        }
    }
    robot.classList.remove('thinking')
    overlay.close()
}

overlay.addEventListener('keydown', event => {  // For Safari: https://bugs.webkit.org/show_bug.cgi?id=284592
    if (event.key == 'Escape' && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey && !event.getModifierState?.('AltGraph'))
        event.preventDefault()
})

function keep_focus(event) {
    if (!event.button) {
        const ae = document.activeElement
        if (ae == output || main.contains(ae) && (ae.tagName == 'INPUT' || ae.closest('select')))
            event.preventDefault()
    }
}

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
    if (event.relatedTarget?.id == 'overlay')
        return
    const input = event.currentTarget
    setTimeout(() => {  // In Chrome, element removal triggers a blur event before the removal, and if our blur handler itself removes the element in transit, the original remove would then fail. This covers edge cases outside the normal flow, such as popstate. See: https://stackoverflow.com/a/22934552/664456
        if (input.isConnected && !remove_word(input))
            input.value = input.value.replace(/\s+/g, '')
    })
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
    const select_container = word.appendChild(document.createElement('div'))

    input.addEventListener('blur', blur)

    input.addEventListener('change', () => {
        if (!rebuild && input.value == (input.dataset.prev_value ?? ''))
            return
        input.dataset.prev_value = input.value
        const prev_chars = [...select_container.children].map(select => select.name)
        const chars = [...to_middle(input.value.toLowerCase())].map(char => reverse_morse[morse[char]] || char).filter(char => proto_selects[char]?.length)
        const [head, tail, delta] = diff(chars, prev_chars)
        for (let i = 0; i < delta; i++)
            select_container.children[head].remove()

        chars.forEach((char, i) => {
            if ((i < head || i >= tail) && !rebuild)
                return
            const select = proto_selects[char].cloneNode(true)

            select.addEventListener(is_firefox_android ? 'blur' : 'click', () => select.classList.remove('untouched'), {once: true})  // Avoid Firefox Android issue: https://bugzilla.mozilla.org/show_bug.cgi?id=2031292

            select.addEventListener('change', () => {
                select.classList.remove('untouched')
                update_index(select)
                if (select.name != joker) {
                    const options = [...proto_selects[select.name]]
                    const option = options[select.selectedIndex]
                    options.forEach(opt => opt.defaultSelected = false)
                    option.defaultSelected = true
                }
            })

            select.addEventListener('keydown', event => {
                if (event.ctrlKey && is_mac || event.metaKey && !is_mac)
                    return
                const is_alt = event.altKey || event.getModifierState?.('AltGraph')
                const line = word.parentElement
                if (['Enter', ' '].includes(event.key) && !is_alt || ['ArrowUp', 'ArrowDown'].includes(event.key) && is_alt) {
                    select.classList.remove('untouched')
                    if (event.key == 'Enter')  // For Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1912527
                        select.showPicker?.()
                } else if (!is_alt)
                    if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                        event.preventDefault()
                        select_option(select, select[((legacy_select ? select.selectedIndex : select.querySelector('option:focus-visible')?.index ?? select.selectedIndex ?? 0) + (event.key == 'ArrowDown' ? 1 : -1)) % select.length])
                    } else if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
                        event.preventDefault()
                        const all_selects = main.querySelectorAll('select')
                        all_selects[([...all_selects].indexOf(select) + (event.key == 'ArrowLeft' ? 1 : -1) + all_selects.length) % all_selects.length].focus()
                    } else if (!event.ctrlKey && !event.metaKey)
                        if (event.key == '-' || event.code == 'Minus' && event.shiftKey) {
                            event.preventDefault()
                            const len = select.length
                            const index = legacy_select ? select.selectedIndex : select.querySelector('option:focus-visible')?.index ?? select.selectedIndex ?? 0
                            for (let i = 1; i <= len; i++) {
                                const option = select[(index + (event.key == '-' ? i : -i) + len) % len]
                                if (middle_makaf_regex.test(option.value)) {
                                    select_option(select, option)
                                    break
                                }
                            }
                        } else if (event.key == 'Backspace' && select.dataset.old_index) {
                            event.preventDefault()
                            select_option(select, select[select.dataset.old_index])
                        } else if (event.key == 'Tab' && !event.shiftKey && !select.nextElementSibling && !word.nextElementSibling && !line.nextElementSibling)
                            add_word(line)
            })

            const prev_select = select_container.children[i]
            if (i >= head && i < tail)
                select.classList.add('untouched')
            else if (rebuild)
                find_add_select_option(select, prev_select.value, prev_select.selectedOptions[0])
            if (i >= head && select_container.childElementCount < chars.length)
                select_container.insertBefore(select, prev_select);
            else
                prev_select.replaceWith(select)

            legacy_select = getComputedStyle(select).appearance != 'base-select'
        })
    })

    input.addEventListener('keydown', event => {
        const is_alt = event.altKey || event.getModifierState?.('AltGraph')
        if (event.ctrlKey && is_mac || !is_mac && (event.metaKey || is_alt))
            return
        const is_ctrl = event.ctrlKey || event.metaKey
        const is_mod = is_ctrl || is_alt
        let line = word.parentElement
        const line_had_text = input.value.trim() || line.childElementCount > 1
        if (event.key == 'Tab' && !event.shiftKey && !is_mod || event.key == 'Enter' && is_ctrl)  // Only in Firefox Ctrl+Enter natively triggers a change event for input elements
            input.dispatchEvent(new Event('change', {bubbles: event.key == 'Enter'}))
        else if ((event.key == 'End' || event.key == 'Home' || ['ArrowDown', 'ArrowUp'].includes(event.key) && is_ctrl) && !event.shiftKey && !is_alt)
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
        else if ((event.key == ' ' || event.key == 'Enter' && line_had_text || ['ArrowDown', 'ArrowUp'].includes(event.key) && !event.shiftKey) && !is_mod
            || (event.key == 'ArrowLeft' && input.selectionStart == input.value.length
            || (event.key == 'ArrowRight' || event.key == 'Backspace' && (word.previousElementSibling || line.previousElementSibling)) && !input.selectionEnd
            || event.key == 'Delete' && input.selectionStart == input.value.length && (word.nextElementSibling || line.nextElementSibling)) && !event.metaKey) {
            let elem
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
                if (is_mod)
                    elem = word.previousElementSibling
                else {
                    input.focus()
                    input.dispatchEvent(new Event('change', {bubbles: true}))
                }
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
                let skip_lf
                if (event.key == 'Enter') {
                    const new_line = add_line(line)
                    if (!event.shiftKey) {
                        skip_lf = (!input.value.trim() || !input.selectionStart) && !word.previousElementSibling
                        let line_words = [...line.children]
                        line_words = line_words.slice(line_words.indexOf(word) + (input.value.trim() && !!input.selectionStart || !input.value.trim() && !word.previousElementSibling))
                        if (line_words.length) {
                            input.removeEventListener('blur', blur)  // Don't remove the focused input even if it's empty
                            new_line.replaceChildren(...line_words)
                            input.addEventListener('blur', blur)
                            if (!line.childElementCount)
                                add_word(line).firstChild.focus()
                            input.dispatchEvent(new Event('change', {bubbles: true}))
                        }
                    }
                }
                if (!skip_lf)
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
            if (!is_mod)
                event.preventDefault()
        }
    })

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
    if (event.altKey || event.getModifierState?.('AltGraph'))
        return
    const elem = event.target
    if (event.key == 'Escape' && !event.shiftKey && !event.ctrlKey && !event.metaKey && elem.selectionStart != elem.selectionEnd) {  // Remove selection
        const caret = elem.selectionDirection == 'forward' ? elem.selectionEnd : elem.selectionStart
        elem.setSelectionRange(caret, caret)
    } else if (event.key == ' ' && (event.ctrlKey && !is_mac || event.metaKey && is_mac)) {
        event.preventDefault()
        let caret
        if (elem.tagName == 'INPUT' && elem.selectionStart == elem.selectionEnd && elem.value.trim() && main.contains(elem)) {
            caret = elem.selectionEnd
            elem.select()
        }
        suggest(event.shiftKey).then(() => {
            if (caret != null)
                elem.setSelectionRange(caret, caret)
        })
    }
})

function paste_hash(pop, focus=false) {
    last_hash = decodeURIComponent(location.hash.slice(1))
    if (ready)
        if (/^\t./.test(last_hash))
            paste_output(last_hash.slice(1), focus, false)
        else if (pop) {
            const ae = document.activeElement
            paste_input('', ae == document.body || main.contains(ae), false)
        }
}

function add_dagesh(word, bk) {
    if (!bk && 'אהחערכפ'.includes(word[0]) || bk && !(bet + kaf).includes(word[0]) || word[1] == dagesh)
        return word
    return word[0] + dagesh + word.slice(1)
}

function build_selects(focus=false) {
    const start_time = performance.now()
    ready = false
    rebuild = true
    const ae = document.activeElement
    const {selectionStart, selectionEnd, selectionDirection} = ae

    const word_types = Object.assign({}, ...Object.values(morse_words_types))
    prepositions2.forEach(word => {
        if (!word_types[word])
            word_types[word] = 1
    })

    const morse_words = Object.fromEntries(Object.entries(morse_words_types).map(([k, v]) => [k, Object.keys(v)]))

    function filter_possessive(words) {
        return words.filter(word => word_types[word] != 1 || nonfinal_space_makaf_regex.test(word)
                            || prepositions1.has(word) || prepositions2.has(word)
                            || !possessive_suffixes.some(suffix => word.endsWith(suffix)))
    }

    let min_count = Infinity
    let max_count = 0
    let total_count = 0

    Object.entries(reverse_morse).forEach(([code, char]) => {
        if (!morse_words[char])
            morse_words[char] = []
        if (!allow_possessive.checked)
            morse_words[char] = filter_possessive(morse_words[char])

        const add_bvkl = [...bet.slice(0, add_prep_b.checked) + vav.slice(0, add_prep_v.checked) + kaf.slice(0, add_prep_k.checked) + lamed.slice(0, add_prep_l.checked)]
        const add_bhkl = [...bet.slice(0, add_article_b.checked) + he.slice(0, add_article_h.checked) + kaf.slice(0, add_article_k.checked) + lamed.slice(0, add_article_l.checked)]
        if (code.length > 1 && (add_bvkl.length
           || code[0] == dah && add_bhkl.length
           || code[0] == dit && add_prep_m.checked)) {
            const tail_char = reverse_morse[code.slice(1)]
            let words = Object.keys(morse_words_types[tail_char]).filter(word => !conj_mwe_regex.test(word))
            if (!allow_possessive.checked)
                words = filter_possessive(words)
            if (words.length) {
                morse_words[char].push('')  // For <hr>
                if (code[0] == dah)
                    bhvkl.forEach(prefix => morse_words[char] = morse_words[char].concat(words.flatMap(word => {
                        const result = []
                        if (add_bvkl.includes(prefix) && (prefix == vav || word_types[word]) && hataf_patah_regex.test(word))
                            result.push(add_dagesh(prefix, true) + patah + word)
                        if (add_bhkl.includes(prefix) && word_types[word] == 2 && !skip_article_regex.test(word))
                            result.push(add_dagesh(prefix, true) + (['הַר', 'עַם', 'פַּר'].includes(word) ? (word == 'פַּר' ? patah : kamats) + word.replace(patah, kamats) : ('ארע'.includes(word[0]) ? kamats : patah) + add_dagesh(word)))
                        return result
                    })))
                else {
                    add_bvkl.forEach(prefix => morse_words[char] = morse_words[char].concat(words.filter(word => (prefix == vav && word[0] == yod || word_types[word]) && initial_shva_regex.test(word))
                                                                       .map(word => add_dagesh(prefix, true) + hirik + (word[0] == yod ? word.replace(shva, '') : word.replace('(?<=^.)' + dagesh, '')))))
                    if (add_prep_m)
                        morse_words[char] = morse_words[char].concat(words.filter(word => word_types[word] && !'אהחער'.includes(word[0])).map(word => mem + hirik + add_dagesh(word)))
                }
                morse_words[char] = [...new Set(morse_words[char])]
            }
        }

        if (!allow_shva_na.checked)
            morse_words[char] = morse_words[char].filter(word => !shva_na_regex.test(word) && !conj_mwe_regex.test(word))
        if (!allow_nonacronyms.checked)
            morse_words[char] = morse_words[char].filter(word => !word || word.startsWith(char))
        morse_words[char] = morse_words[char].filter(word => !space_final_makaf_regex.test(word) || !morse_words[char].includes(remove_trailing_makaf(word.replaceAll(' ', makaf))))

        if (!morse_words[char][0])
            morse_words[char].shift()
        if (limit)
            morse_words[char] = morse_words[char].slice(0, limit)  // May be off by one due to <hr>
        if (!morse_words[char][morse_words[char].length - 1])
            morse_words[char].pop()

        proto_selects[char] = document.createElement('select')
        for (let word of morse_words[char]) {
            word = word.replaceAll(' ', makaf)
            const trailless = remove_trailing_makaf(word)
            proto_selects[char].appendChild(word ? make_option(word, trailless) : document.createElement('hr'))
        }
        const len = proto_selects[char].length
        min_count = Math.min(min_count, len)
        max_count = Math.max(max_count, len)
        total_count += len
        console.log(char, len)
    })
    console.log({total_count})

    for (const char of special) {
        proto_selects[char] = document.createElement('select')
        proto_selects[char].add(new Option(char))
    }

    if (!main.querySelector('.line'))
        add_line().firstChild.firstChild.focus()

    Object.entries(proto_selects).forEach(([char, select]) => {
        select.name = char
        if (char == joker)
            select.style.backgroundColor = error_color
        else if (select.length == 1)
            select.style.backgroundColor = single_color
        else if (select.length <= rare_count && max_count > rare_count)
            select.style.backgroundColor = rare_color
        else if (select.length <= medium_count && min_count <= rare_count && max_count > medium_count)
            select.style.backgroundColor = medium_color
    })

    ready = true
    measure('build_selects', start_time)
    paste_hash(false, focus)
    if (!focus && ae.tagName == 'INPUT' && main.contains(ae))
        ae.setSelectionRange(selectionStart, selectionEnd, selectionDirection)
    rebuild = false
}

const global_start_time = performance.now()
fetch('morse.json').then(response => response.json()).then(json => {
    morse_words_types = json
    measure('Loading dictionary', global_start_time)
    if (localStorage.morse_remember == 'true')
        checkboxes.querySelectorAll('input').forEach(input => input.checked = localStorage['morse_' + input.id] == 'true')
    build_selects(true)
    measure('Startup', global_start_time)
    //save_words(morse_words)
})