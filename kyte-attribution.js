const ATT_PARAMS = [
	'aid',
	'cid',
	'email',
	'fbclid',
	'gclid',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'referral',
];

// Define método para inclusão de AID
function kyteAttSetAid(aid) {
    var kyteAtt = JSON.parse(localStorage.getItem('kyteAtt') || '{}');
    kyteAtt.aid = aid;
    localStorage.setItem('kyteAtt', JSON.stringify(kyteAtt));
    kyteAttUpdateDate()
}

function kyteAttUpdateDate() {
    var kyteAtt = localStorage.getItem('kyteAtt');
    var kyteAttSent = localStorage.getItem('kyteAttSent');
    if(kyteAtt !== '{}' && kyteAtt !== kyteAttSent) {
        // Send
        const xhrReceive = new XMLHttpRequest();
        xhrReceive.open('post', 'https://kyte-api-gateway.azure-api.net/attribution-save');
        xhrReceive.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhrReceive.send(kyteAtt);
        xhrReceive.onreadystatechange = function(){
            localStorage.setItem('kyteAttSent', kyteAtt);
        }
    }
}

(function(){
	// Bloqueio do serviço
	if(
		window.location.href.indexOf('kyte.link') !== -1 ||
		window.location.href.indexOf('kyte.com.br/ajuda') !== -1 ||
		window.location.href.indexOf('appkyte.com/ayuda') !== -1 ||
		window.location.href.indexOf('kyteapp.com/help') !== -1
	) return

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '/client.min.js';
    document.head.appendChild(script);
    window.addEventListener('load', function(event){
        try{
            var kyteAtt = JSON.parse(localStorage.getItem('kyteAtt') || '{}');
            console.log(Number(localStorage.getItem('kyteAttExp')))
            if(Number(localStorage.getItem('kyteAttExp')) < new Date().getTime()){
                localStorage.removeItem('kyteAttSent');
                kyteAtt = {};
            }
            // Controle de fingerprint
            if(kyteAtt && !kyteAtt.kid) kyteAtt.kid = (new ClientJS()).getFingerprint();

            // Extrair variáveis de interessa da URL do site
            var urlParams = location.search.substring(1).split('&');
            urlParams.forEach(function(v){
                var p = v.split('=');
                if (ATT_PARAMS.indexOf(p[0]) !== -1 && !!p[1] && p[1] !== 'undefined') kyteAtt[p[0]] = p[1];
            });
            // Armazenamento
            localStorage.setItem('kyteAtt', JSON.stringify(kyteAtt));
            localStorage.setItem('kyteAttExp', new Date().getTime() + 2592000000); // 30 dias em milisegundos
            kyteAttUpdateDate();
        } catch(err) {
            localStorage.removeItem('kyteAtt');
            localStorage.removeItem('kyteAttSent');
            localStorage.removeItem('kyteAttExp');
            console.log('kyte-attribution.js error', err.message);
        }
    });
})();