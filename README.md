# just-form
form validation and upload  native html usage

## Usage
```html
<form id="form" method="post">
    <div>
        <input type="file" id="files" name="file" accept="image/*, video/*" multiple>
    </div><br>
    <div>
        Name :
        <input type="text" name="name" placeholder="name">
    </div><br>
    <div>
        Email :
        <input type="email" name="email" placeholder="Email">
    </div>

    <button>upload</button>
</form>
<script src="/public/js/just.js"></script>
<link rel="stylesheet" href="/public/css/just.css">
```

## native

```js
    Document.ready(function () {
        let form = Just.form({
            id: 'form',
        });

        let file = form.upload({
            name:'file',
            max: 2,
            thumbs: {
                width: '100px',
                height: '100px'
            }
        });


    });
```

## Ajax

```js
    Document.ready(function () {
        let form = Just.form({
            id: 'form',
            ajax: true,
            progress: true,
        });

        let file = form.upload({
            name:'file',
            max: 2,
            thumbs: {
                width: '200px',
                height: '200px'
            }
        });

        form.submit(function (e) {
            e.preventDefault();
            form.progressShow();

            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
//                    console.log(this.responseText);

                }else if(this.readyState == 4){
                    form.errors(this);
                }
                form.progressHide();
            };
            xhttp.open("POST", "/", true);
            xhttp.send(form.getData());
        });

    });

```
