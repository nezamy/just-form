// Element.prototype.matchesSelector
(function (x) {
    let i;
    if (!x.matchesSelector) {
        for (i in x) {
            if (/^\S+MatchesSelector$/.test(i)) {
                x.matchesSelector = x[i];
                break;
            }
        }
    }
}(Element.prototype));

Document.prototype.on =
    Element.prototype.on = function (eventType, selector, handler) {
        this.addEventListener(eventType, function listener(event) {
            let t = event.target,
                type = event.type,
                x = [];
            if (event.detail && event.detail.selector === selector && event.detail.handler === handler) {
                return this.removeEventListener(type, listener, true);
            }
            while (t) {
                if (t.matchesSelector && t.matchesSelector(selector)) {
                    t.addEventListener(type, handler, false);
                    x.push(t);
                }
                t = t.parentNode;
            }
            setTimeout(function () {
                let i = x.length - 1;
                while (i >= 0) {
                    x[i].removeEventListener(type, handler, false);
                    i -= 1;
                }
            }, 0);
        }, true);
    };

Document.prototype.off =
    Element.prototype.off = function (eventType, selector, handler) {
        let event = document.createEvent('CustomEvent');
        event.initCustomEvent(eventType, false, false, {selector: selector, handler: handler});
        this.dispatchEvent(event);
    };

Document.ready = function (callback) {
    if (document.readyState === 'complete' || document.readyState !== 'loading') {
        callback();
    } else {
        document.addEventListener('DOMContentLoaded', callback);
    }
};

Object.prototype.merge = function() {
    for (let prop in arguments) {
        if (!arguments.hasOwnProperty(prop)) continue;
        let argument = arguments[prop];
        for (let key in argument) {
            if (!argument.hasOwnProperty(key)) continue;
            if (this.hasOwnProperty(key) && this[key] instanceof Object){
                this[key].merge(argument[key]);
            }else{
                this[key] = argument[key];
            }
        }
    }
    return this;
};

Object.prototype.forEach = function (call) {
    for (let key in this) {
        if (this.hasOwnProperty(key)) {
            call(key, this[key]);
        }
    }
};

if (typeof Object.create !== "function") {
    Object.create = function (proto, propertiesObject) {
        if (typeof proto !== 'object' && typeof proto !== 'function') {
            throw new TypeError('Object prototype may only be an Object: ' + proto);
        } else if (proto === null) {
            throw new Error("This browser's implementation of Object.create is a shim and doesn't support 'null' as the first argument.");
        }

        if (typeof propertiesObject != 'undefined') {
            throw new Error("This browser's implementation of Object.create is a shim and doesn't support a second argument.");
        }

        function F() {}
        F.prototype = proto;

        return new F();
    };
}

class justFrom{
    constructor(options){
        this.options = {
            ajax: false,
            progress: false
        };
        this.options.merge(options);
        this.options.justForm = this;
        this.data = new FormData();
        this.init();
    }

    init(){
        if(this.progress){
            this.progress();
        }
    }

    upload(options){
        return new justFromUpload(this.options, options);
    }

    submit(callback){
        document.querySelector('#' + this.options.id).addEventListener('submit', callback);
    }

    getData(){
        let self = this;
        this.serialize().forEach(function (k,v) {
            self.append(k,v);
        });
        return this.data;
    }

    serialize(){
        let form =  document.querySelector('#' + this.options.id);
        if (!form || form.nodeName !== "FORM") {
            return;
        }
        let i, j,
            obj = {};
        for (i = form.elements.length - 1; i >= 0; i = i - 1) {
            if (form.elements[i].name === "") {
                continue;
            }
            switch (form.elements[i].nodeName) {
                case 'INPUT':
                    switch (form.elements[i].type) {
                        case 'checkbox':
                        case 'radio':
                            if (form.elements[i].checked) {
                                obj[form.elements[i].name] = form.elements[i].value;
                            }
                            break;
                        case 'file':
                            break;
                        default:
                            obj[form.elements[i].name] = form.elements[i].value;
                    }
                    break;
                case 'TEXTAREA':
                    obj[form.elements[i].name] = form.elements[i].value;
                    break;
                case 'SELECT':
                    switch (form.elements[i].type) {
                        case 'select-one':
                            obj[form.elements[i].name] = form.elements[i].value;
                            break;
                        case 'select-multiple':
                            for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                                if (form.elements[i].options[j].selected) {
                                    obj[form.elements[i].name] = form.elements[i].options[j].value;
                                }
                            }
                            break;
                    }
                    break;
                case 'BUTTON':
                    switch (form.elements[i].type) {
                        case 'reset':
                        case 'submit':
                        case 'button':
                            obj[form.elements[i].name] = form.elements[i].value;
                            break;
                    }
                    break;
            }
        }
        return obj;

    }

    append(key, val){
        let self = this;
        if(val instanceof Object || val instanceof Array){
            val.forEach(function (k, v) {
                self.data.append(key + '['+ k +']', v);
            });
        }else{
            self.data.append(key, val);
        }
    }

    reset(){
        this.data = new FormData();
    }

    progress(){
        let html = document.createElement("div");
        html.className = 'just-upload-loader-overly';
        html.style.display = 'none';
        html.innerHTML = '<div><span class="just-upload-loader"> </span> <span class="just-upload-loader-text"></span></div>';
        document.querySelector('#' + this.options.id).appendChild(html);
    }

    progressShow(text){
        let progress =  document.querySelector('#' + this.options.id + ' .just-upload-loader-overly');
        if(progress){
            progress.style.display = 'block';
            if(text){
                progress.querySelector('.just-upload-loader-text').innerText = text;
            }
        }
    }

    progressHide(){
        let progress =  document.querySelector('#' + this.options.id + ' .just-upload-loader-overly');
        if(progress){
            progress.style.display = 'none';
        }
    }

    errors(r){
        if(r.status >= 400 && r.status < 404){
            console.error(r.response);
        }else {
            console.error(r.statusText);
        }
    }

    // setError(input, message){
    //
    // }
}

class justFromUpload {
    constructor(formOptions, options){
        this.formOptions = formOptions;
        this.options = {
            multipleSelect: false,
            multiple: false,
            thumbs: {
                width: '100px',
                height: '100px'
            }
        };
        this.options.merge(options);
        this.files = {};
        this.count = 0;
        this.filesCount = 0;
        this.formInit();
        this.init();
        this.removeThumb();
    }

    formInit(){
        let form = document.querySelector('#'+ this.formOptions.id);
        let self = this;
        if(!form.hasAttribute('enctype') || form.getAttribute('enctype') !== 'multipart/form-data' ){
            form.setAttribute('enctype', 'multipart/form-data');
        }

        if(!this.formOptions.ajax){
            this.formOptions.justForm.submit(function (e) {
                e.preventDefault();
                self.removeFile(self.count);
                this.submit();
            });
        }
    }

    init(){
        let fileInput;
        let self = this;
        if(this.options.hasOwnProperty('name')){
            fileInput = document.querySelector('#'+ this.formOptions.id +' [name*='+ this.options.name +']');
            // this.target = fileInput;
            if(fileInput.hasAttribute("multiple")){
                this.options.multiple = true;
            }

            if(fileInput.hasAttribute("accept")){
                this.options.type = fileInput.getAttribute("accept").split(',').map(function (str) {
                    return str.trim();
                });
            }

            if(this.options.multipleSelect){
                fileInput.setAttribute('name', this.options.name + '[]');
            }else{
                if(this.options.multiple){
                    fileInput.setAttribute('name', this.options.name + '['+ self.count +']');
                }
                fileInput.removeAttribute('multiple');
            }
            fileInput.style.display = 'none';
            this.style = 'width: '+ self.options.thumbs.width +'; height: '+ self.options.thumbs.height;
            fileInput.parentElement.innerHTML += '<br><div class="just-upload-thumbs_'+ this.options.name +'"></div><button type="button" id="justUploadBtn_'+ this.options.name +'"  style="'+ this.style +'" class="just-upload-add">+</button><div id="justInputError_'+ this.options.name +'" class="valid-msg"></div>';
            this.uploadButton();
        }

        document.on('change', '#'+ this.formOptions.id +' [name^='+ this.options.name +']', function (e) {
            let files = e.target.files;
            if(!e.target.files) return;

            if(self.options.multiple && self.options.multipleSelect){
                for(let i=0; i < files.length; i++) {
                    self.validate(files[i], function (file) {
                        self.files = [];
                        self.files.push(file);
                        self.addThumb(file);
                        self.addFile(e);
                        self.filesCount++;
                    });
                }
            }else if(self.options.multiple){
                self.validate(files[0], function (file) {
                    self.files[self.count] = file;
                    self.addThumb(file);
                    self.addFile(e);
                    self.filesCount++;
                });

            }else{
                self.validate(files[0], function (file) {
                    self.files[self.count] = file;
                    if(!file){
                        return self.addThumb(file, true);
                    }
                    self.addThumb(file, true);
                });
            }
        });
    }

    validate(file, callback){
        this.errors = [];
        if(this.options.max !== undefined && this.filesCount >= this.options.max){
            this.errors.push('max files upload is ' + this.options.max);
        }

        // if(this.options.type !== undefined && !file.type.match(this.options.type)){
        //     this.errors.push('Must be upload files has type ' + this.options.type);
        // }

        if(this.options.type !== undefined){

            let typeMatch = false;
            if( this.options.type.indexOf( file.name.split('.').pop() ) === 0 ){
                typeMatch = true;
                console.log( file.type);
            }

            this.options.type.forEach(function (v) {
                if(file.type.match(v)){
                    typeMatch = true;
                    console.log( file.type);
                }
            });

            if(!typeMatch){
                this.errors.push('Must be upload files has type ' + this.options.type.toString());
            }
        }

    // .indexOf('.')
    // .split('.').pop()

        // console.log();
        // if(e.target.files.length > 5){
        //     $('.error').text('You Can\'t upload more than 5 images');
        //     return ;
        // }
        //
        // $.each(e.target.files, function(key, value) {
        //     if (!value.type.match('image.*')) {
        //         $('.error').text('You Can upload images only');
        //         return ;
        //     }
        // });

        if(!this.errors.length){
            callback(file);
            this.clearErrors();
        }else{
            document.querySelector("#justInputError_"+ this.options.name).innerText = this.errors[0];
            console.log(this.errors[0]);
        }
    }

    clearErrors(){
        document.querySelector("#justInputError_"+ this.options.name).innerText = '';
    }

    getFileSize(bytes) {
        if (typeof bytes !== 'number') {
            return '';
        }

        if (bytes >= 1000000000) {
            return (bytes / 1000000000).toFixed(2) + ' GB';
        }

        if (bytes >= 1000000) {
            return (bytes / 1000000).toFixed(2) + ' MB';
        }

        return (bytes / 1000).toFixed(2) + ' KB';
    }

    addThumb(file, replace=false){
        if(file){
            let self = this;
            let reader = new FileReader();
            reader.onloadstart = function () {
                self.formOptions.justForm.progressShow(' Loading ...');
            };

            reader.onloadend = function () {
                self.formOptions.justForm.progressHide();
            };

            reader.onload = (function() {
                let thumbsDiv = document.querySelector('.' + 'just-upload-thumbs_' + self.options.name);
                let html = '';
                if(file.type.match('image/*')){
                    html = '<div class="thumb" style="'+ self.style +'"><span data-index="'+ (self.count - 1) +'">x</span><img src="'+ reader.result +'" ><div class="info"><div class="name">'+ file.name +'</div><div class="size">File Size : '+ self.getFileSize(file.size) +'</div></div></div>';
                }else if(file.type.match('video/*')){
                    html = '<div class="thumb" style="'+ self.style +'"><span data-index="'+ (self.count - 1) +'">x</span><video src="' + reader.result + '" width="'+ self.options.thumbs.width +'" height="'+ self.options.thumbs.height +'" controls></video><div class="info"><div class="name">'+ file.name +'</div><div class="size">File Size : '+ self.getFileSize(file.size) +'</div></div></div>';
                }else{
                    html = '<div class="thumb" style="'+ self.style +';padding: 20px" ><span data-index="'+ (self.count - 1) +'">x</span><div class="info"><div class="name">'+ file.name +'</div><div class="size">File Size : '+ self.getFileSize(file.size) +'</div></div></div>';
                }
                if(replace){
                    thumbsDiv.innerHTML = html;
                }else {
                    thumbsDiv.innerHTML += html;
                }
            });

            reader.readAsDataURL(file);
        }else if(replace){
            this.removeThumb(true);
        }
    }

    removeThumb(replace=false){
        if(replace){
            document.querySelector('.' + 'just-upload-thumbs_' + this.options.name).innerHTML = '';
            document.querySelector('#' + this.formOptions.id +' [name="'+ this.options.name +'"]').value = '';
        }else{
            this.removeButton();
        }
    }

    removeButton(){
        let self = this;
        document.on('click', '.just-upload-thumbs_'+ this.options.name +' .thumb span', function (e) {
            if(!self.options.multiple){
                document.querySelector('.' + 'just-upload-thumbs_' + self.options.name).innerHTML = '';
                document.querySelector('#' + self.formOptions.id +' [name="'+ self.options.name +'"]').value = '';
            }else{
                let index = e.target.getAttribute('data-index');
                self.removeFile(index);
                e.target.parentNode.remove();
                self.filesCount--;
            }
        });
    }

    addFile(e){
        let input = document.createElement("input");
        input.type = "file";
        if(this.options.multipleSelect){
            input.multiple = true;
            input.name = this.options.name + '[]';
        }else{
            input.name = this.options.name + '['+ ++this.count +']';
        }
        input.style.display = 'none';
        e.target.parentElement.appendChild(input);
        e.target.style.display = 'none';
        this.formOptions.justForm.reset();
        this.formOptions.justForm.append(this.options.name, this.files);
    }

    removeFile(index){
        let file;
        if(!this.options.multipleSelect){
            delete this.files[index];
        }
        if(this.options.multiple){
            file = document.querySelector('#' + this.formOptions.id +' [name="'+ this.options.name+'['+ index +']"]');
            file.parentNode.removeChild(file);
        }
        this.formOptions.justForm.reset();
        this.formOptions.justForm.append(this.options.name, this.files);
    }

    input(){
        return this.files;
    }

    uploadButton(){
        let self = this;
        document.on('click', '#justUploadBtn_'+ this.options.name, function (e) {
            let last;
            if(self.options.multiple){
                last = document.querySelector('#' + self.formOptions.id +' [name="'+ self.options.name+'['+ self.count +']"]');
            }else{
                last = document.querySelector('#' + self.formOptions.id +' [name="'+ self.options.name +'"]');
            }
            last.click();
        });
    }

}

let Just = {};

Just.form = function(opt){
    return new justFrom(opt);
};
