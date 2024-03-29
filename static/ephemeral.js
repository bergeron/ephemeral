/* ephemeral.js */

$(document).ready(function(){
    $('#options').find('input[type=checkbox]').on('click', function(){
        $(this).closest('.option').children('input').prop('disabled', function(i, v){
            if(!v){$(this).val('');}
            return !v;
        });
    });

    /* iOS hack to force "cut copy paste" keyboard */
    if(/iPhone|iPad|iPod/i.test(navigator.userAgent)){
        $('.link').parent().attr('contenteditable', 'true');
    }

    $('.link').on('click', function () {
        var sel = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(this);
        sel.removeAllRanges();
        sel.addRange(range);
    });
});

function create(message){
    if($('#pwdCheck').is(':checked')){
        encrypt(message, $('#pwd').val());
        return false;
    } else {
        return true;
    }
}

function encrypt(message, password){
    if(!message){
        message = " ";
    }

    var salt = CryptoJS.lib.WordArray.random(128/8).toString();
    var key = CryptoJS.PBKDF2(password, salt, { keySize: 128/32 }).toString();
    var encryptedText = CryptoJS.AES.encrypt(message, key).toString();
    var expireMinutes = $('#expire').val();

    $.ajax({
        method: 'POST',
        url: '/create/client/',
        data: {
            text:           encryptedText,
            expireMinutes:  expireMinutes,
            salt:           salt
        }
    })
    .done(function(data) {
        $('#clientEncryptedUrl').html(data);
        $('#result').show();
        $(window).scrollTop(10000);
    })
    .fail(function(status, err){
        console.log(status + ' ' + err);
    });
}

function decrypt(password){
    try {
        var key = CryptoJS.PBKDF2(password, salt, { keySize: 128/32 }).toString();
        var decrypted = CryptoJS.AES.decrypt(encryptedText, key).toString(CryptoJS.enc.Utf8).split("\n").join("<br>");
        
        if(decrypted){
            $('#decryptedMessage').html('');
            var lines = decrypted.split('<br>');
            for(var i=0; i < lines.length; i++){
                $('#decryptedMessage').append(escapeHtml(lines[i]) + '<br>');
            }
        }
    } catch (e) {return false;}  /* Error when incorrect key doesn't generate UTF8 */

    return false;
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
