(function(){
class Cover {
    constructor() { this.front=null; this.back=null; }
    get Front() { return this.front }
    get Back() { return this.back }
    make() { this.#makeFront(); this.#makeBack(); }
    #makeBack() { }
    #makeFront() {
        this.front = `<div class="front-cover">
    ${this.#title()}
    ${this.#catch()}
    ${this.#intro()}
    ${this.#genres()}
    ${this.#selfRatings()}
    ${this.#wordCount()}
    ${this.#author()}
</div>`
        console.log(this.front)
        this.#isWithin()
    }
    #isWithin() {
        if (!dummyScreen.isWithinOnce(this.front, true)) { throw new Error('表紙が一画面内に収まりません。テキストを短くする等して一画面内に収まるようにしてください。') }
        /*
        dummyScreen.screen.innerHTML = this.front
        const isWithin = dummyScreen.isWithin(dummyScreen.screen.querySelector('*:last-child'))
        dummyScreen.clear()
        if (!isWithin) { throw new Error('表紙が一画面内に収まりません。テキストを短くする等して一画面内に収まるようにしてください。') }
        */
    }
    #parseEl(text) { return blockParser.parse(text).children[0].outerHTML }
    #title() {
        if (!manuscript.Meta.hasOwnProperty('title')) { return '' }
        return `<h1 class="title">${blockParser.toEl(manuscript.Meta.title).innerHTML}</h1>`
    }
    #catch() {
        if (!manuscript.Meta.hasOwnProperty('catch')) { return '' }
        return `<h2 class="catch">${blockParser.toEl(manuscript.Meta.catch).innerHTML}</h2>`
    }
    #intro() {
        if (!manuscript.Meta.hasOwnProperty('intro')) { return '' }
        return `<p class="intro">${blockParser.toEl(manuscript.Meta.intro).innerHTML}</p>`
    }
    #genres() {
        if (!manuscript.Meta.hasOwnProperty('genres')) { return '' }
        return GenreList.toHtml(manuscript.Meta.genres)
        //const li = manuscript.Meta.genres.map(g=>`<li>${g}</li>`).join('')
        //return `<ul class="genres breadcrumb">${li}</ul>`
    }
    #selfRatings() {
        if (!manuscript.Meta.hasOwnProperty('selfRatings')) { return '' }
        const li = manuscript.Meta.selfRatings.map(g=>`<li title="${g}描写あり"><b>${g}</b></li>`).join('')
        return `<ul class="rating flexs">${li}</ul>`
    }
    #wordCount() {
        if (!manuscript.Meta.hasOwnProperty('wordCount')) { return '' }
        return `<div class="word-count"><span class="count">${manuscript.Meta.wordCount}</span><span class="unit">字</span></div>`
    }
    #author() {
        if (!manuscript.Meta.hasOwnProperty('author')) { return '' }
        if (!manuscript.Meta.author.hasOwnProperty('name')) { return '' }
        return `<br><div class="author">${this.#authorName()}${this.#authorDonate()}</div>`
    }
    #authorName() {
        //const name = blockParser.parse(manuscript.Meta.author.name).innerHTML
        const name = blockParser.toEl(manuscript.Meta.author.name).innerHTML
        console.log(manuscript.Meta.author)
        console.log(manuscript.Meta.author.name)
        console.log(blockParser.toEl(manuscript.Meta.author.name))
        console.log(name)
        return (manuscript.Meta.author.hasOwnProperty('url')) 
                ? `<a class="name" href="${manuscript.Meta.author.url}">${name}</a>`
                : `<div class="name">${name}</div>`
    }
    #authorDonate() {
        if (!manuscript.Meta.author.hasOwnProperty('donates')) { return '' }
        const coins = []
        for (let coin of Object.keys(manuscript.Meta.author.donates)) {
            coins.push(this.#authorDonateCoin(coin, manuscript.Meta.author.donates[coin]))
        }
        return `<div class="donates">${coins.join('')}</div>`
    }
    #authorDonateCoin(coin, address) {
        switch(coin) {
            case 'monacoin': return ''
            case 'bitcoin': return ''
            default: return ''
        }
    }
}
class GenreList {
    static toHtml(genres, delimiter='>') {
        const items = genres.join(`,${delimiter},`).split(',')
        const spans = items.map((item, i)=>{
            const style = (0 === (i % 2)) ? '' : `padding-inline:0.5em; display:inline-block; transform:scale(0.75);`
//            const [style, text] = [((0 === (i % 2))) ? '' : `padding-inline:0.5em; display:inline-block; transform:scale(0.75);`), text]
            return `<span style="${style}">${item}</span>`
        })
        return `<div class="genre-breadcrumb" style="display:flex;">${spans.join('')}</div>`
    }
}
/*
    const GenreList = (genres, delimiter='>') => {
        const items = genres.join(`,${delimiter},`).split(',')
        const spans = items.map((item, i)=>((0 === (i % 2))) ? span(item) : span({style:()=>`padding-inline:0.5em; display:inline-block; transform:scale(0.75);`}, item))
        return div({class:'genre-breadcrumb', style:'display:flex;'}, spans)
    }
*/
window.cover = new Cover()
})()
