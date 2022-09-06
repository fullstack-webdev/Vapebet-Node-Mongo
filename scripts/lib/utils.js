Array.prototype.sum = function() { for(var s = 0, i = this.length; i; s += this[--i]); return s; };
Array.prototype.empty = function() { while(this.length > 0){ this.pop(); } };
Array.prototype.copy = function() { var ret = []; for(var i=0;i<this.length;i++){ ret.push(this[i]); } return ret; };

var socket = io.connect(CONFIG.hostUrl, {'connect timeout': 1000});

Utils = {
    showNotification: function(msg){
        $.bootstrapGrowl(msg, {
            ele: 'body',
            type: 'danger',
            offset: {from: 'top', amount: 80},
            align: 'right',
            width: 250,
            delay: 2000,
            allow_dismiss: true,
            stackup_spacing: 5
        });
    },
    userDetails: function(id, cb){
        var jqXHR=$.ajax({
            type: 'GET',
            url: '/api/v1/user/'+id,
            dataType: "json",
            success: function(data){
                if (data.success === true){
                    cb(null, data.user);
                }
            }
        });
    },
    emit: function(eventName, data){
        socket.emit(eventName, data);
    }
};