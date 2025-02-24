const rate_factors = [1, 1, 1, .7, .7, .7, 1 / .7, 1 / .7, 1 / .7, 1]
const delays = [0, 0, 0, .1, .15, .2, .25, .3, .35, .4]

let audioContext, pannerA, pannerB, gainA, gainB, i, start_time, timeout_id

videos.addEventListener('click', () => {
    if (!audioContext) {
        videos.classList.remove('show_cursor')
        videos.style.background = 'initial'
        audioContext = new AudioContext()
        const audioSourceA = audioContext.createMediaElementSource(a)
        const audioSourceB = audioContext.createMediaElementSource(b)
        pannerA = audioContext.createStereoPanner()
        pannerB = audioContext.createStereoPanner()
        gainA = audioContext.createGain()
        gainB = audioContext.createGain()
        audioSourceA.connect(pannerA).connect(gainA).connect(audioContext.destination)
        audioSourceB.connect(pannerB).connect(gainB).connect(audioContext.destination)
    }
    clearTimeout(timeout_id)
    b.removeEventListener('timeupdate', update)
    restart()
})

function update() {
    if (!updated && b.currentTime >= b.duration / 2) {
        updated = true
        if (!i)
            [a, b].forEach(e => e.classList.add('hor1'))
        else if (i == 1)
            b.classList.add('hor2')
    }
}

function restart() {
    [a, b].forEach(e => {
        e.pause()
        e.currentTime = 0
        e.className = ''
        e.playbackRate = 1
    })
    a.loop = false
    a.muted = true
    pannerA.pan.value = pannerB.pan.value = 0
    gainB.gain.value = 2
    i = 0
    updated = false
    b.addEventListener('timeupdate', update)
    start_time = performance.now()
    ;[a, b].forEach(e => e.play())
}

b.addEventListener('ended', () => {
    i++
    console.log(i, (performance.now() - start_time) / 1000 | 0, b.playbackRate, a.currentTime, b.currentTime)
    if (i == rate_factors.length)
        restart()
    updated = false
    if (i == 1) {
        a.pause()
        a.currentTime = 0
        gainB.gain.value = 1
        pannerA.pan.value = -1
        pannerB.pan.value = 1
        a.loop = true
        a.muted = false
    }
    timeout_id = setTimeout(() => b.play(), Math.max(0, (delays[i]-a.currentTime%a.duration+b.currentTime%b.duration) / b.playbackRate * 1000))
    if (i == 1)
        a.play()
    else if (i == 2)
        b.removeEventListener('timeupdate', update)
    ;[a, b].forEach(e => e.playbackRate = Math.max(e.playbackRate * rate_factors[i], .2))
})