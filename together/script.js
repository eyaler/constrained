const spawn_range = 2000
const min_spawn_radius = 1000
const interaction_radius = 200
const walk_step = 1
const tutorial_delay_secs = 3
const talk_delay_secs = 3

let joker_char = 'ר'
let allowed_words = [
  'ער',
  'פר',
  'רע',
  'רפ',
  'רש',
  'שר',
  'בער',
  'בשר',
  'גער',
  'גרע',
  'גרף',
  'גרש',
  'גשר',
  'דרש',
  'זרע',
  'עבר',
  'עדר',
  'עזר',
  'עפר',
  'עצר',
  'עקר',
  'ערב',
  'ערג',
  'ערפ',
  'ערק',
  'ערש',
  'עשר',
  'פגר',
  'פזר',
  'פער',
  'פרג',
  'פרד',
  'פרז',
  'פרע',
  'פרצ',
  'פרק',
  'פרש',
  'פשר',
  'צער',
  'צפר',
  'צרפ',
  'קרע',
  'קרש',
  'קשר',
  'רבע',
  'רגע',
  'רגש',
  'רדפ',
  'רעב',
  'רעד',
  'רעפ',
  'רעש',
  'רפש',
  'רצע',
  'רצפ',
  'רקע',
  'רשע',
  'רשפ',
  'שבר',
  'שגר',
  'שדר',
  'שזר',
  'שער',
  'שפר',
  'שקר',
  'שרב',
  'שרג',
  'שרד',
  'שרפ',
  'שרצ',
  'שרק',
  'דרגש',
  'דרעק',
  'עקרב',
  'ערפד',
  'ערצב',
  'פברק',
  'קרפד',
  'קרצפ',
  'שדרג',
  'שפצר',
  'שרעפ',
]

const post_join_remarks = [
  'יאללה בואו נמצא עוד אותיות',
  'xָה הוא צליל בתוך מילה!'
]

const nogo_remarks = {
  'האמת אני פחות בקטע': 'הממ במחשבה שנייה נראה לי שאזרום',
  'יש לי חבר': 'בעצם חבר זה לא קיר'
}

const conv = {
  tutorial: [
    [
      [0, 'היי אתה'],
      [1, 'גיבור גדול'],
      [0, 'נו אולי חאלס כבר עם מצעד הפזמונים הזה שלך כל פעם'],
      [0, 'סליחה. בכל מקרה, אתה יכול לזוז עם החיצים'],
      [0, 'במקלדת אפשר גם ללחוץ על שני חיצים ביחד בשביל לזוז באלכסון'],
      [1, 'הכי כיף ביחד'],
      [1, 'ביחד ננצח!']
    ],
    [
      [0, 'היי חבר'],
      [1, 'רוצה לקנות אוויר?'],
      [0, "או־אם־ג'י מה את בת שלוש? מספיק עם זה. זה לא מצחיק אף אחד"],
      [0, 'סליחה. אז תדע שאם תלחץ על טאב ננסה להשתחלף למילה אחרת'],
      [0, 'לפעמים זה גם יכול לעזור לשכנע אותיות חדשות להצטרף אלינו'],
      [0, 'ואם לא יצא מה שרצית אז תמשיך לטאבטב וננסה שוב עד ש'],
      [1, 'ננצח'],
      [1, 'יחד'],
      [1, 'יחד ננצח!']
    ]
  ],
  encounter: [
    [
      [0, 'היי'],
      [-1, 'היי'],
      [0, 'רוצה להצטרף אלינו? בואי איתנו'],
      [1, 'יבש אצלנו ויש אצלנו מקום'],
      [1, 'ויחד ננצח!'],
      [0, 'תתעלמי ממנה']
    ]
  ]
}

function random_text(texts, char) {
  return texts[Math.random() * texts.length | 0]?.replaceAll('x', char)
}

function to_middle(s) {
  return s.replace('ך', 'כ').replace('ם', 'מ').replace('ן', 'נ').replace('ף', 'פ').replace('ץ', 'צ')
}

allowed_words = allowed_words.map(to_middle)
const initial_word = random_text(allowed_words.filter(w => w.length == 2))
joker_char = initial_word.includes(joker_char) ? joker_char : initial_word[1]
const char_ranks = [initial_word.replace(joker_char, ''), joker_char]

let left_key = false,
  right_key = false,
  up_key = false,
  down_key = false,
  x = 0,
  y = 0,
  in_radius_with,
  timeout_with,
  timeout_id,
  allowed_insertions,
  anagrams,
  tutorial_stage = 0

function change_word(event_or_word) {
  const word = to_middle(event_or_word?.currentTarget?.textContent || event_or_word || me.textContent).replace(/\s+/g, '')
  if (!allowed_words.includes(word))
    allowed_words.push(word)
  allowed_insertions = {}
  allowed_words.forEach(w =>
    [...w].forEach((c, i) => {
      if (word == w.slice(0, i) + w.slice(i + 1)) {
        if (!allowed_insertions[c])
          allowed_insertions[c] = []
        allowed_insertions[c].push(i)
      }
    })
  )
  const chars = [...word].sort().join('')
  anagrams = allowed_words.filter(w => w != word && chars == [...w].sort().join(''))
  const save_texts = {}
  const save_prev_texts = {}
  ;[...me.children].forEach(elem => {
    if (elem.dataset.text)
      save_texts[elem.id] = elem.dataset.text
    if (elem.dataset.prev_text)
      save_prev_texts[elem.id] = elem.dataset.prev_text
  })
  me.innerHTML = [...word].map((c, i) => `<div id="${c}"${c in save_texts ? ` data-text="${save_texts[c]}"` : ''}${
    c in save_prev_texts ? ` data-prev_text="${save_prev_texts[c]}"` : ''}><div><div>${
    i == word.length - 1 ? c.replace('כ', 'ך').replace('מ', 'ם').replace('נ', 'ן').replace('פ', 'ף').replace('צ', 'ץ') : c}</div></div></div>`).join('')
}

change_word(initial_word)
me.addEventListener('input', change_word)

const locs = [[0, 0]]
for (const c of new Set(allowed_words.join(''))) {
  if (to_middle(me.textContent).includes(c))
    continue
  let nx, ny, good, range = spawn_range
  while (!good) {
    nx = Math.random()*range*2 - range
    ny = Math.random()*range*2 - range
    good = true
    for (const loc of locs)
      if ((nx-loc[0])**2 + (ny-loc[1])**2 < min_spawn_radius ** 2) {
        good = false
        range *= 1.05
        break
      }
  }
  locs.push([nx, ny])
  const div = document.createElement('div')
  me.before(div)
  div.className = 'npc'
  div.dataset.x = nx
  div.dataset.y = ny
  div.id = c
  div.innerHTML = `<div><div>${c}</div></div>`
}

addEventListener('keydown', event => {
  if (event.key.includes('Arrow') || event.key == 'Tab') {
    event.preventDefault()
    if (event.key == 'ArrowLeft')
      left_key = true
    else if (event.key == 'ArrowRight')
      right_key = true
    else if (event.key == 'ArrowUp')
      up_key = true
    else if (event.key == 'ArrowDown')
      down_key = true
    else if (event.key == 'Tab')
      change_word(random_text(anagrams))
  }
})

addEventListener('keyup', event => {
  if (event.key.includes('Arrow'))
    if (event.key == 'ArrowLeft')
      left_key = false
    else if (event.key == 'ArrowRight')
      right_key = false
    else if (event.key == 'ArrowUp')
      up_key = false
    else if (event.key == 'ArrowDown')
      down_key = false
})

addEventListener('blur', () => (left_key = right_key = up_key = down_key = false))

tab_button.addEventListener('click', () => dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab'})))

function update() {
  const left = left_key || controls.querySelector('#left_button:active')
  const right = right_key || controls.querySelector('#right_button:active')
  const up = up_key || controls.querySelector('#up_button:active')
  const down = down_key || controls.querySelector('#down_button:active')

  left_button.classList.toggle('on', left_key)
  right_button.classList.toggle('on', right_key)
  up_button.classList.toggle('on', up_key)
  down_button.classList.toggle('on', down_key)

  me.classList.toggle('walk', !!(left || right || up || down))
  let step = walk_step
  if ((left || right) && (up || down) && !(up && down) && !(left && right))
    step /= Math.sqrt(2)
  if (left)
    x += step
  if (right)
    x -= step
  if (up)
    y += step
  if (down)
    y -= step
  main.style.setProperty('--x', x + 'px')
  main.style.setProperty('--y', y + 'px')
  main.querySelectorAll('.npc').forEach(elem => {
    const nx = +elem.dataset.x + x
    const ny = +elem.dataset.y + y
    elem.style.setProperty('--x', nx + 'px')
    elem.style.setProperty('--y', ny + 'px')
    if (nx**2 + ny**2 < interaction_radius ** 2) {
      if ((!in_radius_with || in_radius_with == elem) && elem.dataset.prev_text in nogo_remarks && !elem.dataset.text && elem.id in allowed_insertions)
        talk(elem, 'regret')
      else if (!in_radius_with)
        talk(elem)
    } else if (in_radius_with == elem) {
      in_radius_with = null
      if (timeout_with)
        clear(elem)
    }
  })
  requestAnimationFrame(update)
}
update()

function clear(elem) {
  timeout_with = null
  clearTimeout(timeout_id)
  if (elem?.dataset.text) {
    elem.dataset.prev_text = elem.dataset.text
    delete elem.dataset.text
  }
  ;[...me.children].forEach(m => {
    if (m.dataset.text) {
      m.dataset.prev_text = m.dataset.text
      delete m.dataset.text
    }
  })
}

function join_end(event) {
  if (event.animationName != 'join')
    return
  const elem = event.currentTarget
  elem.removeEventListener('animationend', join_end)
  me.insertBefore(elem, me.children[allowed_insertions[elem.id][Math.random() * allowed_insertions[elem.id].length | 0]])
  change_word()
}

function talk(elem, subject = 'encounter', subject_index, turn = 0) {
  if (!elem && timeout_with)
    return
  if (elem && !turn)
    in_radius_with = elem
  clear(elem)
  let turns
  if (subject == 'regret')
    turns = [[-1, nogo_remarks[elem.dataset.prev_text]]]
  else {
    subject_index ??= Math.random() * conv[subject].length | 0
    turns = conv[subject][subject_index]
    if (subject == 'tutorial')
      tutorial_stage = subject_index + 1
  }
  if (turn < turns.length)
    (turns[turn][0] == -1 ? elem : document.getElementById(char_ranks[turns[turn][0] % char_ranks.length])).dataset.text = turns[turn][1]
  else if ((subject == 'encounter' || subject == 'regret') && (turn == turns.length || (turn == turns.length + 1 && !in_radius_with)))
    if (turn == turns.length && elem.id in allowed_insertions) {
      anagrams = []
      elem.addEventListener('animationend', join_end)
      elem.classList.replace('npc', 'join')
      in_radius_with = null
    } else if (turn == turns.length + 1 && !in_radius_with)
      document.getElementById(elem.id).dataset.text = random_text(post_join_remarks, elem.id)
    else elem.dataset.text = random_text(Object.keys(nogo_remarks))
  else {
    if (subject == 'encounter' && tutorial_stage < conv.tutorial.length && (tutorial_stage != 1 || anagrams.length))
      setTimeout(talk, tutorial_delay_secs * 1000, null, 'tutorial', tutorial_stage)
    return
  }
  timeout_with = elem
  timeout_id = setTimeout(talk, talk_delay_secs * 1000, elem, subject, subject_index, turn + 1)
}

setTimeout(talk, tutorial_delay_secs * 1000, null, 'tutorial', 0)