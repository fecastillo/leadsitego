var field_data = [
    {
        "name": "telefono",
        "values": [
           "+541162561227"
        ]
     },
    {
       "name": "nombre_completo",
       "values": [
          "David Orlando Rosales"
       ]
    },
    
    {
       "name": "ciudad",
       "values": [
          "Buenos Aires"
       ]
    }
 ];
 
    var itego =  new Object();
    var obj = new Object();

    field_data.forEach(function(element) {obj[element.name] = element.values[0];})
    obj.telefono = parseInt("7"+obj.telefono.substring(obj.telefono.length - 10));
    itego.token = "TokenDinero";
    itego.prospecto = obj;

 console.log(itego);
 