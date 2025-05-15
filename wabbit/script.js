sidebyside_align()
forward.innerHTML = forward.textContent.replace(/\p{L}/gu, '<span>$&</span>')
backward.innerHTML = backward.textContent.replace(/\S/g, '<span>$&</span>').replace(/\S+/g, '<span>$&</span>').replace(/\n{2,}|:<\/span><\/span>\n/g, '$&<span><span></span></span>')
const reverse_spans = [...forward.children].toReversed()
const spans = backward.querySelectorAll('span > span')

const lang = get_lang()
reverse_button.innerHTML = lang ? 'To read the poem<br>end to beginning' : 'לקריאת השיר<br>מהסוף להתחלה'
reverse_button.onclick = () => {
    reverse_button.style.visibility = 'hidden'
    const anim_dur_ms = 500
    backward.style.setProperty('--anim_dur', anim_dur_ms + 'ms')
    document.body.classList.add('hide_cursor')
    document.body.addEventListener('mousemove', show_hide_cursor)
    setTimeout(() => psychedelic.style.visibility = 'visible', 15000)
    setTimeout(() => h1.scrollIntoView({behavior: 'smooth', block: 'nearest'}), 21000)
    setTimeout(() => h1.textContent = lang ? 'White rabbit' : 'הארנב הלבן', 23000)
    ;[[28000, 180], [54000, 190], [78000, 210], [102000, 180]].forEach(([t, dt]) => setTimeout(reverse, t, dt))
    audio.play()
}
    
let index = 0, reverse_index = 0
    
function reverse(dt) {
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
    } else
        span.classList.add('reveal')
    span.addEventListener('animationend', () => span.scrollIntoView({behavior: 'smooth', block: 'nearest'}))
    index++
    if (span.textContent && index < spans.length)
        setTimeout(reverse, dt, dt)
}