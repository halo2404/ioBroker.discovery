var tools = require(__dirname + '/../tools.js');

var reName = /^<\?xml.*Unit_Name=\"(.*?)\".*YamahaRemoteControl/;

function detect(ip, device, options, callback) {
    if (device._source !== 'ip') return callback(null, false, ip);
    
    tools.httpGet('http://' + ip + '/YamahaRemoteControl/desc.xml', function (err, data) {
        var ar;
        if (!err && data && (ar = reName.exec(data)) && ar.length >= 2) {
            var instance = tools.findInstance (options, 'yamaha', function (obj) {
                return obj.native.ip === ip;
            });
            if (!instance) {
                var name = ar[1];
                name = name || device._name ? device._name : '';
                instance = {
                    _id: tools.getNextInstanceID ('yamaha', options),
                    common: {
                        name: 'yamaha',
                        title: 'Yamaha (' + ip + (name ? (' - ' + name) : '') + ')'
                    },
                    native: {
                        ip: ip,
                        intervall: 120,
                        useRealtime: true,
                        refreshOnRealtime: true
                    },
                    comment: {
                        add: [ar[1], name, ip]
                    }
                };
                options.newInstances.push (instance);
                return callback (null, true, ip);
            }
        }
        callback(null, false, ip);
    });
}

exports.detect = detect;
exports.type = ['ip'];
