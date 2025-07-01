(function(){
class BlockParser {
    constructor() {
        this.ruby = new RubyParser()
        this.em = new EmParser()
        this.wb = new WordBreakParser()
        this.paragraph = new Paragraph(this.ruby, this.em)
        this.heading = new Heading(this.ruby, this.em)
    }
    parse(block) {
//        block = block.sanitaize() // < > & ' " をHTMLエスケープ文字(&lt;等)に変換する
        console.log(block)
        block = this.wb.parse(block.sanitaize())
        console.log(block)
        if ('#'===block.trim()) { }// 改段/改頁
        else if ('==='===block.trim()) { } // 改頁
        else if (block.startsWith('# ')) { return this.heading.parse(block.slice(2)) } // 見出し
        else { return this.paragraph.parse(block) } // 段落
    }
    toEl(block) { return this.#text2El(this.parse(block)) }
    #text2El(html) {
        const el = document.createElement('div')
        el.innerHTML = html
        return el.firstChild
    }
}
class Paragraph { // <p><br><em></em><ruby><rt><rt><rp></rp></ruby>プレーンテキスト</p>
    constructor(ruby, em) { this.ruby = ruby; this.em = em; }
    parse(text) { return '<p>' + this.ruby.parse(this.em.parse(text.split(/\r|\r?\n/).join('<br>'))) + '</p>' }
}
class Heading { // <h1><em></em><ruby><rt><rt><rp></rp></ruby>任意テキスト</h1>
    constructor(ruby, em) { this.ruby = ruby; this.em = em; }
    parse(text) { return `<h2>` + this.ruby.parse(this.em.parse(text.split(/\r|\r?\n/).join('<br>'))) + '</h2>' }
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
class EmParser {
    #REGEX_DOT = /《《([^\n]{1,50}?)》》/g;
    parse(text) {
        return text.replace(this.#REGEX_DOT, (match, p1)=>{
            const text = [...p1].map(a => `<span>${a}</span>`).join('');
            return `<em class="emphasis">${text}</em>`;
        });
    }
}
class WordBreakParser {
//    #REGEX = /([^\&])([a-zA-Z0-9_\-\:\+\@]{2,})([^;])/g;
//    #REGEX = /([^\&])([a-zA-Z0-9_\-\:\+\@]{2,})([^\;])/g;
//    #REGEX = /[^\&]([a-zA-Z0-9_\-\:\+\@]{2,})[^\;]/g;
//    #REGEX = /[^\<\/]([a-zA-Z0-9_\-\:\+\@]{2,})/g;
    #REGEX = /([a-zA-Z0-9_\-\:\+\@\&\;]{2,})/g; // & ; はHTMLエスケープのメタ文字である。これも含めること
//    #REGEX = /([a-zA-Z0-9_\-\:\+\@]{2,})/g;
    parse(text) {
        return text.replace(this.#REGEX, (match, p1)=>{
//        return text.replace(this.#REGEX, (match, p1, p2, p3)=>{
//            return `<span class="word-break">${p1}${p2}${p3}</span>`
//            return `<span class="word-break">${p2}</span>`
//            return `<span class="word-break">${p1}</span>`
            // HTMLエスケープ文字ならそのまま返し、それ以外なら英単語として折り返さない単位spanにして返す
            return (p1.startsWith('&') && p1.endsWith(';')) ? p1 : `<span class="word-break">${p1}</span>`
        });
    }
}

window.blockParser = new BlockParser()
})()
