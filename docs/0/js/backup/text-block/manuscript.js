(function(){
class Manuscript {
    #MATTER_FENCE = '---'
    constructor() { this.textBlock=new TextBlock(); this.matter=null; this.block=null; }
    async load(url) {
        const res = await fetch(url)
        const txt = await res.text()
        this.#splitMatterBlock(txt)
    }
    #splitMatterBlock(txt) {
        this.matter = null
        this.block = txt.trim()
        const lines = this.block.split(/\r?\n/)
        if (this.#MATTER_FENCE===lines[0]) {
            const end = lines.slice(1).indexOf(this.#MATTER_FENCE)
            const yamlText = lines.slice(1, end).join('\n')
            console.log(yamlText)
            //this.matter = jsyaml.load(lines.slice(1, end).join('\n'))
            this.matter = jsyaml.load(yamlText)
            console.log(this.matter)
            this.block = lines.slice(end+2).join('\n')
        }
    }
    get Meta() { return this.matter }
    *iter(withIndex=false) { yield* this.textBlock.iter(this.block, withIndex) }
    get isIterd() { return this.textBlock.isIterd }
    get Blocks() { return this.textBlock.Blocks }
}
class TextBlock {
    #lines = null
    #blocks = []
    #ranges = []
    #i = 0
    #idx = 0
    #isIterd = false
    #text = null

    get isIterd() { return this.#isIterd }
    get Blocks() { return this.#blocks }

//    async load(url) { this.#isIterd=false; this.#text = await this.#getTextFromUrl(url); return this.#text; }
//    *iter(text) { yield* this.#iter(text) }
    *iter(text, withIndex=false) { yield* this.#iter(text, withIndex) }
    async fromUrl(url) { // : List<String>
        performance.mark('TextBlock.#getTextFromUrl-start')
        const text = await this.#getTextFromUrl(url)
        performance.mark('TextBlock.#getTextFromUrl-end')
        performance.measure('TextBlock.#getTextFromUrl', 'TextBlock.#getTextFromUrl-start', 'TextBlock.#getTextFromUrl-end')
        console.log(performance.getEntriesByName('TextBlock.#getTextFromUrl')[0])

        performance.mark('TextBlock.#gets-start')
        const blocks = this.#gets(text)
        performance.mark('TextBlock.#gets-end')
        performance.measure('TextBlock.#gets', 'TextBlock.#gets-start', 'TextBlock.#gets-end')
        console.log(performance.getEntriesByName('TextBlock.#gets')[0])
        return blocks
    }
    fromString(text) { // : List<String>
        return this.#gets(text)
    }
    async *fromUrlIter(url, withIndex=false) { // : Generator<String/[String,Int]>
        yield* this.#iter((await this.#getTextFromUrl(url)), withIndex)
    }
    *fromStringIter(text, withIndex=false) { //  : Generator<String/[String,Int]>
        yield* this.#iter(text, withIndex)
    }
    #gets(text) {
        text = this.#init(text)
        console.debug(text, this.#lines, this.#lines[0].length)
        if (1===this.#lines.length && 0===this.#lines[0].length) { return null } // return []
        this.#getTextBlockRanges()
        return this.#ranges.map((r)=>this.#parse(this.#lines.slice(r[0], r[1]+1).join('\n')))
    }
    *#iter(text, withIndex=false) {
        text = this.#init(text)
        console.debug(text, this.#lines, this.#lines[0].length)
        if (1===this.#lines.length && 0===this.#lines[0].length) { return null }

        let [start, end] = [0, 0]
        console.debug(this.#lines.length, this.#ranges)
        for (var i=0; i<this.#lines.length; i++) {
            start = i
            const isBreakBlock = !this.#lines[i]
            end = this.#getBlockRangeEnd(start, isBreakBlock)
            const isPush = ((isBreakBlock) ? ((0 < end-start) ? true : false) : true)
            console.debug(i, this.#ranges)
            if (isPush) {
                const block = this.#parse(this.#lines.slice(start, end+1).join('\n'))
                yield ((withIndex) ? [block, this.#idx] : block)
                this.#idx += 1
            }
            console.debug(isBreakBlock, isPush, start, end, this.#ranges)
            i = end
        }
        this.#isIterd = true
    }
    #getTextFromUrl(url) { return fetch(url).then(res=>res.text()) }
    #init(text) {
        this.#i = 0
        this.#idx = 0
        this.#blocks.splice(0)
        this.#ranges.splice(0)
        console.debug(text)
        text = text.replace(/(\r?\n){3,}/usg, '\n\n'); // 3つ以上連続した改行コードは2つにする
        this.#lines = text.trim().split(/\r?\n/)
        return text
    }
    #getTextBlockRanges() {
        let [start, end] = [0, 0]
        console.debug(this.#lines.length, this.#ranges)
        for (var i=0; i<this.#lines.length; i++) {
            start = i
            const isBreakBlock = !this.#lines[i]
            end = this.#getBlockRangeEnd(start, isBreakBlock)
            const isPush = ((isBreakBlock) ? ((0 < end-start) ? true : false) : true)
            console.debug(i, this.#ranges)
            if (isPush) { this.#ranges.push([start, end]) }
            console.debug(isBreakBlock, isPush, start, end, this.#ranges)
            i = end
        }
        console.debug(this.#lines.length, this.#ranges)
    }
    #getBlockRangeEnd(start, isBreak=false) {
        for (var i=start; i<this.#lines.length; i++) {
            if (isBreak) { if (this.#lines[i]) { return i-1 } } // BreakBlockRangeEnd
            else { if (!this.#lines[i]) { return i-1 } }        // TextBlockRangeEnd
        }
        return i
    }
    #parse(str) {
        // 一行すべて改行エスケープなら内容を１つ分削除する（台本と出力の行数を一致させるため）
        const lines = str.split(/\r?\n/)
        console.debug(str, lines)
        for (let i=0; i<lines.length; i++) {
            if (lines[i].match(/^(\\n)+$/)) {
                lines[i]= lines[i].slice(0, -2); 
            }
        }
        // 改行エスケープ\nを改行コードに置換する（改行エスケープのエスケープ\\nを避けつつ）
        //return lines.join('\n').replace(/\\n/g, '\n')
        return lines.join('\n').replace(/(\\n)/g, (match, p1, offset, str, groups)=>{
            if (0 < offset && '\\'===str[offset-1]) { return 'n' }
            else { return '\n' }
        })
    }
}
window.manuscript = new Manuscript()
})();
