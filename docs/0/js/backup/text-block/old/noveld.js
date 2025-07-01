(function () { // window.noveld
    class Noveld {
        #s; #p; #l; #r;
        #defaultOptions = {ruby:true, break:true, thematicBreak:true, thematicBreakBorder:true, thematicBreakText:'◇◆◇◆'}
        constructor() { this.resetOptions(); this.#l = new Lexer(); this.#r = new RubyParser(); }
        resetOptions() { this.options = this.getDefaultOptions() }
        getDefaultOptions() { return [this.#defaultOptions].map((element)=>{ return {...element} })[0] }
        setOptions(options) { this.options = {...this.options, ...options} }
        parse(src) { return this.#l.lex((this.options.ruby) ? this.#r.parse(src) : src) }
        toHtml(dom) { this.#s = this.#s || new XMLSerializer(); return this.#s.serializeToString(dom); }
        toDom(html) { this.#p = this.#p || new DOMParser(); return this.#p.parseFromString(html, 'text/html'); }
    }
    class Lexer {
        #lines = null
        #textBlocks = []
        #html = []
        lex(src) {
            this.#lines = src.trim().split(/\r?\n/)
            console.debug(this.#lines)
            this.#getTextBlockRanges()
            this.#clearHtml()
            for (let block of this.#textBlocks) {
                const lines = this.#lines.slice(block.start, block.end+1)
                this.#html.push(block.parse(lines))
            }
            console.debug(this.#html)
            console.debug(this.#html.join('\n'))
            return this.#html.join('\n').trimEnd('\n')
        }
        #clearHtml() { this.#html.splice(0) }
        #clearTextBlockRanges() { this.#textBlocks.splice(0) }
        #getTextBlockRanges() {
            this.#clearTextBlockRanges() 
            let [start, end] = [0, 0]
            for (var i=0; i<this.#lines.length; i++) {
                start = i
                const isBreakBlock = !this.#lines[i]
                end = this.#getBlockRangeEnd(start, isBreakBlock)
                const isPush = ((isBreakBlock) ? ((0 < end-start) ? true : false) : true)
                if (isPush) { this.#textBlocks.push(new TextBlock(start, end)) }
                i = end
            }
            console.debug(this.#textBlocks)
        }
        #getBlockRangeEnd(start, isBreak=false) {
            for (var i=start; i<this.#lines.length; i++) {
                if (isBreak) { if (this.#lines[i]) { return i-1 } } // BreakBlockRangeEnd
                else { if (!this.#lines[i]) { return i-1 } }        // TextBlockRangeEnd
            }
            return i
        }
    }
    class TextBlock {
        constructor(start, end) { this.start = start; this.end = end; }
        parse(lines) { return this.#getParser(lines)(lines) }
        #getParser(lines) {
            if (!lines[0]) { return (window.noveld.options.break) ? Parser.break : Parser.newline }
            else if ('---'===lines[0] && this.start===this.end) { return (window.noveld.options.thematicBreak) ? Parser.thematicBreak : Parser.html}
            else { return Parser.html }
        }
    }
    class Parser {
        static break(lines) { return '<br>'.repeat(lines.length-1) + '\n' }
        static thematicBreak(lines) { return `<div class="scene-change${(window.noveld.options.thematicBreakBorder) ? ' scene-change-border' : ''}"><p>${window.noveld.options.thematicBreakText}</p></div>\n` }
        static html(lines) { return lines.join('\n') + '\n' }
        static newline(lines) { return lines.slice(1).join('\n') }
    }
    class RubyParser {
        #SHORT = /([一-龠々仝〆〇ヶ]{1,50})《([^｜《》\n\r]{1,20})》/g
        #LONG = /｜([^｜《》\n\r]{1,50})《([^｜《》\n\r]{1,20})》/g
        #ESCAPE = /｜《/g
        parse(src) { return this.#escape([this.#LONG, this.#SHORT].reduce((src, reg)=>
                src.replace(reg, (match, rb, rt)=>{ return this.#toHtml(rb, rt) }), src)) }
        #escape(src) { return src.replace(this.#ESCAPE, (match)=>'《') }
        #toHtml(rb, rt) { return `<ruby>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>` }
    }
    window.noveld = window.noveld || new Noveld()
})();

