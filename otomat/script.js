const width_base = 160;
const height_base = 80;
const chars = ['abcdefghijklmnopqrstuvwxyz', 'אבגדהוזחטיכלמנסעפצקרשת'];
const words = [['foo', 'bar', 'baz'], ['הוזח' ,'לחש', 'קסם']];
const large = 1024;
const restart_secs = 120;
const hash = location.hash.slice(1)
const hard_restart_secs = 600 * (hash == 'filmwinter');

if (hard_restart_secs || hash.startswith('full'))
    toggle_fullscreen(otomat);  // works only in Firefox, after setting: full-screen-api.allow-trusted-requests-only = false

const max_size = +size_slider.max || 100;
const max_rate = +rate_slider.max || 100;
const max_temp = +temp_slider.max || 100;
const initial_rate = rate_slider.valueAsNumber;
const initial_temp = temp_slider.valueAsNumber;

let size;
let prev_time = 0;
let hard_prev_time = -hard_restart_secs * 1000;

function freeze_words(frozen_text_axis) {
    const this_w = frozen_text_axis[2] ? h : w;
    for (const match of frozen_text_axis[1].join('').matchAll(regexp)) {
        const start = match.index;
        const end = start + match[0].length - 1;
        if ((start / this_w | 0) != (end / this_w | 0) || frozen_text_axis[1].slice(start, end).toString() == old_text[frozen_text_axis[2]].slice(start, end).toString())
            continue;
        frozen_text_axis[0].fill(2 * large, start, end);
        frozen_text_axis[0][end] = Math.max(frozen_text_axis[0][end], 2*large - 1);
    }
    return frozen_text_axis;
}

function transpose(arr_arr_axis) {
    arr_arr_axis[2] = 1 - arr_arr_axis[2];
    const this_w = arr_arr_axis[2] ? h : w;
    const this_h = arr_arr_axis[2] ? w : h;
    for (let i = 0; i < arr_arr_axis[2] + 1; i++)
        arr_arr_axis[i] = arr_arr_axis[i].map((_, k) => arr_arr_axis[i][k%this_w*this_h + k/this_w | 0]);
    return arr_arr_axis;
}

function next(x, k) {
    if (freeze && frozen[k])
        return x;
    const i = glitch ? k/w | h : k/w + h | 0;
    const j = k%w + w;
    const next_ind = (x+1) % chars[lang].length;
    for (let m = -1; m < 2; m++)
        for (let n = -1; n < 2; n++)
            if (ind_grid[(i+m)%h*w + (j+n)%w] == next_ind)
                return next_ind;
    return x;
}

function update() {
    const start_time = performance.now();
    if (hard_restart_secs && start_time - hard_prev_time >= hard_restart_secs * 1000) {
        hard_prev_time = start_time;
        lang_slider.value = Math.round(Math.random());
        size_slider.value = Math.random() * (max_size + 1) | 0;
        rate_slider.value = Math.random() * (max_rate - initial_rate + 1) + initial_rate | 0;
        temp_slider.value = initial_temp;
        glitch_checkbox.checked = Math.random() > .8;
        restarts_checkbox.checked = true;
        restart = true;
    }
    if (size != size_slider.value) {
        size = size_slider.value;
        const factor = 1 + size/max_size;
        grid.style.setProperty('--factor', factor);
        w = width_base * factor | 0;
        h = height_base * factor | 0;
        ind_grid = Array(w * h).fill();
        frozen = Array(w * h);
        old_text = [Array(w * h), Array(w * h)];
        lang = null;
    }
    if (lang != lang_slider.valueAsNumber || reset || restarts_checkbox.checked && start_time - prev_time >= restart_secs * 1000) {
        lang = lang_slider.valueAsNumber;
        reset = false;
        ind_grid = ind_grid.map(() => Math.random() * chars[lang].length | 0);
        regexp = words[lang].length ? RegExp(words[lang].join('|').replace(/ך/g, 'כ').replace(/ם/g, 'מ').replace(/ן/g, 'נ').replace(/ף/g, 'פ').replace(/ץ/g, 'צ'), 'g') : null;
        freeze = null;
    }
    if (freeze != temp_slider.valueAsNumber) {
        prev_time = start_time;
        if (freeze == null || !temp_slider.valueAsNumber) {
            frozen.fill(0);
            old_text[0].fill();
            old_text[1].fill();
        }
        freeze = temp_slider.valueAsNumber;
    }
    if (freeze && regexp) {
        let char_grid = ind_grid.map(x => chars[lang][x]);
        const temp = Math.min(Math.ceil(large / freeze), max_temp - freeze);
        frozen = frozen.map(x => Math.max(x - 2*temp, 0));
        [frozen, old_text[1], _] = transpose(freeze_words(transpose(freeze_words([frozen, char_grid, 0]))));
        old_text[0] = char_grid;
        if (lang)
            frozen.forEach((x, k) => {
                if (x % 2)
                    char_grid[k] = char_grid[k].replace(/כ/, 'ך').replace(/מ/, 'ם').replace(/נ/, 'ן').replace(/פ/, 'ף').replace(/צ/, 'ץ');
            });
        grid.textContent = char_grid.map((x, k) => (k % w || !k ? '' : '\n') + x).join('');
    } else
        grid.textContent = ind_grid.map((x, k) => (k % w || !k ? '' : '\n') + chars[lang][x]).join('');
    glitch = glitch_checkbox.checked;
    ind_grid = ind_grid.map(next);
    setTimeout(update, 1000 - Math.log10(rate_slider.value/max_rate*9999 + 1)*250 - (performance.now()-start_time));
}
update();