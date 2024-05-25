# Project 3 CS50 Web: Mail
## Descripción
En el proyecto se nos ha solicitado crear el frontend para una aplicación de correos con las siguientes opciones: crear, ver, archivar, desarchivar, leer y responder.
### Crear
Para compose_email() hemos creado una función asíncrona que se encargue de hacer un fetch de tipo post a nuestra base de datos, recogiendo el resultado de la operación 
realizada por el usuario. Si la acción es exitosa se recarga al usuario en la view de sent para ver el correo que acaba de enviar. Si no, mostramos el mensaje de error 
obtenido al usuario. Para implementar esta función hemos desactivado el comportamiento default del input, para que no haga submit y logre obtener el reponse.json(), en 
caso que el email sea enviado correctamente, se llama a la función load_mailbox() para cargar la mailbox correspondiente.
### Ver 
Para ver los emails hemos creado una función asíncrona que se encargue de hacer un fetch de tipo get para obtener todos los correos correspondientes al mailbox cargado.
Mediante la función listEmail a cada correo se le asigna un div con la clase correspondiente, además de un evento "click", el cual se encarga de llamar a la función 
viewEmail, la cual nos llevará a la vista del correo.
### Archivar
Para archivar hemos creado una función asíncrona de tipo put, la cual se encargará marcar al correo como archivado; después mostrará la vista de inbox.
### Desarchivar
Realizamos el mismo proceso que en archivar, pero marcamos el correo como desarchivado.
### Leer
Para leer el correo hemos creado una función asíncrone de tipo get, que obtenga el correo correspondiente al id del que el usuario haya clickeado. Luego, llamaremos a 
la función viewEmail para que muestre la vista del correo con la información correspondiente. Mientras la vista sea sent, se mostrará un botón al usuario para poder 
responder al correo seleccionado.
### Responder
Para responder hemos creado una función que redirija al usuario a compose, con la particularidad que este va a preopoblar los inputs con la información correspondiente a
responder un email.
## Mostrar vista carga en URL
Para mostrar la página carga en la URL hemos utilizado la API del historial de JavaScript para, en caso de que el push state sea true, se envié a la URL la string
correspondiente a la vista cargada. Si el usuario intenta ir a la anterior página, se usará windows.onpopstate para ver cual es la mailbox que corresponde a la view 
visitada anteriormente con la información correspondiente a su carga; información que obtiene del push state. Las views tienen como default false para no crear 
información en el historial cuando aún no hay nada que actualizar, se llama false en los backwards para no crear nueva información en el historial que pueda crear posibles
ciclos o redundancias en el historial.
