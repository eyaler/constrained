sidebyside_align()
forward.innerHTML = forward.textContent.replace(/\p{L}/gu, '<span>$&</span>')
backward.innerHTML = backward.textContent.replace(/\S/g, '<span>$&</span>').replace(/\S+/g, '<span>$&</span>').replace(/\n{2,}|:<\/span><\/span>\n/g, '$&<span><span></span></span>')
const reverse_spans = [...forward.children].toReversed()
const spans = backward.querySelectorAll('span > span')

const lang = get_lang()
if (lang)
    [reverse_button.innerHTML, reverse_button.title] = [reverse_button.title, reverse_button.innerHTML]

const anim_dur_ms = 500
const part_times_ms = [[27500, 187.5], [54000, 190], [78000, 183.5], [102000, 280]]
let start_time

function scroll_into_view(event_or_elem) {
    (event_or_elem.currentTarget || event_or_elem).scrollIntoView({behavior: 'smooth', block: 'nearest'})
}

reverse_button.onclick = () => {
    reverse_button.style.visibility = 'hidden'
    backward.style.setProperty('--anim_dur', anim_dur_ms + 'ms')
    document.body.classList.add('hide_cursor')
    addEventListener('mousemove', show_hide_cursor)
    setTimeout(() => blobs.style.visibility = 'visible', 15000)
    setTimeout(scroll_into_view, 21000, h1)
    setTimeout(() => h1.textContent = lang ? 'White rabbit' : 'הארנב הלבן', 24000)
    start_time = performance.now()
    setTimeout(reverse, part_times_ms[0][0], 0)
    audio.play()
}

let index = 0, reverse_index = 0

function reverse(part) {
    if (!index)
        backward.classList.remove('hide')
    const span = spans[index]
    if (span.textContent.match(/\p{L}/u)) {
        if (!reverse_index && span.textContent != reverse_spans[reverse_index].textContent)
            reverse_index++
        const from = reverse_spans[reverse_index].getBoundingClientRect()
        const to = span.getBoundingClientRect()
        span.style.setProperty('--x', from.x - to.x + 'px')
        span.style.setProperty('--y', from.y - to.y + 'px')
        reverse_index++
        span.classList.add('move')
    } else {
        span.classList.add('reveal')
        if (span.textContent.match(/\p{M}/u))
            span.classList.add('nikud')
    }
    span.addEventListener('animationend', scroll_into_view)
    index++
    let t = 0
    if (index < spans.length) {
        if (!span.textContent) {
            part++
            t = part_times_ms[part][0] - performance.now() + start_time
        } else if (!span.textContent.match(/\p{M}/u))
            t = part_times_ms[part][1]
        setTimeout(reverse, t, part)
    }
}