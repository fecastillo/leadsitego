var itego =  new Object();
const TokenDinero = "5476255A-D84D-4F7B-87B2-C72B3CA8085B";
const TokenVivienda = "83D6D11D-D029-40C9-AB1E-AB423C63598C";

var body = {"object":"page","entry":[{"id":"102858741624226","time":1640876343,"changes":[{"value":{"ad_id":"23849651968300182","form_id":"82595106832717","leadgen_id":"769224190664558","created_time":1640876342,"page_id":"102858741624226","adgroup_id":"23849651968300182"},"field":"leadgen"}]}]};
var form = body.entry[0].changes[0].value.form_id;

var field_data = [{"name":"nombre_completo","values":["Mili Ramírez"]},{"name":"número_de_teléfono","values":["+541140877953"]},{"name":"ciudad","values":["Berazategui"]}];
//form_dinero = 825951068323717
//form_vivienda = 324624565904200
itego.token = form == 825951068323717 ? TokenDinero : TokenVivienda;
itego.prospecto = new Object();
itego.prospecto.nombre_completo = field_data[0].values[0];
itego.prospecto.número_de_teléfono = parseInt("7"+field_data[1].values[0].substring(field_data[1].values[0].length - 10));
itego.prospecto.ciudad = field_data[2].values[0];

console.log(itego);