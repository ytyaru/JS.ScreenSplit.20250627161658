(function(){
class ManuscriptLoader {// 原稿（読込、解析、妥当性確認、デフォルトフォーマット出力）
    static fromString(...args) {// 文字列（平文の原稿）
       
    }
    static fromBase64(...args) {// Base64URL（平文の原稿をCompression APIで圧縮したバイナリをBase64URL化したテキスト）

    }
    static fromUrl(...args) {// URL（原稿ファイル直リンク）
        fetch(args[0]).then(res=>res.text()}).then(text=>{
            if (args[0].startsWith('https://')) {
                if ('zip gz gzip'.split(' ').some(e=>args[0].endsWith('.'+e))) {
                }
                return text;
//                if ('txt md jd'.split(' ').some(e=>args[0].endsWith('.'+e))) {return text;}
            }
            else if (args[0].startsWith('data:text/plain;charset=UTF-8;base64,')) {

            }
        });
    }
    static fromBlob(...args) {// Blob（ファイルを開くUIで指示されたBlobオブジェクト）
        
    }
    static fromElement(...args) {// Element（<textarea>,<div contenteditable>）

    }
    constructor(...args) {
        if (Type.isStr()) {
            if (args[0].startsWith('https://')) {
                ManuscriptLoader.fromUrl(...args).then((manuscript)=>this._str=manuscript;)
            }
            else if (args[0].startsWith('data:text/plain;charset=UTF-8;base64,')) {
                // Compression API
            }
            else {// 平文
                this._str = args[0];
            }
        }
        /*
        else if (args[0] instanceof Blob) {
        }
        else if (args[0] instanceof Uint8Array) {
        }
        */
        else if (Type.isElm()) {

        }
        else {throw new TypeError(``)}
        this._str = null; // 原稿（文字列データ）
    }
}
})();
