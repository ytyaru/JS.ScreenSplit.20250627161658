(function(){
class ManuscriptFileLoader {// 原稿（<input type="file">）
    load() {
        const dialog = document.createElement('dialog');
        const el = document.createElement('input');
        el.type = 'file';
//        el.click();
        dialog.append(el);
        dialog.show();
        document.querySelector(':root').append(dialog);
    }
}
(new ManuscriptFileLoader()).load(); // File chooser dialog can only be shown with a user activation.
})();
