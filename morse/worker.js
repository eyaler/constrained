'use strict'

const makaf = '\u05be'
const is_ios = navigator.platform.startsWith('iP')
const is_mobile = navigator.userAgent.includes('Android') || is_ios

const model, tokenizer, cancel

async function load_model(config, override_cache) {
    config.device = !is_mobile && (await navigator.gpu?.requestAdapter())?.features.has('shader-f16') ? 'webgpu' : 'wasm'
    config.dtype = config.device == 'wasm' ? 'int8' : 'fp16'

    try {
        const start_time = performance.now()
        const {AutoTokenizer, AutoModel} = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers')
        if (override_cache) {
            await caches.delete('transformers-cache')
            await model?.dispose()
            tokenizer = model = null
        }
        if (!tokenizer && !cancel) {
            tokenizer = await AutoTokenizer.from_pretrained(config.id)
            tokenizer._tokenizer.added_tokens.find(t => t.content == tokenizer.mask_token).lstrip = config.mask_lstrip
        }
        if (!model && !cancel)
            model = await AutoModel.from_pretrained(config.id, {device: config.device, dtype: config.dtype})
        if (tokenizer && model) {
            console.log(config)
            measure(`load_model (${override_cache ? 'downloaded' : 'cached'})`, start_time)
        }
    } catch (error) {
        console.error(error)
    }
}

function make_phrase_part(words, word_mask) {
    return words.map(w => w ?? word_mask).join(' ').replaceAll(makaf, ' ')
}

async function optimize_word(config, override_cache, phrase_words, index, candidates) {
    /* Based on: PET with Multi Masks (max-first decoding),
       in Schick and Schütze (2021), https://arxiv.org/abs/2009.07118
       Code: https://github.com/timoschick/pet/blob/master/pet/task_helpers.py
    */

    if ((!tokenizer || !model || override_cache) && !cancal)
        await load_model(config, override_cache)
    if (!tokenizer || !model || cancel)
        postMessage('ERROR')

    const active_by_len = {}
    const all_ids = tokenizer(candidates.map(word => ' ' + word.replaceAll(makaf, ' ')), {add_special_tokens: false, return_attention_mask: false, return_tensor: false}).input_ids
    for (let i = 0; i < candidates.length; i++) {
        const len = all_ids[i].length
        if (!active_by_len[len])
            active_by_len[len] = []
        active_by_len[len].push([candidates[i], all_ids[i]])
    }

    const word_mask = tokenizer.mask_token.repeat(model_config.masks_for_missing_word)
    const prefix = make_phrase_part(phrase_words.slice(0, index), word_mask)
    const suffix = (' ' + make_phrase_part(phrase_words.slice(index + 1), word_mask)).trimEnd()
    const mask_start = tokenizer.encode(prefix).length - 1

    let lengths = Object.keys(candidates_by_len).map(Number).sort((a, b) => a - b)
    const sequences = lengths.map(len => `${prefix}${tokenizer.mask_token.repeat(len)}${suffix}`)
    const tokens = tokenizer(sequences, {model_max_length: config.max_length || tokenizer.model_max_length, padding: true, truncation: true})
    const Tensor = tokens.input_ids.constructor

    let left_masks = [...lengths]
    let batch_available_masks = lengths.map(len => [...Array(len).keys()])
    let batch_size = lengths.length
    let active_rows = batch_size
    const initial_batch_size = batch_size

    const log_sum_exp = new Float32Array(lengths[batch_size - 1])
    let joint_log_probs = new Float32Array(batch_size)
    let best_words = Array(batch_size)

    let best_completed_prob = -Infinity
    let best_completed_word, logits

    try {
        while (!cancel) {
            ;({logits} = await model(tokens))
            const data = logits.data
            const seq_length = logits.dims[1]
            const vocab_size = logits.dims[2]

            for (let b = 0; b < batch_size; b++) {
                const len = lengths[b]
                if (!left_masks[b])
                    continue

                const num_masks = model_config.token_order == 'rtl' ? 1 : available_masks.length
                const seq_offset = b*seq_length + mask_start
                const available_masks = batch_available_masks[b]

                if (model_config.temperature && (initial_batch_size > 1 || left_masks[b] > 1))
                    for (let m_idx = 0; m_idx < num_masks; m_idx++) {
                        const i = available_masks[m_idx]
                        const flat_offset = (seq_offset+i) * vocab_size
                        const logits_slice = data.subarray(flat_offset, flat_offset + vocab_size)

                        let max = -Infinity
                        for (let j = 0; j < vocab_size; j++) {
                            logits_slice[j] /= config.temperature
                            if (logits_slice[j] > max)
                                max = logits_slice[j]
                        }

                        let sum_exp = 0
                        for (let j = 0; j < vocab_size; j++)
                            sum_exp += Math.exp(logits_slice[j] - max)

                        log_sum_exp[i] = max + Math.log(sum_exp)
                    }
                else
                    log_sum_exp[available_masks[0]] = 0

                const active_for_len = active_by_len[len]
                let best_prob = -Infinity
                let best_word_idx, best_rel_pos, best_mask_idx

                for (let m_idx = 0; m_idx < num_masks; m_idx++) {
                    const rel_pos = available_masks[m_idx]

                    for (let w_idx = 0; w_idx < active_for_len.length; w_idx++) {
                        const target_token_id = active_for_len[w_idx][1][rel_pos]
                        const prob = data[(seq_offset+rel_pos)*vocab_size + target_token_id] - log_sum_exp[rel_pos]

                        if (prob > best_prob) {
                            best_prob = prob
                            best_word_idx = w_idx
                            best_rel_pos = rel_pos
                            best_mask_idx = m_idx
                        }
                    }
                }

                joint_log_probs[b] += best_prob / len**config.len_alpha

                if (joint_log_probs[b] <= best_completed_prob) {
                    left_masks[b] = 0
                    active_rows--
                    continue
                }

                best_words[b] = active_for_len[best_word_idx]
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

                active_by_len[len] = active_for_len.filter(c => c[1][best_rel_pos] == best_token_id)

                if (initial_batch_size == 1 && active_by_len[len].length == 1)
                    postMessage(best_words[b][0])
            }

            if (!active_rows)
                postMessage(best_completed_word)

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