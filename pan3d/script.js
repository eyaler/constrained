function fix_finals(word) {
    return word.replace(/[ךםןףץ]/g, c => String.fromCharCode(c.charCodeAt() + 1)).replace(/[כמנפצ]$/, c => String.fromCharCode(c.charCodeAt() - 1))
}

function add_dir([dir, order], text) {
    const li = document.createElement('li')
    li.textContent = dir + ':'
    const div = li.appendChild(document.createElement('div'))
    div.className = 'panels'
    text = order.reduce((s, i) => s + text[i], '')
    for (let i=0; i < 3; i++) {
        const pre = div.appendChild(document.createElement('pre'))
        pre.className = 'square3'
        pre.textContent = [text.slice(0, 3), text.slice(3, 6), text.slice(6, 9)].map(fix_finals).join('\n')
        text = text.slice(9)
    }
    return li
}

document.querySelectorAll('[data-cube]').forEach(heading => {
    heading.innerHTML = make_link('#' + heading.id, heading.textContent).outerHTML
    const len = heading.dataset.cube.length
    const set_len = new Set(heading.dataset.cube).size
    if (len == 27 && set_len == 27) {
        const scene = document.createElement('div')
        scene.oncontextmenu = toggle_fullscreen
        scene.setAttribute('aria-labelledby', heading.id)
        scene.setAttribute('aria-describedby', heading.id + '_text')
        const cube = scene.appendChild(document.createElement('div'))
        ;['left', 'lr1', 'lr2', 'right', 'top', 'tb1', 'tb2', 'bottom', 'back', 'fb1', 'fb2', 'front'].forEach(f =>
            cube.appendChild(document.createElement('div')).className = `face ${f}`
        )
        ;[...heading.dataset.cube].forEach((c, i) => {
            const div = cube.appendChild(document.createElement('div'))
            div.className = `char x${i % 3} y${(i/3 | 0) % 3} z${i / 9 | 0}`
            div.appendChild(document.createElement('span')).textContent = c
        })
        heading.after(scene)

        const ol = document.querySelector(`[data-cube="${heading.dataset.cube}"] ~ ol`)
        ol.id = heading.id + '_text'
        let directions = [
            ['בשורות', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]],
            ['בעומקים', [0, 9, 18, 1, 10, 19, 2, 11, 20, 3, 12, 21, 4, 13, 22, 5, 14, 23, 6, 15, 24, 7, 16, 25, 8, 17, 26]],
            ['בטורים', [0, 3, 6, 1, 4, 7, 2, 5, 8, 9, 12, 15, 10, 13, 16, 11, 14, 17, 18, 21, 24, 19, 22, 25, 20, 23, 26]]
        ]
        if (heading.classList.contains('anad'))
            directions = directions.flatMap(x => [x, [x[0] + ' מהסוף להתחלה', [x[1].slice(0, 9).reverse(), x[1].slice(9, 18).reverse(), x[1].slice(18).reverse()].flat()]])
        directions.forEach(dir => ol.appendChild(add_dir(dir, heading.dataset.cube)))
        console.log(heading.id, new Set([...ol.querySelectorAll('.square3')].flatMap(x => x.textContent.split('\n'))).size)
    } else
        console.error(heading.id, len, set_len)
})