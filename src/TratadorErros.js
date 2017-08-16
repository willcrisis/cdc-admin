import PubSub from "pubsub-js";

export default class TratadorErros {
    publicarErros(erros) {
        erros.forEach(erro => {
            PubSub.publish('field-error', erro)
        })
    }
}