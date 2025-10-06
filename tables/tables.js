'use strict'

const table_collator = Intl.Collator(document.documentElement.lang, {numeric: true})


class Table {
    constructor(config, url, table, data_header_rows) {
        this.table = table || [...document.querySelectorAll('table')].pop() || [...document.querySelectorAll('.table')].pop()?.appendChild(document.createElement('table')) || document.body.appendChild(document.createElement('table'))
        this.table.style.visibility = 'hidden'
        this.url = url ?? this.table.dataset.url ?? this.table.querySelector('[data-url]')?.dataset.url
        config = config ?? this.table.dataset.config ?? this.table.querySelector('[data-config]')?.dataset.config
        this.promise = this.get_config(config)
            .then(config => {
                this.config = config
                if (this.url)
                    return this.make_table(this.url, data_header_rows)
                else
                    this.make_headers()
            }).then(() => {
                let {id, sort_index, sort_order} = this.restore_state()
                if (this.table.querySelector('.sort'))
                    this.sort_table(sort_index, sort_order)
                this.table.style.visibility = 'visible'
                if (!id && [...this.table.querySelectorAll('[id]')].map(e => e.id).includes(location.hash.slice(1).toLowerCase()))
                    id = location.hash.slice(1).toLowerCase()
                if (id) {
                    const tr = document.getElementById(id)  // Do not use querySelector() as id may not be a valid CSS identifier
                    location.hash = id  // Scroll into view
                    tr.style.webkitAnimationPlayState = 'running'
                }
            })
    }

    get_config(config={}) {
        return typeof config == 'string' ? fetch(config).then(response => response.json()) : Promise.resolve(config)
    }

    then(on_fulfilled) {
        return this.promise.then(on_fulfilled)
    }

    sort_table(index, order) {
        const buttons = this.table.querySelectorAll('.sort button:not(.copy *)')
        if (index == null)
            buttons.forEach((k, i) => {
                if (this.config[k.name]?.default)
                    index = i
            })
        index ||= 0
        const config_key = {...this.config._all_columns, ...this.config[buttons[index].name]}
        const rows = Array.from(this.table.tBodies[0].rows)
        const col = buttons[index].dataset.col
        const is_number = rows[0].cells[col].classList.contains('number') || rows[0].cells[col].dataset.sort == parseFloat(rows[0].cells[col].dataset.sort).toString()
        order ??= buttons[index].value * -1 || config_key.natural || config_key.index || !is_number || -1
        buttons.forEach((e, i) => {
            const config_other = {...this.config._all_columns, ...this.config[e.name]}
            e.value = (i == index || config_key.index * (config_other.index || config_other.implied)) * order || 0
            if (i == index)
                e.parentElement.ariaSort = order == 1 ? 'ascending' : 'descending'
            else
                e.parentElement.removeAttribute('aria-sort')
        })
        let compare
        if (is_number)
            compare = (a, b) => a.cells[col].dataset.sort - b.cells[col].dataset.sort
        else
            compare = (a, b) => table_collator.compare(a.cells[col].dataset.sort ?? a.cells[col].textContent, b.cells[col].dataset.sort ?? b.cells[col].textContent)
        rows.sort((a, b) => compare(a, b) * order)
        for (let i = 0; i < rows.length; i += 100000)
            this.table.tBodies[0].append(...rows.slice(i, i + 100000))
        this.sort_index = index
        this.sort_order = order
    }

    restore_state() {  // Requires id's for table rows (can be set in table config). Only last sort column order is restored
        let state = {}
        if ([...this.table.querySelectorAll('[id]')].map(e => e.id).includes(history.state?.id)) {
            state = {...history.state}
            const new_state = {...state}
            delete new_state.id
            delete new_state.sort_index
            delete new_state.sort_order
            history.replaceState(new_state, '')
        }
        this.table.addEventListener('click', event => {
            if (event.target.href && !event.getModifierState?.('Control') && !event.getModifierState?.('Shift') && !event.getModifierState?.('Meta'))
                history.replaceState({...history.state, id: event.target.closest('tr')?.id, sort_index: this.sort_index, sort_order: this.sort_order}, '')
        })
        return state
    }

    make_headers(keys) {
        let tr, is_sort, offset, ths
        if (keys)
            offset = this.table.classList.contains('rank') && !!keys[0].split('_')[0]
        if (this.table.tHead) {
            tr = this.table.querySelector('.load, .sort, [data-config], [data-url]')
            is_sort = this.table.querySelector('.sort')
            if (!keys) {
                ths = [...tr.querySelectorAll('th')]
                keys = ths.map(e => e.textContent)
                ths.forEach(e => e.remove())
                offset = tr.cells[0]?.textContent == '' || this.table.tHead.rows[0]?.cells[0]?.textContent == ''
            }
        } else {
            this.table.appendChild(document.createElement('thead'))
            tr = this.table.tHead.appendChild(document.createElement('tr'))
            if (offset)
                tr.appendChild(document.createElement('td'))
            is_sort = this.table.classList.contains('sort')
            if (is_sort)
                tr.className = 'sort'
        }
        let j = 0
        keys.forEach((k, i) => {
            const label = k.split('_')[0]
            const cell = tr.appendChild(document.createElement(label ? 'th' : 'td'))
            if (ths)
                [...ths[i].attributes].forEach(a => cell.setAttribute(a.name, a.value))
            if (label) {
                cell.scope = 'col'
                if (is_sort) {
                    const button = cell.appendChild(document.createElement('button'))
                    button.dataset.col = i + offset
                    button.innerHTML = label
                    button.name = k
                    const index = j
                    button.onclick = () => this.sort_table(index)
                    j++
                } else
                    cell.innerHTML = label

                const conf = {...this.config._all_columns, ...this.config[k]}
                if (conf.first_highlight) {
                    if (!this.table.classList.contains('highlight'))
                        this.table.classList.add('col_highlight')
                    if (this.table.dataset.firstColHighlight != null)
                        this.table.dataset.firstColHighlight = i + offset
                }
                const max_width = conf.max_width || conf.maxwidth || conf.maxWidth || conf['max-width'] || conf.max
                if (max_width)
                    cell.style.maxWidth = max_width
                const min_width = conf.min_width || conf.minwidth || conf.minWidth || conf['min-width'] || conf.min
                if (min_width)
                    cell.style.minWidth = min_width
                if (conf.title)
                    cell.title = conf.title
            }
        })
        while (tr) {
            tr.classList.add('skip_highlight')
            tr = tr.previousElementSibling
        }
        const first_cell = this.table.tHead.rows[0]?.cells[0]
        if (first_cell?.textContent == '') {
            first_cell.classList.add('copy')
            const button = first_cell.appendChild(document.createElement('button'))
            button.title = 'Copy table to clipboard'
            button.onclick = () => navigator.clipboard.writeText(this.table.outerHTML).then(() => {
                button.classList.add('copied')
                button.offsetWidth  // Restart transition. See: https://css-tricks.com/restart-css-animation/
                button.classList.remove('copied')
            })
        }
    }

    make_table(url, data_header_rows) {
        return fetch(url)
            .then(response => response.json())
            .then(json => {
                const is_rank = this.table.classList.contains('rank')
                const keys = Object.keys(json[0])
                this.make_headers(keys)
                const is_sort = this.table.querySelector('.sort')
                this.table.appendChild(document.createElement('tbody'))
                let have_data_header = false
                json.forEach((row, j) => {
                    const tr = document.createElement('tr')
                    const is_data_header = (data_header_rows && j < data_header_rows) ?? !Object.keys(row)[0].split('_')[0]
                    have_data_header ||= is_data_header
                    let row_link
                    if (is_rank && !is_data_header && keys[0].split('_')[0]) {
                        const td = tr.appendChild(document.createElement('td'))
                        td.classList.add('number')
                        row_link = td.appendChild(document.createElement('a'))
                    }
                    const ids = new Set()
                    keys.forEach((k, i) => {
                        const td = tr.appendChild(document.createElement('td'))
                        let v = row[k] ?? ''
                        const conf = {...this.config._all_columns, ...this.config[k]}
                        if (!is_data_header) {
                            if (is_sort && k)
                                td.dataset.sort = conf.index ? j * conf.index : v
                            if (conf.cls) {
                                if (typeof conf.cls == 'string')
                                    conf.cls = conf.cls.split(' ')
                                td.classList.add(...conf.cls)
                            }
                            if (conf.dir)
                                td.dir = conf.dir
                            if (conf.id) {
                                let id = v.trim().replace(/\s+/g, '_').toLowerCase()
                                while (ids.has(id))
                                    id += '__' + i
                                ids.add(id)
                                tr.id = id
                                if (row_link)
                                    row_link.href = '#' + id
                            }
                            if (conf.type == 'checkmark') {
                                td.style.textAlign = 'center'
                                v = v ? '\u2713' : '\u2717'
                            }
                            if (conf.type == 'justify')
                                td.style.textAlign = 'justify'
                        }
                        if (typeof v == 'number') {
                            let decimal
                            if (!is_data_header) {
                                td.classList.add('number')
                                decimal = conf.decimal
                                if (decimal == null)
                                    if (typeof conf.as_pct == 'number')
                                        decimal = conf.as_pct
                                    else if (typeof conf.is_pct == 'number')
                                        decimal = conf.is_pct
                                if (conf.as_pct)
                                    v *= 100
                            }
                            v = v.toLocaleString(document.documentElement.lang, {minimumFractionDigits: decimal, maximumFractionDigits: decimal})
                            if (!is_data_header && (conf.is_pct || conf.as_pct))
                                v += '%'
                        }
                        let href = v
                        Object.entries(conf.href_sub || {}).forEach(([pat, rep]) => href = href.replace(RegExp(pat, 'g'), rep))
                        href = (conf.href || '') + href + (conf.href_suffix || '')
                        Object.entries(conf.sub || {}).forEach(([pat, rep]) => v = v.replace(RegExp(pat, 'g'), rep))
                        v = (conf.prefix || '') + v + (conf.suffix || '')
                        if (!is_data_header && (conf.href != null || conf.href_sub || conf.href_suffix != null))
                            v = `<a href="${href}">${v}</a>`
                        td.innerHTML = v
                    })
                    if (is_data_header)
                        this.table.tHead.appendChild(tr)
                    else
                        this.table.tBodies[0].appendChild(tr)
                })
                if (have_data_header) {
                    this.table.tHead.classList.add('data_header')
                    if (!is_rank)
                        this.table.classList.add('merge_first_col')
                }
            })
    }
}

const table_class = Table
Table = function(...args) {return new table_class(...args)}  // Allow calling without 'new'. Using 'function' instead of '=>' to still allow 'new'
