const restart_secs = 60
const trans_secs = 3

class Pasuk {
    constructor(elem) {
        this.elem = elem
        elem.appendChild(document.createElement('p')).className = 'pasuk'
        const heading = elem.previousElementSibling
        heading.innerHTML = make_link('#' + heading.id, heading.textContent).outerHTML
        const json = `data/${heading.id}.json`
        const ref = elem.nextElementSibling
        ref.innerHTML = ref.innerHTML.slice(0, -1) + `, ${make_link(json, 'JSON').outerHTML})`
        fetch(json)
            .then(response => response.json())
            .then(json => {
                this.json = json
                elem.style.fontSize = `calc(${parseFloat(getComputedStyle(elem).fontSize) * 100 / get_width(json.text + '\u2002'.repeat(json.max_spaces + 1), elem, 'px')}vw - .7px)`
                elem.firstChild.innerHTML = [...json.text].map(c => `<span>${c}</span>`).join('<button aria-label="קרע"></button>')
                elem.querySelectorAll('button').forEach((e, i) => {e.classList.add('no_active'); e.onclick = () => this.resplit(i); e.onanimationstart = () => e.previousSibling.classList.add('before'); e.addEventListener('animationcancel', () => e.previousSibling.classList.remove('before')); e.onanimationend = () => {e.previousSibling.classList.remove('before'); e.click()}})  // Chrome does not support onanimationcancel. See: https://issues.chromium.org/issues/41404325
                this.restart(true)
                document.addEventListener('keydown', e => {if (is_shortcut(e, 'Backspace')) this.restart()})
                elem.oncontextmenu = e => {if (toggle_fullscreen(e)) this.restart(true)}
            })
    }

    fix_spaces(new_spaces, allowed=[]) {
        new_spaces = new_spaces.split(',').map(Number)
        setTimeout(() =>
            this.elem.querySelectorAll('button').forEach((e, i) => {
                e.disabled = !allowed.includes(i + 1)
                e.classList.toggle('space', new_spaces.includes(i + 1))
            })
        , 1)
        setTimeout(() =>
            this.elem.querySelectorAll('span').forEach((e, i, arr) =>
                e.textContent = e.textContent.replace(/[ךםןףץ]/, c => String.fromCharCode(c.charCodeAt() + 1)).replace(/[כמנפצ]/, c => String.fromCharCode(c.charCodeAt() - (new_spaces.includes(i + 1) || i == arr.length - 1)))
            )
        , 800)
    }

    resplit(index) {
        clearTimeout(this.restart_id)
        if (index != null) {
            this.elem.classList.add('wait_for_mouse')
            this.elem.onmousemove = () => this.elem.classList.remove('wait_for_mouse')
            const trans = this.json.trans[this.spaces][0][index + 1]
            this.spaces = trans[Math.random() * trans.length | 0]
            this.restart_id = setTimeout(() => this.restart(), restart_secs * 1000)
        }
        const allowed = Object.keys(this.json.trans[this.spaces][0]).map(Number)
        this.fix_spaces(this.spaces, allowed)
    }

    restart(hard=false) {
        clearTimeout(this.restart_id)
        if (hard)
            this.spaces = this.json.initial
        if (this.spaces == this.json.initial)
            this.resplit()
        else {
            this.spaces = this.json.trans[this.spaces][1]
            this.fix_spaces(this.spaces)
            setTimeout(() => this.restart(), trans_secs * 1000)
        }
    }
}

function go() {
    document.querySelectorAll('div:empty').forEach(e => new Pasuk(e))
}

if (document.readyState == 'complete')
    go()
else
    addEventListener('load', go)