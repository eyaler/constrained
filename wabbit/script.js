sidebyside_align()
forward.innerHTML = forward.textContent.replace(/\p{L}/gu, '<span>$&</span>')
backward.innerHTML = backward.textContent.replace(/\S/g, '<span>$&</span>').replace(/\S+/g, '<span>$&</span>')
const reverse_spans = [...forward.children].toReversed()
const spans = backward.querySelectorAll('span > span')


reverse_button.onclick = () => {
    reverse_button.style.visibility = 'hidden'
    audio.play()
    document.body.classList.add('hide_cursor')
    document.body.addEventListener('mousemove', show_hide_cursor)
    setTimeout(() => psychedelic.style.visibility = 'visible', 15000)
    setTimeout(() => {
        h1.scrollIntoView({behavior: 'smooth', block: 'nearest'})
        h1.textContent = get_lang() ? 'White rabbit' : 'הארנב הלבן'
    }, 23000)
    setTimeout(reverse, 28000)
}
    
function reverse(index=0, reverse_index=0) {
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
    if (index < spans.length)
        setTimeout(reverse, 150, index, reverse_index)
}